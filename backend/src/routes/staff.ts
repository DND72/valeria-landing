import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'

import { requireClerkAuth, requireStaff } from '../middleware/clerkAuth.js'
import { registerStaffClientRoutes } from './staffClientsRoutes.js'
import { serviceKindFromEventName } from '../lib/consultServiceLabel.js'
import { registerStaffBlogCommentRoutes } from './staffBlogCommentsRoutes.js'
import { registerStaffReviewRoutes } from './staffReviewsRoutes.js'
import { registerStaffAnalyticsRoutes } from './staffAnalyticsRoutes.js'
import { registerStaffBookingRoutes } from './staffBooking.js'
import { askLenormandMentor } from '../lib/lenormandRAG.js'
import { 
  generateConsultationSummary, 
  generateLiveOracleInsight 
} from '../lib/gemini.js'

const noteBody = z.object({
  body: z.string().min(1).max(20000),
})

const presenceBody = z.object({
  status: z.enum(['online', 'busy', 'offline']),
})

const patchConsult = z
  .object({
    status: z.enum(['scheduled', 'pending_payment', 'done', 'cancelled']).optional(),
    clerk_user_id: z.string().min(1).max(128).nullable().optional(),
    is_free_consult: z.boolean().optional(),
    meeting_link: z.string().nullable().optional(),
  })
  .refine(
    (o) =>
      o.status !== undefined ||
      o.clerk_user_id !== undefined ||
      o.is_free_consult !== undefined ||
      o.meeting_link !== undefined,
    {
      message: 'Almeno un campo',
    }
  )

export function createStaffRouter(pool: Pool): Router {
  const r = Router()
  r.use(requireClerkAuth, requireStaff)

  r.get('/appointments-today', async (_req, res) => {
    try {
      const { rows } = await pool.query<{
        id: string;
        invitee_name: string | null;
        invitee_email: string | null;
        start_at: string | null;
        end_at: string | null;
        consult_kind: string;
        meeting_link: string | null;
        status: string;
      }>(`
        SELECT id, invitee_name, invitee_email, start_at, end_at, consult_kind, meeting_link, status
        FROM consults
        WHERE start_at >= CURRENT_DATE - INTERVAL '1 day' 
          AND start_at < CURRENT_DATE + INTERVAL '2 days'
          AND status IN ('scheduled', 'client_waiting', 'in_progress')
        ORDER BY start_at ASC
      `)

      const meetings = rows.map(r => ({
        id: r.id,
        startAt: r.start_at ? new Date(r.start_at).toISOString() : '',
        endAt: r.end_at ? new Date(r.end_at).toISOString() : null,
        eventName: r.consult_kind,
        inviteeSummary: `${r.invitee_name || 'Senza nome'} (${r.invitee_email || 'No email'})`,
        joinUrl: r.meeting_link,
        status: r.status
      }))

      res.json({ configured: true, meetings })
    } catch (e) {
      console.error('[staff today]', e)
      res.status(500).json({ error: 'Errore server' })
    }
  })

  r.get('/presence', async (_req, res) => {
    try {
      const { rows } = await pool.query<{ status: string; updated_at: Date }>(
        `SELECT status, updated_at FROM staff_presence_singleton WHERE id = 1`
      )
      const row = rows[0]
      res.json({
        status: row?.status ?? 'offline',
        updatedAt: row?.updated_at ? new Date(row.updated_at).toISOString() : null,
      })
    } catch (e) {
      console.error('[staff presence get]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.patch('/presence', async (req, res) => {
    const parsed = presenceBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }
    try {
      await pool.query(
        `INSERT INTO staff_presence_singleton (id, status, updated_at)
         VALUES (1, $1, now())
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           updated_at = now()`,
        [parsed.data.status]
      )
      const { rows } = await pool.query<{ status: string; updated_at: Date }>(
        `SELECT status, updated_at FROM staff_presence_singleton WHERE id = 1`
      )
      const row = rows[0]!
      res.json({
        status: row.status,
        updatedAt: new Date(row.updated_at).toISOString(),
      })
    } catch (e) {
      console.error('[staff presence patch]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.get('/clients-week', async (_req, res) => {
    try {
      const totalRes = await pool.query<{ n: string }>(
        `SELECT COUNT(DISTINCT LOWER(TRIM(invitee_email)))::text AS n
         FROM consults
         WHERE invitee_email IS NOT NULL AND TRIM(invitee_email) <> ''`
      )
      const totalDistinctEmails = Number(totalRes.rows[0]?.n ?? 0)

      const { rows } = await pool.query<{
        id: string
        invitee_email: string
        invitee_name: string | null
        start_at: Date
        end_at: Date | null
        status: string
        is_free_consult: boolean
        consult_kind: string
        meeting_link: string | null
      }>(
        `SELECT id, invitee_email, invitee_name, start_at, end_at, status, is_free_consult, consult_kind, meeting_link
         FROM consults
         WHERE invitee_email IS NOT NULL AND TRIM(invitee_email) <> ''
           AND start_at IS NOT NULL
           AND start_at >= NOW()
           AND start_at < NOW() + INTERVAL '7 days'
           AND status <> 'cancelled'
         ORDER BY LOWER(TRIM(invitee_email)) ASC, start_at ASC`
      )

      type Slot = {
        id: string
        startAt: string
        endAt: string | null
        status: string
        isFreeConsult: boolean
        eventName: string
        joinUrl: string | null
      }
      const map = new Map<string, { email: string; name: string | null; slots: Slot[] }>()
      for (const row of rows) {
        const key = row.invitee_email.toLowerCase().trim()
        if (!map.has(key)) {
          map.set(key, {
            email: row.invitee_email.trim(),
            name: row.invitee_name,
            slots: [],
          })
        }
        map.get(key)!.slots.push({
          id: row.id,
          startAt: new Date(row.start_at).toISOString(),
          endAt: row.end_at ? new Date(row.end_at).toISOString() : null,
          status: row.status,
          isFreeConsult: row.is_free_consult,
          eventName: row.consult_kind,
          joinUrl: row.meeting_link
        })
      }

      res.json({
        totalDistinctEmails,
        windowLabel: 'Prossimi 7 giorni (database consulti)',
        clients: [...map.values()],
      })
    } catch (e) {
      console.error('[staff clients-week]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.get('/consults', async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT c.id, c.clerk_user_id, c.status, c.is_free_consult,
                c.meeting_join_url, c.meeting_provider, 
                COALESCE(c.invitee_email, bp.email_normalized) as invitee_email, 
                COALESCE(c.invitee_name, bp.first_name || ' ' || bp.last_name, bp.email_normalized) as invitee_name,
                c.start_at, c.end_at, c.paypal_order_id, c.created_at, c.updated_at,
                c.consult_kind, c.status_billing
         FROM consults c
         LEFT JOIN client_billing_profiles bp ON c.clerk_user_id = bp.clerk_user_id
         ORDER BY c.start_at DESC NULLS LAST, c.created_at DESC
         LIMIT 200`
      )
      res.json({
        consults: rows.map((row) => ({
          ...row,
          service_kind: serviceKindFromEventName(
            null
          ),
        })),
      })
    } catch (e) {
      console.error('[staff consults]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.patch('/consults/:id', async (req, res) => {
    const id = req.params.id
    const parsed = patchConsult.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }
    const { status, clerk_user_id: clerkUserId, is_free_consult: isFree, meeting_link: meetingLink } = parsed.data
    try {
      const exists = await pool.query(`SELECT id FROM consults WHERE id = $1`, [id])
      if (exists.rows.length === 0) {
        res.status(404).json({ error: 'Consulto non trovato' })
        return
      }
      const sets: string[] = ['updated_at = now()']
      const vals: unknown[] = []
      let i = 1
      if (status !== undefined) {
        sets.push(`status = $${i++}`)
        vals.push(status)
      }
      if (clerkUserId !== undefined) {
        sets.push(`clerk_user_id = $${i++}`)
        vals.push(clerkUserId)
      }
      if (isFree !== undefined) {
        sets.push(`is_free_consult = $${i++}`)
        vals.push(isFree)
      }
      if (meetingLink !== undefined) {
        sets.push(`meeting_link = $${i++}`)
        vals.push(meetingLink)
        sets.push(`meeting_join_url = $${i++}`)
        vals.push(meetingLink)
      }
      vals.push(id)
      await pool.query(`UPDATE consults SET ${sets.join(', ')} WHERE id = $${i}`, vals)
      const row = await pool.query(
        `SELECT id, clerk_user_id, status, is_free_consult,
                meeting_join_url, invitee_email, start_at, end_at, consult_kind, updated_at,
                cost_credits, status_billing
         FROM consults WHERE id = $1`,
        [id]
      )
      const r0 = row.rows[0]!
      res.json({
        consult: {
          ...r0,
        },
      })
    } catch (e) {
      console.error('[staff patch consult]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.get('/consults/:id', async (req, res) => {
    const id = req.params.id
    try {
      const c = await pool.query(
        `SELECT id, clerk_user_id, status, is_free_consult,
                meeting_join_url, meeting_provider, invitee_email, invitee_name,
                start_at, end_at, paypal_order_id, consult_kind, created_at, updated_at,
                cost_credits, status_billing
         FROM consults WHERE id = $1`,
        [id]
      )
      if (c.rows.length === 0) {
        res.status(404).json({ error: 'Consulto non trovato' })
        return
      }
      const notes = await pool.query(
        `SELECT id, staff_clerk_user_id, body, created_at, updated_at
         FROM consult_notes WHERE consult_id = $1 ORDER BY created_at ASC`,
        [id]
      )
      const row = c.rows[0]!
      res.json({
        consult: {
          ...row,
          service_kind: serviceKindFromEventName(
            null
          ),
        },
        notes: notes.rows,
      })
    } catch (e) {
      console.error('[staff consult detail]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  registerStaffClientRoutes(r, pool)
  registerStaffReviewRoutes(r, pool)
  registerStaffBlogCommentRoutes(r, pool)
  registerStaffAnalyticsRoutes(r, pool)
  registerStaffBookingRoutes(r, pool)

  r.post('/consults/:id/notes', async (req, res) => {
    const id = req.params.id
    const userId = req.auth?.userId
    const parsed = noteBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    try {
      const exists = await pool.query(`SELECT 1 FROM consults WHERE id = $1`, [id])
      if (exists.rows.length === 0) {
        res.status(404).json({ error: 'Consulto non trovato' })
        return
      }
      const ins = await pool.query(
        `INSERT INTO consult_notes (consult_id, staff_clerk_user_id, body, updated_at)
         VALUES ($1, $2, $3, now())
         RETURNING id, staff_clerk_user_id, body, created_at, updated_at`,
        [id, userId, parsed.data.body]
      )
      res.status(201).json({ note: ins.rows[0] })
    } catch (e) {
      console.error('[staff note]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.post('/consults/:id/claim', async (req, res) => {
    const id = req.params.id
    const { actualDurationMinutes } = req.body
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      const { rows } = await client.query(
         `SELECT clerk_user_id, cost_credits, status, status_billing, consult_kind 
          FROM consults WHERE id = $1 FOR UPDATE`, 
         [id]
      )
      
      if (rows.length === 0) {
        await client.query('ROLLBACK')
        res.status(404).json({ error: 'Consulto non trovato' })
        return
      }
      const consult = rows[0]
      if (consult.status_billing === 'billed') {
        await client.query('ROLLBACK')
        res.status(400).json({ error: 'Fondi già incassati per questo consulto' })
        return
      }

      const { rows: typingRows } = await client.query(`SELECT valeria_typing_seconds, consult_kind FROM consults WHERE id = $1`, [id])
      const valeriaWritingSecs = typingRows[0]?.valeria_typing_seconds || 0
      const consultKind = typingRows[0]?.consult_kind

      // Calcola i costi effettivi scalati (Tariffazione pura al minuto per tutte le offerte)
      let actualCost = consult.cost_credits
      const baseRates: Record<string, number> = {
         'chat_flash': 1.3,
         'chat_prenotabile': 1.0,
         'tarocchi_flash': 1.3,
         'tarocchi_prenotabile': 1.0,
         'coaching_flash': 1.5,
         'coaching_prenotabile': 1.2,
         'combo_flash': 1.7,
         'combo_prenotabile': 1.4,
         'protocollo_protetto': 1.8,
         'free': 0
      }
      
      const rate = consultKind && baseRates[consultKind] !== undefined ? baseRates[consultKind] : 1.0;
      actualCost = Math.ceil(rate * Math.max(1, actualDurationMinutes));
      
      // Sicurezza: non addebitare mai più dei crediti approvati nel wallet bloccato inizialmente
      actualCost = Math.min(actualCost, consult.cost_credits);
      
      let refundAmount = consult.cost_credits - actualCost;
      if (refundAmount < 0) refundAmount = 0;

      if (consult.cost_credits > 0 && consult.clerk_user_id) {
        // Scala definitivamente dai blocchi
        await client.query(
          `UPDATE wallets SET 
             balance_locked = balance_locked - $1, 
             balance_available = balance_available + $2,
             updated_at = now() 
           WHERE clerk_user_id = $3`,
          [consult.cost_credits, refundAmount, consult.clerk_user_id]
        )
        // Ledger entry (costo effettivo consulto)
        if (actualCost > 0) {
          await client.query(
            `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'staff_claim', $3)`,
            [consult.clerk_user_id, actualCost, id]
          )
        }
        // Ledger entry (refund)
        if (refundAmount > 0) {
          await client.query(
             `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'unlock_refund', $3)`,
             [consult.clerk_user_id, refundAmount, id]
          )
        }
      }

      // Evidenzia operazione terminata
      await client.query(
        `UPDATE consults SET status = 'done', status_billing = 'billed', updated_at = now() WHERE id = $1`,
        [id]
      )

      await client.query('COMMIT')
      res.json({ ok: true, actualCost, valeriaWritingSeconds: valeriaWritingSecs })
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('[staff claim]', e)
      res.status(500).json({ error: 'Errore database' })
    } finally {
      client.release()
    }
  })

  r.post('/consults/:id/no-show', async (req, res) => {
    const id = req.params.id
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      const { rows } = await client.query(
         `SELECT clerk_user_id, cost_credits, status, status_billing 
          FROM consults WHERE id = $1 FOR UPDATE`, 
         [id]
      )
      
      if (rows.length === 0) {
        await client.query('ROLLBACK')
        res.status(404).json({ error: 'Consulto non trovato' })
        return
      }
      const consult = rows[0]
      if (consult.status_billing === 'billed') {
        await client.query('ROLLBACK')
        res.status(400).json({ error: 'Fondi già processati per questo consulto' })
        return
      }

      if (consult.cost_credits > 0 && consult.clerk_user_id) {
        // Penale 5 crediti per il tempo perso di Valeria
        const penale = 5
        const toRefund = consult.cost_credits - penale > 0 ? consult.cost_credits - penale : 0
        const effectivePenale = consult.cost_credits - toRefund
        
        await client.query(
          `UPDATE wallets SET 
             balance_locked = balance_locked - $1, 
             balance_available = balance_available + $2,
             updated_at = now() 
           WHERE clerk_user_id = $3`,
          [consult.cost_credits, toRefund, consult.clerk_user_id]
        )
        // Ledger entry 1: refund remainder
        if (toRefund > 0) {
          await client.query(
            `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'unlock_refund', $3)`,
            [consult.clerk_user_id, toRefund, id]
          )
        }
        // Ledger entry 2: penalty
        if (effectivePenale > 0) {
           await client.query(
            `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'no_show_penalty', $3)`,
            [consult.clerk_user_id, effectivePenale, id]
          )
        }
      }

      await client.query(
        `UPDATE consults SET status = 'cancelled', status_billing = 'billed', updated_at = now() WHERE id = $1`,
        [id]
      )

      await client.query('COMMIT')
      res.json({ ok: true })
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('[staff no-show]', e)
      res.status(500).json({ error: 'Errore database' })
    } finally {
      client.release()
    }
  })

  r.post('/consults/:id/reject', async (req, res) => {
    const id = req.params.id
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const { rows } = await client.query(
         `SELECT clerk_user_id, cost_credits, status_billing FROM consults WHERE id = $1 FOR UPDATE`, 
         [id]
      )
      if (rows.length === 0) {
        await client.query('ROLLBACK')
        res.status(404).json({ error: 'Non trovato' })
        return
      }
      const c = rows[0]
      if (c.status_billing === 'billed') {
        await client.query('ROLLBACK')
        res.status(400).json({ error: 'Già processato' })
        return
      }
      if (c.cost_credits > 0 && c.clerk_user_id) {
        await client.query(
          `UPDATE wallets SET balance_locked = balance_locked - $1, balance_available = balance_available + $1, updated_at = now() WHERE clerk_user_id = $2`,
          [c.cost_credits, c.clerk_user_id]
        )
        await client.query(
          `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'unlock_refund', $3)`,
          [c.clerk_user_id, c.cost_credits, id]
        )
      }
      await client.query(`UPDATE consults SET status = 'cancelled', status_billing = 'billed', updated_at = now() WHERE id = $1`, [id])
      await client.query('COMMIT')
      res.json({ ok: true })
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('[staff reject]', e)
      res.status(500).json({ error: 'Errore' })
    } finally { client.release() }
  })

  r.post('/lenormand-mentor', async (req, res) => {
    const { query } = req.body
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query mancante' })
      return
    }
    try {
      const response = await askLenormandMentor(query)
      res.json({ response })
    } catch (e: any) {
      console.error('[staff lenormand-mentor]', e)
      res.status(500).json({ error: 'Errore durante la consultazione del Mentore' })
    }
  })

  r.post('/consults/:id/summarize', async (req, res) => {
    const id = req.params.id
    const userId = req.auth?.userId
    const { transcript, clientName } = req.body
    
    if (!transcript) return res.status(400).json({ error: 'Trascrizione mancante' })
    if (!userId) return res.status(401).json({ error: 'Non autenticato' })

    try {
      const summary = await generateConsultationSummary(transcript, clientName || 'Cliente')
      
      // Salvataggio come nota speciale
      const body = `✨ **RIASSUNTO AI DEL CONSULTO** ✨\n\n${summary}\n\n*Nota: Questo riassunto è stato generato automaticamente dalla trascrizione video.*`
      
      const ins = await pool.query(
        `INSERT INTO consult_notes (consult_id, staff_clerk_user_id, body, updated_at)
         VALUES ($1, $2, $3, now())
         RETURNING id, body, created_at`,
        [id, userId, body]
      )
      
      res.json({ ok: true, note: ins.rows[0] })
    } catch (e) {
      console.error('[staff summarize]', e)
      res.status(500).json({ error: 'Errore generazione riassunto' })
    }
  })

  // Richiesta Oracolo Live (Sussurro di Gemini)
  r.post('/live-oracle', async (req, res) => {
    try {
      const { transcript, cards, astral } = req.body
      const insight = await generateLiveOracleInsight(transcript || "", cards || [], astral || null)
      res.json({ insight })
    } catch (error: any) {
      console.error('[live-oracle route] Error:', error)
      res.status(500).json({ error: error.message })
    }
  })

  return r
}

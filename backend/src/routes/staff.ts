import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { getStaffAvailabilityOrError } from '../lib/calendlyAvailability.js'
import {
  getStaffScheduledMeetingsOrError,
  getStaffTodayMeetingsOrError,
} from '../lib/calendlyScheduledMeetings.js'
import { requireClerkAuth, requireStaff } from '../middleware/clerkAuth.js'
import { registerStaffClientRoutes } from './staffClientsRoutes.js'
import { serviceKindFromEventName } from '../lib/consultServiceLabel.js'
import { registerStaffBlogCommentRoutes } from './staffBlogCommentsRoutes.js'
import { registerStaffReviewRoutes } from './staffReviewsRoutes.js'
import { registerStaffAnalyticsRoutes } from './staffAnalyticsRoutes.js'
import { askLenormandMentor } from '../lib/lenormandRAG.js'

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
  })
  .refine((o) => o.status !== undefined || o.clerk_user_id !== undefined || o.is_free_consult !== undefined, {
    message: 'Almeno un campo',
  })

export function createStaffRouter(pool: Pool): Router {
  const r = Router()
  r.use(requireClerkAuth, requireStaff)

  r.get('/calendly-availability', async (_req, res) => {
    try {
      const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN
      const payload = await getStaffAvailabilityOrError(token)
      res.json(payload)
    } catch (e) {
      console.error('[staff calendly-availability]', e)
      res.status(500).json({ error: 'Errore server' })
    }
  })

  r.get('/calendly-scheduled-meetings', async (_req, res) => {
    try {
      const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN
      const payload = await getStaffScheduledMeetingsOrError(token)
      res.json(payload)
    } catch (e) {
      console.error('[staff calendly-scheduled-meetings]', e)
      res.status(500).json({ error: 'Errore server' })
    }
  })

  r.get('/calendly-today', async (_req, res) => {
    try {
      const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN
      const payload = await getStaffTodayMeetingsOrError(token)
      res.json(payload)
    } catch (e) {
      console.error('[staff calendly-today]', e)
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
      }>(
        `SELECT id, invitee_email, invitee_name, start_at, end_at, status, is_free_consult
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
        `SELECT id, clerk_user_id, calendly_event_uri, status, is_free_consult,
                meeting_join_url, meeting_provider, invitee_email, invitee_name,
                start_at, end_at, paypal_order_id, calendly_event_name, created_at, updated_at
         FROM consults
         ORDER BY start_at DESC NULLS LAST, created_at DESC
         LIMIT 200`
      )
      res.json({
        consults: rows.map((row) => ({
          ...row,
          service_kind: serviceKindFromEventName(
            typeof row.calendly_event_name === 'string' ? row.calendly_event_name : null
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
    const { status, clerk_user_id: clerkUserId, is_free_consult: isFree } = parsed.data
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
      vals.push(id)
      await pool.query(`UPDATE consults SET ${sets.join(', ')} WHERE id = $${i}`, vals)
      const row = await pool.query(
        `SELECT id, clerk_user_id, calendly_event_uri, status, is_free_consult,
                meeting_join_url, invitee_email, start_at, end_at, calendly_event_name, updated_at,
                cost_credits, status_billing
         FROM consults WHERE id = $1`,
        [id]
      )
      const r0 = row.rows[0]!
      res.json({
        consult: {
          ...r0,
          service_kind: serviceKindFromEventName(
            typeof r0.calendly_event_name === 'string' ? r0.calendly_event_name : null
          ),
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
        `SELECT id, clerk_user_id, calendly_event_uri, calendly_invitee_uri, status, is_free_consult,
                meeting_join_url, meeting_provider, invitee_email, invitee_name,
                start_at, end_at, paypal_order_id, calendly_event_name, raw_payload, created_at, updated_at,
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
            typeof row.calendly_event_name === 'string' ? row.calendly_event_name : null
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
        res.status(400).json({ error: 'Fondi già incassati per questo consulto' })
        return
      }

      if (consult.cost_credits > 0 && consult.clerk_user_id) {
        // Scala definitivamente dai blocchi
        await client.query(
          `UPDATE wallets SET balance_locked = balance_locked - $1, updated_at = now() WHERE clerk_user_id = $2`,
          [consult.cost_credits, consult.clerk_user_id]
        )
        // Ledger entry (costo effettivo consulto)
        await client.query(
          `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'staff_claim', $3)`,
          [consult.clerk_user_id, consult.cost_credits, id]
        )
      }

      // Evidenzia operazione terminata
      await client.query(
        `UPDATE consults SET status = 'done', status_billing = 'billed', updated_at = now() WHERE id = $1`,
        [id]
      )

      await client.query('COMMIT')
      res.json({ ok: true })
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

  return r
}

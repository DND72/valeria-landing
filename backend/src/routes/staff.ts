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
                start_at, end_at, paypal_order_id, created_at, updated_at
         FROM consults
         ORDER BY start_at DESC NULLS LAST, created_at DESC
         LIMIT 200`
      )
      res.json({ consults: rows })
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
                meeting_join_url, invitee_email, start_at, end_at, updated_at
         FROM consults WHERE id = $1`,
        [id]
      )
      res.json({ consult: row.rows[0] })
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
                start_at, end_at, paypal_order_id, raw_payload, created_at, updated_at
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
      res.json({ consult: c.rows[0], notes: notes.rows })
    } catch (e) {
      console.error('[staff consult detail]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  registerStaffClientRoutes(r, pool)

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

  return r
}

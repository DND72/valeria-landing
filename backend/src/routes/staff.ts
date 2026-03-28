import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { getStaffAvailabilityOrError } from '../lib/calendlyAvailability.js'
import { getStaffScheduledMeetingsOrError } from '../lib/calendlyScheduledMeetings.js'
import { requireClerkAuth, requireStaff } from '../middleware/clerkAuth.js'

const noteBody = z.object({
  body: z.string().min(1).max(20000),
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

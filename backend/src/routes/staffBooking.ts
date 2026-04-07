import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'

const availabilitySchema = z.object({
  day_of_week: z.number().min(0).max(6),
  week_number: z.number().min(1).max(2),
  slot_label: z.string(),
  is_active: z.boolean(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:MM
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),   // HH:MM
})

const overrideSchema = z.object({
  override_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  is_available: z.boolean(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  reason: z.string().max(200).optional(),
})

export function registerStaffBookingRoutes(r: Router, pool: Pool): void {
  
  // --- DISPONIBILITÀ SETTIMANALE ---
  
  r.get('/booking/availability', async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT day_of_week, week_number, slot_label, is_active, 
                TO_CHAR(start_time, 'HH24:MI') as start_time, 
                TO_CHAR(end_time, 'HH24:MI') as end_time,
                updated_at
         FROM booking_availability 
         ORDER BY week_number ASC, day_of_week ASC, slot_label ASC`
      )
      res.json({ availability: rows })
    } catch (e) {
      console.error('[staff booking availability get]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.post('/booking/availability', async (req, res) => {
    const parsed = availabilitySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }
    const { day_of_week, week_number, slot_label, is_active, start_time, end_time } = parsed.data
    try {
      await pool.query(
        `INSERT INTO booking_availability (day_of_week, week_number, slot_label, is_active, start_time, end_time, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())
         ON CONFLICT (day_of_week, week_number, slot_label) DO UPDATE SET
           is_active = EXCLUDED.is_active,
           start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time,
           updated_at = now()`,
        [day_of_week, week_number, slot_label, is_active, start_time + ':00', end_time + ':00']
      )
      res.json({ ok: true })
    } catch (e) {
      console.error('[staff booking availability post]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  // --- OVERRIDES (CHIUSURE STRAORDINARIE) ---

  r.get('/booking/overrides', async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, override_date, is_available, 
                TO_CHAR(start_time, 'HH24:MI') as start_time, 
                TO_CHAR(end_time, 'HH24:MI') as end_time,
                reason, created_at
         FROM booking_overrides 
         WHERE override_date >= CURRENT_DATE - INTERVAL '1 day'
         ORDER BY override_date ASC`
      )
      res.json({ overrides: rows })
    } catch (e) {
      console.error('[staff booking overrides get]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.post('/booking/overrides', async (req, res) => {
    const parsed = overrideSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }
    const { override_date, is_available, start_time, end_time, reason } = parsed.data
    try {
      await pool.query(
        `INSERT INTO booking_overrides (override_date, is_available, start_time, end_time, reason, created_at)
         VALUES ($1, $2, $3, $4, $5, now())`,
        [
          override_date, 
          is_available, 
          start_time ? start_time + ':00' : null, 
          end_time ? end_time + ':00' : null, 
          reason || null
        ]
      )
      res.json({ ok: true })
    } catch (e) {
      console.error('[staff booking overrides post]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.delete('/booking/overrides/:id', async (req, res) => {
    const { id } = req.params
    try {
      await pool.query(`DELETE FROM booking_overrides WHERE id = $1`, [id])
      res.json({ ok: true })
    } catch (e) {
      console.error('[staff booking overrides delete]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })
}

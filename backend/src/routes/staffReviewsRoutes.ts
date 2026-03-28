import type { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'

const staffReviewPatch = z.object({
  status: z.enum(['pending', 'published', 'hidden']).optional(),
  staffResponse: z.string().max(8000).nullable().optional(),
})

export function registerStaffReviewRoutes(r: Router, pool: Pool): void {
  r.get('/reviews', async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, clerk_user_id, author_display_name, rating, body, status,
                staff_response, staff_responded_at, published_at, created_at, updated_at
         FROM site_reviews
         ORDER BY created_at DESC
         LIMIT 300`
      )
      res.json({
        reviews: rows.map((row) => ({
          id: row.id,
          clerkUserId: row.clerk_user_id,
          authorDisplayName: row.author_display_name,
          rating: row.rating,
          body: row.body,
          status: row.status,
          staffResponse: row.staff_response,
          staffRespondedAt: row.staff_responded_at
            ? new Date(row.staff_responded_at).toISOString()
            : null,
          publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString(),
        })),
      })
    } catch (e) {
      console.error('[staff reviews list]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.patch('/reviews/:id', async (req, res) => {
    const id = req.params.id
    const parsed = staffReviewPatch.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }
    const { status, staffResponse } = parsed.data
    if (status === undefined && staffResponse === undefined) {
      res.status(400).json({ error: 'Nessun campo da aggiornare' })
      return
    }
    try {
      const exists = await pool.query(`SELECT id FROM site_reviews WHERE id = $1`, [id])
      if (exists.rows.length === 0) {
        res.status(404).json({ error: 'Recensione non trovata' })
        return
      }

      const sets: string[] = ['updated_at = now()']
      const vals: unknown[] = []
      let i = 1
      if (status !== undefined) {
        sets.push(`status = $${i++}`)
        vals.push(status)
        if (status === 'published') {
          sets.push(`published_at = COALESCE(published_at, now())`)
        } else {
          sets.push(`published_at = NULL`)
        }
      }
      if (staffResponse !== undefined) {
        sets.push(`staff_response = $${i++}`)
        vals.push(staffResponse)
        sets.push(`staff_responded_at = now()`)
      }
      vals.push(id)
      await pool.query(`UPDATE site_reviews SET ${sets.join(', ')} WHERE id = $${i}`, vals)

      const row = await pool.query(
        `SELECT id, clerk_user_id, author_display_name, rating, body, status,
                staff_response, staff_responded_at, published_at, created_at, updated_at
         FROM site_reviews WHERE id = $1`,
        [id]
      )
      const r0 = row.rows[0]
      res.json({
        review: {
          id: r0.id,
          clerkUserId: r0.clerk_user_id,
          authorDisplayName: r0.author_display_name,
          rating: r0.rating,
          body: r0.body,
          status: r0.status,
          staffResponse: r0.staff_response,
          staffRespondedAt: r0.staff_responded_at
            ? new Date(r0.staff_responded_at).toISOString()
            : null,
          publishedAt: r0.published_at ? new Date(r0.published_at).toISOString() : null,
          createdAt: new Date(r0.created_at).toISOString(),
          updatedAt: new Date(r0.updated_at).toISOString(),
        },
      })
    } catch (e) {
      console.error('[staff reviews patch]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })
}

import type { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { getPrimaryEmailNormalized, hasCompletedPaidConsult } from '../lib/reviewEligibility.js'

const reviewBody = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().min(20).max(8000),
  authorDisplayName: z.string().min(2).max(80).trim(),
})

export function registerMeReviewRoutes(r: Router, pool: Pool): void {
  r.get('/reviews/eligibility', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    try {
      const emailNorm = await getPrimaryEmailNormalized(userId)
      const eligible = await hasCompletedPaidConsult(pool, userId, emailNorm)
      const existing = await pool.query(
        `SELECT id, status, rating, body, author_display_name, created_at, staff_response, staff_responded_at
         FROM site_reviews WHERE clerk_user_id = $1`,
        [userId]
      )
      const row = existing.rows[0]
      let canEdit = false
      if (eligible) {
        if (!row) canEdit = true
        else if (row.status === 'pending' || row.status === 'hidden') canEdit = true
      }
      res.json({
        eligible,
        canEdit,
        review: row
          ? {
              id: row.id,
              status: row.status,
              rating: row.rating,
              body: row.body,
              authorDisplayName: row.author_display_name,
              createdAt: new Date(row.created_at).toISOString(),
              staffResponse: row.staff_response,
              staffRespondedAt: row.staff_responded_at
                ? new Date(row.staff_responded_at).toISOString()
                : null,
            }
          : null,
      })
    } catch (e) {
      console.error('[me reviews eligibility]', e)
      res.status(500).json({ error: 'Errore server' })
    }
  })

  r.post('/reviews', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    const parsed = reviewBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Dati non validi', details: parsed.error.flatten() })
      return
    }
    try {
      const emailNorm = await getPrimaryEmailNormalized(userId)
      const eligible = await hasCompletedPaidConsult(pool, userId, emailNorm)
      if (!eligible) {
        res.status(403).json({ error: 'Servono almeno un consulto a pagamento completato prima di recensire.' })
        return
      }

      const { rating, body, authorDisplayName } = parsed.data
      const existing = await pool.query<{ id: string; status: string }>(
        `SELECT id, status FROM site_reviews WHERE clerk_user_id = $1`,
        [userId]
      )
      const ex = existing.rows[0]

      if (ex?.status === 'published') {
        res.status(409).json({ error: 'Hai già una recensione pubblicata sul sito.' })
        return
      }

      if (!ex) {
        const ins = await pool.query(
          `INSERT INTO site_reviews (clerk_user_id, author_display_name, rating, body, status, updated_at)
           VALUES ($1, $2, $3, $4, 'pending', now())
           RETURNING id, status, rating, body, author_display_name, created_at`,
          [userId, authorDisplayName, rating, body]
        )
        res.status(201).json({ review: mapRow(ins.rows[0]) })
        return
      }

      if (ex.status === 'pending' || ex.status === 'hidden') {
        const upd = await pool.query(
          `UPDATE site_reviews SET
             author_display_name = $2,
             rating = $3,
             body = $4,
             status = CASE WHEN status = 'hidden' THEN 'pending' ELSE status END,
             updated_at = now()
           WHERE id = $1 AND clerk_user_id = $5
           RETURNING id, status, rating, body, author_display_name, created_at`,
          [ex.id, authorDisplayName, rating, body, userId]
        )
        res.json({ review: mapRow(upd.rows[0]) })
        return
      }

      res.status(409).json({ error: 'Stato recensione non modificabile.' })
    } catch (e) {
      console.error('[me reviews post]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })
}

function mapRow(row: {
  id: string
  status: string
  rating: number
  body: string
  author_display_name: string
  created_at: Date
}): Record<string, unknown> {
  return {
    id: row.id,
    status: row.status,
    rating: row.rating,
    body: row.body,
    authorDisplayName: row.author_display_name,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

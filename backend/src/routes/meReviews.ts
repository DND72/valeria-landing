import type { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import {
  countPaidDoneConsults,
  getPrimaryEmailNormalized,
  maxClientReviewsAllowed,
} from '../lib/reviewEligibility.js'

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
      const paidDone = await countPaidDoneConsults(pool, userId, emailNorm)
      const maxAllowed = maxClientReviewsAllowed(paidDone)

      const cnt = await pool.query<{ pub: string; pend: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'published')::text AS pub,
           COUNT(*) FILTER (WHERE status = 'pending')::text AS pend
         FROM site_reviews
         WHERE clerk_user_id = $1 AND source = 'client'`,
        [userId]
      )
      const published = Number(cnt.rows[0]?.pub ?? 0)
      const pending = Number(cnt.rows[0]?.pend ?? 0)

      const pendingRow = await pool.query(
        `SELECT id, status, rating, body, author_display_name, created_at, staff_response, staff_responded_at
         FROM site_reviews
         WHERE clerk_user_id = $1 AND source = 'client' AND status = 'pending'
         LIMIT 1`,
        [userId]
      )
      const pend = pendingRow.rows[0]

      const publishedRows = await pool.query(
        `SELECT id, status, rating, body, author_display_name, created_at, staff_response, staff_responded_at
         FROM site_reviews
         WHERE clerk_user_id = $1 AND source = 'client' AND status = 'published'
         ORDER BY published_at DESC NULLS LAST, created_at DESC
         LIMIT 20`,
        [userId]
      )

      const canSubmitNew = pending === 0 && published < maxAllowed
      const canEditPending = Boolean(pend)

      let reasonHint: string | null = null
      if (paidDone < 3) {
        reasonHint =
          'La prima recensione sul sito si sblocca dopo il terzo consulto a pagamento completato, così riflette un percorso.'
      } else if (!canSubmitNew && !canEditPending) {
        reasonHint = `Puoi avere al massimo ${maxAllowed} recensione/i sul sito con il tuo percorso attuale (${paidDone} consulti completati). Ne servono altri prima di poterne aggiungere una nuova.`
      }

      res.json({
        paidConsultsCompleted: paidDone,
        maxReviewsAllowed: maxAllowed,
        clientReviewsPublished: published,
        hasPendingReview: pending > 0,
        canSubmitNew,
        canEditPending,
        reasonHint,
        pendingReview: pend
          ? {
              id: pend.id,
              status: pend.status,
              rating: pend.rating,
              body: pend.body,
              authorDisplayName: pend.author_display_name,
              createdAt: new Date(pend.created_at).toISOString(),
              staffResponse: pend.staff_response,
              staffRespondedAt: pend.staff_responded_at
                ? new Date(pend.staff_responded_at).toISOString()
                : null,
            }
          : null,
        publishedReviews: publishedRows.rows.map((row) => ({
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
        })),
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
      const paidDone = await countPaidDoneConsults(pool, userId, emailNorm)
      const maxAllowed = maxClientReviewsAllowed(paidDone)
      if (maxAllowed === 0) {
        res.status(403).json({
          error:
            'Servono almeno tre consulti a pagamento completati prima della prima recensione sul sito.',
        })
        return
      }

      const cnt = await pool.query<{ pub: string; pend: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'published')::text AS pub,
           COUNT(*) FILTER (WHERE status = 'pending')::text AS pend
         FROM site_reviews
         WHERE clerk_user_id = $1 AND source = 'client'`,
        [userId]
      )
      const published = Number(cnt.rows[0]?.pub ?? 0)
      const pending = Number(cnt.rows[0]?.pend ?? 0)

      if (pending > 0) {
        res.status(409).json({
          error: 'Hai già una recensione in moderazione. Modificala dalla stessa schermata o attendi l’esito.',
        })
        return
      }
      if (published >= maxAllowed) {
        res.status(403).json({
          error:
            'Con il numero di consulti completati hai già raggiunto il massimo di recensioni consentito. Il percorso si allunga: ne potrai aggiungere altre dopo nuovi consulti completati.',
        })
        return
      }

      const { rating, body, authorDisplayName } = parsed.data
      const ins = await pool.query(
        `INSERT INTO site_reviews (source, clerk_user_id, author_display_name, rating, body, status, updated_at)
         VALUES ('client', $1, $2, $3, $4, 'pending', now())
         RETURNING id, status, rating, body, author_display_name, created_at`,
        [userId, authorDisplayName, rating, body]
      )
      res.status(201).json({ review: mapRow(ins.rows[0]) })
    } catch (e) {
      console.error('[me reviews post]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.patch('/reviews/:id', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    const id = req.params.id
    const parsed = reviewBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Dati non validi', details: parsed.error.flatten() })
      return
    }
    try {
      const row = await pool.query(
        `SELECT id, status FROM site_reviews
         WHERE id = $1 AND clerk_user_id = $2 AND source = 'client'`,
        [id, userId]
      )
      if (row.rows.length === 0) {
        res.status(404).json({ error: 'Recensione non trovata' })
        return
      }
      if (row.rows[0].status !== 'pending') {
        res.status(409).json({ error: 'Solo le recensioni in moderazione possono essere modificate.' })
        return
      }

      const { rating, body, authorDisplayName } = parsed.data
      const upd = await pool.query(
        `UPDATE site_reviews SET
           author_display_name = $2,
           rating = $3,
           body = $4,
           updated_at = now()
         WHERE id = $1 AND clerk_user_id = $5
         RETURNING id, status, rating, body, author_display_name, created_at`,
        [id, authorDisplayName, rating, body, userId]
      )
      res.json({ review: mapRow(upd.rows[0]) })
    } catch (e) {
      console.error('[me reviews patch]', e)
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

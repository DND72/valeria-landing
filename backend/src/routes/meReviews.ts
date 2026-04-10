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
  title: z.string().min(2).max(100).optional(), // Nuovo campo titolo
  body: z.string().min(20).max(8000),
  authorDisplayName: z.string().min(2).max(80).trim(),
  consultId: z.string().uuid().optional(), // Opzionale per recensioni Generali del sito
})

export function registerMeReviewRoutes(r: Router, pool: Pool): void {
  r.get('/reviews/eligibility', async (req, res) => {
    const userId = req.auth?.userId
    const { consultId } = req.query
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    try {
      const emailNorm = await getPrimaryEmailNormalized(userId)
      const paidDone = await countPaidDoneConsults(pool, userId, emailNorm)

      // Controlla se lo staff ha forzato lo sblocco per questo cliente
      const overrideRow = await pool.query<{ unlock_review_override: boolean }>(
        `SELECT unlock_review_override FROM client_profiles WHERE email_normalized = $1`,
        [emailNorm ?? '']
      )
      const forceUnlocked = overrideRow.rows[0]?.unlock_review_override ?? false

      const effectivePaidDone = forceUnlocked ? Math.max(paidDone, 3) : paidDone
      const maxAllowed = maxClientReviewsAllowed(effectivePaidDone)

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
        `SELECT id, status, rating, title, body, author_display_name, created_at, staff_response, staff_responded_at, consult_id
         FROM site_reviews
         WHERE clerk_user_id = $1 AND source = 'client' AND status = 'published'
         ORDER BY published_at DESC NULLS LAST, created_at DESC
         LIMIT 20`,
        [userId]
      )

      // Se viene passato consultId, verifichiamo se esiste già una recensione caricata
      let specificReview: any = null
      if (consultId) {
         const specRes = await pool.query(
            `SELECT id, status, rating, title, body, author_display_name, created_at, staff_response, staff_responded_at
             FROM site_reviews
             WHERE clerk_user_id = $1 AND consult_id = $2`,
            [userId, consultId]
         )
         specificReview = specRes.rows[0] ? mapRow(specRes.rows[0]) : null
      }

      const canSubmitNew = pending === 0 && published < maxAllowed
      const canEditPending = Boolean(pend)

      let reasonHint: string | null = null
      if (effectivePaidDone < 3) {
        reasonHint =
          'La prima recensione sul sito si sblocca dopo il terzo consulto a pagamento completato, così riflette un percorso.'
      } else if (!canSubmitNew && !canEditPending) {
        reasonHint = `Puoi avere al massimo ${maxAllowed} recensione/i sul sito con il tuo percorso attuale (${paidDone} consulti completati). Ne servono altri prima di poterne aggiungere una nuova.`
      }

      res.json({
        paidConsultsCompleted: paidDone,
        reviewUnlockOverride: forceUnlocked,
        maxReviewsAllowed: maxAllowed,
        clientReviewsPublished: published,
        hasPendingReview: pending > 0,
        canSubmitNew,
        canEditPending,
        reasonHint,
        specificReview, // Aggiunto per consulti
        pendingReview: pend ? mapRow(pend) : null,
        publishedReviews: publishedRows.rows.map(mapRow),
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
      const overrideRow2 = await pool.query<{ unlock_review_override: boolean }>(
        `SELECT unlock_review_override FROM client_profiles WHERE email_normalized = $1`,
        [emailNorm ?? '']
      )
      const forceUnlocked2 = overrideRow2.rows[0]?.unlock_review_override ?? false
      const effectivePaid2 = forceUnlocked2 ? Math.max(paidDone, 3) : paidDone
      const maxAllowed = maxClientReviewsAllowed(effectivePaid2)
      if (maxAllowed === 0) {
        res.status(403).json({
          error:
            'Servono almeno tre consulti a pagamento completati prima della prima recensione sul sito.',
        })
        return
      }

      const { rating, title, body, authorDisplayName, consultId } = parsed.data

      // Check se esiste già per questo consulto
      if (consultId) {
         const existing = await pool.query(`SELECT id FROM site_reviews WHERE consult_id = $1`, [consultId])
         if (existing.rows.length > 0) {
            res.status(409).json({ error: 'Hai già recensito questo consulto.' })
            return
         }
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

      if (pending > 0 && !consultId) { // Per recensioni generali blocchiamo se c'è pending
        res.status(409).json({
          error: 'Hai già una recensione in moderazione. Modificala dalla stessa schermata o attendi l’esito.',
        })
        return
      }
      if (published >= maxAllowed && !consultId) {
        res.status(403).json({
          error:
            'Con il numero di consulti completati hai già raggiunto il massimo di recensioni consentito. Il percorso si allunga: ne potrai aggiungere altre dopo nuovi consulti completati.',
        })
        return
      }

      const ins = await pool.query(
        `INSERT INTO site_reviews (source, clerk_user_id, author_display_name, rating, title, body, status, consult_id, updated_at)
         VALUES ('client', $1, $2, $3, $4, $5, 'pending', $6, now())
         RETURNING id, status, rating, title, body, author_display_name, created_at, consult_id`,
        [userId, authorDisplayName, rating, title || null, body, consultId || null]
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

      const { rating, title, body, authorDisplayName } = parsed.data
      const upd = await pool.query(
        `UPDATE site_reviews SET
           author_display_name = $2,
           rating = $3,
           title = $4,
           body = $5,
           updated_at = now()
         WHERE id = $1 AND clerk_user_id = $6
         RETURNING id, status, rating, title, body, author_display_name, created_at, consult_id`,
        [id, authorDisplayName, rating, title || null, body, userId]
      )
      res.json({ review: mapRow(upd.rows[0]) })
    } catch (e) {
      console.error('[me reviews patch]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })
}

function mapRow(row: any): Record<string, unknown> {
  return {
    id: row.id,
    status: row.status,
    rating: row.rating,
    title: row.title,
    body: row.body,
    authorDisplayName: row.author_display_name,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    staffResponse: row.staff_response,
    staffRespondedAt: row.staff_responded_at ? new Date(row.staff_responded_at).toISOString() : null,
    consultId: row.consult_id,
  }
}

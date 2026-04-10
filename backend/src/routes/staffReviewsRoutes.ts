import type { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'

const staffReviewPatch = z.object({
  status: z.enum(['pending', 'published', 'hidden']).optional(),
  staffResponse: z.string().max(8000).nullable().optional(),
})

const externalImportBody = z.object({
  authorDisplayName: z.string().min(2).max(80).trim(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(100).optional(),
  body: z.string().min(20).max(8000),
  platform: z.string().min(2).max(80).trim(),
  consultId: z.string().uuid().optional(),
})

export function registerStaffReviewRoutes(r: Router, pool: Pool): void {
  r.post('/reviews/external', async (req, res) => {
    const staffId = req.auth?.userId
    if (!staffId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    const parsed = externalImportBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Dati non validi', details: parsed.error.flatten() })
      return
    }
    const { authorDisplayName, rating, title, body, platform, consultId } = parsed.data
    try {
      const ins = await pool.query(
        `INSERT INTO site_reviews (
           source, clerk_user_id, author_display_name, rating, title, body, status,
           published_at, external_platform, imported_by_clerk_id, consult_id, updated_at
         ) VALUES ('external', NULL, $1, $2, $3, $4, 'pending', NULL, $5, $6, $7, now())
         RETURNING id, author_display_name, rating, title, body, status, published_at, external_platform, created_at, consult_id`,
        [authorDisplayName, rating, title || null, body, platform, staffId, consultId || null]
      )
      const r0 = ins.rows[0]
      res.status(201).json({
        review: {
          id: r0.id,
          source: 'external',
          authorDisplayName: r0.author_display_name,
          rating: r0.rating,
          title: r0.title,
          body: r0.body,
          status: r0.status,
          publishedAt: r0.published_at ? new Date(r0.published_at).toISOString() : null,
          externalPlatform: r0.external_platform,
          createdAt: new Date(r0.created_at).toISOString(),
          consultId: r0.consult_id,
        },
      })
    } catch (e) {
      console.error('[staff reviews external]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.get('/reviews', async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, source, clerk_user_id, author_display_name, rating, title, body, status,
                staff_response, staff_responded_at, published_at, external_platform, imported_by_clerk_id,
                consult_id, created_at, updated_at
         FROM site_reviews
         ORDER BY created_at DESC
         LIMIT 300`
      )
      res.json({
        reviews: rows.map((row) => ({
          id: row.id,
          source: row.source,
          clerkUserId: row.clerk_user_id,
          authorDisplayName: row.author_display_name,
          rating: row.rating,
          title: row.title,
          body: row.body,
          status: row.status,
          staffResponse: row.staff_response,
          staffRespondedAt: row.staff_responded_at
            ? new Date(row.staff_responded_at).toISOString()
            : null,
          publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
          externalPlatform: row.external_platform,
          importedByClerkId: row.imported_by_clerk_id,
          consultId: row.consult_id,
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
        `SELECT id, source, clerk_user_id, author_display_name, rating, title, body, status,
                staff_response, staff_responded_at, published_at, external_platform, imported_by_clerk_id,
                consult_id, created_at, updated_at
         FROM site_reviews WHERE id = $1`,
        [id]
      )
      const r0 = row.rows[0]
      res.json({
        review: {
          id: r0.id,
          source: r0.source,
          clerkUserId: r0.clerk_user_id,
          authorDisplayName: r0.author_display_name,
          rating: r0.rating,
          title: r0.title,
          body: r0.body,
          status: r0.status,
          staffResponse: r0.staff_response,
          staffRespondedAt: r0.staff_responded_at
            ? new Date(r0.staff_responded_at).toISOString()
            : null,
          publishedAt: r0.published_at ? new Date(r0.published_at).toISOString() : null,
          externalPlatform: r0.external_platform,
          importedByClerkId: r0.imported_by_clerk_id,
          consultId: r0.consult_id,
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

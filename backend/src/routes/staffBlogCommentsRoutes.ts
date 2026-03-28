import type { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'

const patchBody = z.object({
  status: z.enum(['pending', 'published', 'hidden']).optional(),
})

export function registerStaffBlogCommentRoutes(r: Router, pool: Pool): void {
  r.get('/blog-comments', async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, article_slug, clerk_user_id, author_display_name, body, status,
                published_at, created_at, updated_at
         FROM blog_comments
         ORDER BY created_at DESC
         LIMIT 400`
      )
      res.json({
        comments: rows.map((row) => ({
          id: row.id,
          articleSlug: row.article_slug,
          clerkUserId: row.clerk_user_id,
          authorDisplayName: row.author_display_name,
          body: row.body,
          status: row.status,
          publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString(),
        })),
      })
    } catch (e) {
      console.error('[staff blog-comments list]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.patch('/blog-comments/:id', async (req, res) => {
    const id = req.params.id
    const parsed = patchBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }
    const { status } = parsed.data
    if (status === undefined) {
      res.status(400).json({ error: 'Nessun campo da aggiornare' })
      return
    }
    try {
      const exists = await pool.query(`SELECT id FROM blog_comments WHERE id = $1`, [id])
      if (exists.rows.length === 0) {
        res.status(404).json({ error: 'Commento non trovato' })
        return
      }

      if (status === 'published') {
        await pool.query(
          `UPDATE blog_comments SET status = $1, published_at = COALESCE(published_at, now()), updated_at = now()
           WHERE id = $2`,
          [status, id]
        )
      } else {
        await pool.query(
          `UPDATE blog_comments SET status = $1, published_at = NULL, updated_at = now() WHERE id = $2`,
          [status, id]
        )
      }

      const row = await pool.query(
        `SELECT id, article_slug, clerk_user_id, author_display_name, body, status,
                published_at, created_at, updated_at
         FROM blog_comments WHERE id = $1`,
        [id]
      )
      const c = row.rows[0]!
      res.json({
        comment: {
          id: c.id,
          articleSlug: c.article_slug,
          clerkUserId: c.clerk_user_id,
          authorDisplayName: c.author_display_name,
          body: c.body,
          status: c.status,
          publishedAt: c.published_at ? new Date(c.published_at).toISOString() : null,
          createdAt: new Date(c.created_at).toISOString(),
          updatedAt: new Date(c.updated_at).toISOString(),
        },
      })
    } catch (e) {
      console.error('[staff blog-comments patch]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })
}

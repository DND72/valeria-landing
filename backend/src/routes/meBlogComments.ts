import type { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { isValidArticleSlug } from '../lib/articleSlugs.js'

const createBody = z.object({
  articleSlug: z.string().min(1).max(120),
  body: z.string().min(10).max(4000).trim(),
  authorDisplayName: z.string().min(2).max(80).trim(),
})

const patchBody = z.object({
  body: z.string().min(10).max(4000).trim(),
  authorDisplayName: z.string().min(2).max(80).trim(),
})

function mapRow(row: {
  id: string
  article_slug: string
  status: string
  author_display_name: string
  body: string
  published_at: Date | null
  created_at: Date
}) {
  return {
    id: row.id,
    articleSlug: row.article_slug,
    status: row.status,
    authorDisplayName: row.author_display_name,
    body: row.body,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

export function registerMeBlogCommentRoutes(r: Router, pool: Pool): void {
  r.get('/blog/comments/mine', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    const slug = typeof req.query.articleSlug === 'string' ? req.query.articleSlug.trim() : ''
    if (!slug || !isValidArticleSlug(slug)) {
      res.status(400).json({ error: 'articleSlug non valido' })
      return
    }
    try {
      const { rows } = await pool.query(
        `SELECT id, article_slug, status, author_display_name, body, published_at, created_at
         FROM blog_comments
         WHERE clerk_user_id = $1 AND article_slug = $2
         ORDER BY created_at DESC`,
        [userId, slug]
      )
      res.json({ comments: rows.map((row) => mapRow(row)) })
    } catch (e) {
      console.error('[me blog comments mine]', e)
      res.status(500).json({ error: 'Errore server' })
    }
  })

  r.post('/blog/comments', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    const parsed = createBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Dati non validi', details: parsed.error.flatten() })
      return
    }
    const { articleSlug, body, authorDisplayName } = parsed.data
    if (!isValidArticleSlug(articleSlug)) {
      res.status(400).json({ error: 'Articolo non trovato' })
      return
    }
    try {
      const pend = await pool.query<{ n: string }>(
        `SELECT COUNT(*)::text AS n FROM blog_comments
         WHERE clerk_user_id = $1 AND article_slug = $2 AND status = 'pending'`,
        [userId, articleSlug]
      )
      if (Number(pend.rows[0]?.n ?? 0) > 0) {
        res.status(409).json({
          error:
            'Hai già un commento in moderazione per questo articolo. Modificalo o attendi l’esito prima di inviarne un altro.',
        })
        return
      }

      const ins = await pool.query(
        `INSERT INTO blog_comments (
           article_slug, clerk_user_id, author_display_name, body, status, updated_at
         ) VALUES ($1, $2, $3, $4, 'pending', now())
         RETURNING id, article_slug, status, author_display_name, body, published_at, created_at`,
        [articleSlug, userId, authorDisplayName, body]
      )
      res.status(201).json({ comment: mapRow(ins.rows[0]!) })
    } catch (e) {
      console.error('[me blog comments post]', e)
      res.status(500).json({ error: 'Errore server' })
    }
  })

  r.patch('/blog/comments/:id', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    const id = req.params.id
    const parsed = patchBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Dati non validi', details: parsed.error.flatten() })
      return
    }
    try {
      const row = await pool.query<{ status: string }>(
        `SELECT status FROM blog_comments WHERE id = $1 AND clerk_user_id = $2`,
        [id, userId]
      )
      if (row.rows.length === 0) {
        res.status(404).json({ error: 'Commento non trovato' })
        return
      }
      if (row.rows[0]!.status !== 'pending') {
        res.status(409).json({ error: 'Solo i commenti in moderazione possono essere modificati.' })
        return
      }
      const { body, authorDisplayName } = parsed.data
      const upd = await pool.query(
        `UPDATE blog_comments SET body = $2, author_display_name = $3, updated_at = now()
         WHERE id = $1 AND clerk_user_id = $4
         RETURNING id, article_slug, status, author_display_name, body, published_at, created_at`,
        [id, body, authorDisplayName, userId]
      )
      res.json({ comment: mapRow(upd.rows[0]!) })
    } catch (e) {
      console.error('[me blog comments patch]', e)
      res.status(500).json({ error: 'Errore server' })
    }
  })
}

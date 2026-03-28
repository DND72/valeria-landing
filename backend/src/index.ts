import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { pool } from './db.js'
import { isValidArticleSlug } from './lib/articleSlugs.js'
import { createCalendlyWebhookHandler } from './routes/calendlyWebhook.js'
import { createMeRouter } from './routes/me.js'
import { createStaffRouter } from './routes/staff.js'

const app = express()
const port = Number(process.env.PORT) || 8787

const frontendOrigin = process.env.FRONTEND_ORIGIN
const corsOrigins = frontendOrigin
  ? frontendOrigin.split(',').map((s) => s.trim()).filter(Boolean)
  : true

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
)

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'valeria-landing-api' })
})

app.post(
  '/api/calendly/webhook',
  express.raw({ type: 'application/json' }),
  createCalendlyWebhookHandler(pool)
)

app.use(express.json())

app.get('/api/public/reviews', async (_req, res) => {
  try {
    const st = await pool.query<{ c: string; avg: string }>(
      `SELECT COUNT(*)::text AS c, COALESCE(AVG(rating)::numeric, 0)::text AS avg
       FROM site_reviews
       WHERE status = 'published'`
    )
    const row = st.rows[0]
    const count = Number(row?.c ?? 0)
    const average = count === 0 ? 0 : Math.round(Number(row?.avg ?? 0) * 100) / 100

    const { rows } = await pool.query(
      `SELECT id, source, author_display_name, rating, body, staff_response, staff_responded_at,
              published_at, created_at, external_platform
       FROM site_reviews
       WHERE status = 'published'
       ORDER BY published_at DESC NULLS LAST, created_at DESC
       LIMIT 80`
    )
    res.json({
      stats: { count, average },
      reviews: rows.map((r) => ({
        id: r.id,
        source: r.source,
        authorDisplayName: r.author_display_name,
        rating: r.rating,
        body: r.body,
        staffResponse: r.staff_response,
        staffRespondedAt: r.staff_responded_at
          ? new Date(r.staff_responded_at).toISOString()
          : null,
        publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
        createdAt: new Date(r.created_at).toISOString(),
        externalPlatform: r.external_platform,
        fromOtherPlatform: r.source === 'external',
      })),
    })
  } catch (e) {
    console.error('[public reviews]', e)
    res.status(500).json({ error: 'Errore server' })
  }
})

app.get('/api/public/blog/:slug/comments', async (req, res) => {
  const slug = req.params.slug?.trim() ?? ''
  if (!slug || !isValidArticleSlug(slug)) {
    res.status(404).json({ error: 'Articolo non trovato' })
    return
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, author_display_name, body, published_at, created_at
       FROM blog_comments
       WHERE article_slug = $1 AND status = 'published'
       ORDER BY published_at ASC NULLS LAST, created_at ASC`,
      [slug]
    )
    res.json({
      comments: rows.map((r) => ({
        id: r.id,
        authorDisplayName: r.author_display_name,
        body: r.body,
        publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
        createdAt: new Date(r.created_at).toISOString(),
      })),
    })
  } catch (e) {
    console.error('[public blog comments]', e)
    res.status(500).json({ error: 'Errore server' })
  }
})

app.get('/api/public/valeria-presence', async (_req, res) => {
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
    console.error('[public valeria-presence]', e)
    res.status(500).json({ error: 'Errore server' })
  }
})

app.use('/api/staff', createStaffRouter(pool))
app.use('/api/me', createMeRouter(pool))

app.use((_req, res) => {
  res.status(404).json({ error: 'Non trovato' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`API in ascolto su http://0.0.0.0:${port}`)
})

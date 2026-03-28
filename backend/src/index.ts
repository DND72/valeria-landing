import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { pool } from './db.js'
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

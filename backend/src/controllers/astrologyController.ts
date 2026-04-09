
import type { Request, Response } from 'express'
import { execFile } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'
import { notifyStaff, tg } from '../lib/telegram.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const calcSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format, use HH:MM"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  gender: z.enum(['M', 'F'], { required_error: "Il sesso (M/F) è obbligatorio" }),
  email: z.string().email().optional()
})

/** Helper per lanciare lo script python */
async function runNatalCalculation(birthDate: string, birthTime: string, city: string): Promise<any> {
  const pythonScriptPath = path.join(__dirname, '../../python_engine/astrology.py')
  const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3'

  return new Promise((resolve, reject) => {
    execFile(pythonExecutable, [pythonScriptPath, birthDate, birthTime, city], (error, stdout, _stderr) => {
      if (error) return reject(new Error("Failed to calculate astrological chart"))
      try {
        const result = JSON.parse(stdout)
        if (result.error) return reject(new Error(result.error))
        resolve(result)
      } catch (e) {
        reject(new Error("Invalid data received from calculation engine"))
      }
    })
  })
}

export const getLatestChart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId; if (!userId) { res.status(401).json({ error: 'Non autenticato' }); return; }
  try {
    const { pool } = await import('../db.js')
    const result = await pool.query(
      `SELECT nc.*, bp.declared_birthday, bp.birth_time, bp.birth_city FROM natal_charts nc
       LEFT JOIN client_billing_profiles bp ON bp.clerk_user_id = nc.clerk_user_id
       WHERE nc.clerk_user_id = $1 ORDER BY nc.created_at DESC LIMIT 1`, [userId]
    )
    if (result.rows.length === 0) { res.json({ chart: null }); return; }
    const row = result.rows[0]
    res.json({ chart: { ...row.chart_data, id: row.id, chartId: row.id, interpretation: row.interpretation, chart_type: row.chart_type, status: row.status, birthDate: row.declared_birthday, birthTime: row.birth_time, city: row.birth_city } })
  } catch (e) { res.status(500).json({ error: 'Errore recupero' }) }
}

export const calculateNatalChart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { birthDate, birthTime, city, gender, email } = calcSchema.parse(req.body)
    const userId = req.auth?.userId; const { pool } = await import('../db.js')
    if (userId) {
      const existing = await pool.query(`SELECT id, chart_data, interpretation FROM natal_charts WHERE clerk_user_id = $1 AND chart_type = 'basic' LIMIT 1`, [userId])
      if (existing.rows.length > 0) {
        res.json({ ...existing.rows[0].chart_data, id: existing.rows[0].id, interpretation: existing.rows[0].interpretation, isExisting: true })
        return
      }
    }
    const result = await runNatalCalculation(birthDate, birthTime, city)
    let interpretation = ""; let chartId = null
    if (userId) {
      const { generateChartInterpretation } = await import('../lib/gemini.js')
      interpretation = await generateChartInterpretation(result, 'basic', gender)
      await pool.query(`INSERT INTO wallets (clerk_user_id, balance_available, balance_locked, updated_at) VALUES ($1, 0, 0, now()) ON CONFLICT (clerk_user_id) DO NOTHING`, [userId])
      if (email) {
        const normEmail = email.toLowerCase().trim()
        await pool.query(`INSERT INTO client_billing_profiles (clerk_user_id, email_normalized, declared_birthday, birth_time, birth_city, gender) VALUES ($1, $2, $3::date, $4, $5, $6) ON CONFLICT (clerk_user_id) DO NOTHING`, [userId, normEmail, birthDate, birthTime, city, gender])
      }
      const ins = await pool.query(`INSERT INTO natal_charts (clerk_user_id, chart_type, birth_date, birth_time, city, gender, chart_data, interpretation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, [userId, 'basic', birthDate, birthTime, city, gender, result, interpretation])
      chartId = ins.rows[0].id
    }
    res.json({ ...result, id: chartId, interpretation, chart_type: 'basic' })
  } catch (error: any) { res.status(500).json({ error: error.message || 'Internal error' }) }
}

export const generatePaidChart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId; if (!userId) { res.status(401).json({ error: "Non autorizzato" }); return; }
  try {
    const { birthDate, birthTime, city, gender } = calcSchema.parse(req.body); const { pool } = await import('../db.js')
    const existing = await pool.query(`SELECT id, chart_data, interpretation, status FROM natal_charts WHERE clerk_user_id = $1 AND chart_type = 'advanced' LIMIT 1`, [userId])
    if (existing.rows.length > 0) {
      res.json({ ...existing.rows[0].chart_data, id: existing.rows[0].id, interpretation: existing.rows[0].interpretation, status: existing.rows[0].status, isExisting: true })
      return
    }
    const cost = 30; const auth = (req as any).auth
    const isStaff = auth?.sessionClaims?.publicMetadata?.role === 'staff' || auth?.sessionClaims?.publicMetadata?.privileged === true
    if (!isStaff) {
      const bal = await pool.query(`SELECT balance_available FROM wallets WHERE clerk_user_id = $1`, [userId])
      if (!bal.rows[0] || bal.rows[0].balance_available < cost) { res.status(400).json({ error: 'insufficient_funds' }); return; }
    }
    const chartData = await runNatalCalculation(birthDate, birthTime, city)
    const { generateChartInterpretation } = await import('../lib/gemini.js')
    const interpretation = await generateChartInterpretation(chartData, 'advanced', gender)
    const dbClient = await pool.connect()
    try {
      await dbClient.query('BEGIN')
      if (!isStaff) {
        const { rows } = await dbClient.query(`UPDATE wallets SET balance_available = balance_available - $1, updated_at = now() WHERE clerk_user_id = $2 AND balance_available >= $1 RETURNING *`, [cost, userId])
        if (rows.length === 0) { await dbClient.query('ROLLBACK'); res.status(400).json({ error: 'insufficient_funds' }); return; }
        await dbClient.query(`INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type) VALUES ($1, $2, 'natal_chart_advanced')`, [userId, -cost])
      } else { await dbClient.query(`INSERT INTO wallets (clerk_user_id, balance_available, balance_locked, updated_at) VALUES ($1, 0, 0, now()) ON CONFLICT (clerk_user_id) DO NOTHING`, [userId]) }
      const ins = await dbClient.query(`INSERT INTO natal_charts (clerk_user_id, chart_type, birth_date, birth_time, city, gender, chart_data, interpretation, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`, [userId, 'advanced', birthDate, birthTime, city, gender, chartData, interpretation, isStaff ? 'ready' : 'pending_staff'])
      await dbClient.query('COMMIT')
      if (!isStaff) notifyStaff(tg.newAdvancedChart(userId)).catch(() => {})
      res.json({ ...chartData, id: ins.rows[0].id, interpretation, chart_type: 'advanced', status: isStaff ? 'ready' : 'pending_staff' })
    } catch (e) { await dbClient.query('ROLLBACK'); throw e } finally { dbClient.release() }
  } catch (error: any) { res.status(500).json({ error: error.message || 'Internal error' }) }
}

export const syncNatal = async (req: Request, res: Response) => {
    const userId = req.auth?.userId; if (!userId) return res.status(401).json({ error: 'Non autenticato' })
    const { birthDate, birthTime, city, gender, email } = req.body; const { pool } = await import('../db.js')
    try {
      const current = await pool.query(`SELECT declared_birthday FROM client_billing_profiles WHERE clerk_user_id = $1`, [userId])
      if (current.rows.length > 0 && current.rows[0].declared_birthday) {
         const dbDate = new Date(current.rows[0].declared_birthday).toISOString().split('T')[0]
         if (dbDate !== birthDate) {
            res.status(403).json({ error: 'birth_data_crystallized', message: 'Dati cristallizzati.' })
            return
         }
      }
      await pool.query(`INSERT INTO client_billing_profiles (clerk_user_id, email_normalized, declared_birthday, birth_time, birth_city, gender) VALUES ($1, $2, $3::date, $4, $5, $6) ON CONFLICT (clerk_user_id) DO UPDATE SET email_normalized = COALESCE(client_billing_profiles.email_normalized, EXCLUDED.email_normalized)`, [userId, email?.toLowerCase().trim(), birthDate, birthTime, city, gender])
      res.json({ ok: true })
    } catch (e) { res.status(500).json({ error: 'Sync failed' }) }
}

export const calculateSynastry = async (req: Request, res: Response): Promise<void> => {
   const userId = req.auth?.userId; if (!userId) { res.status(401).json({ error: "Non autorizzato" }); return; }
   const { personA, personB, isPreview } = req.body; try {
     const { pool } = await import('../db.js')
     const chartA = await runNatalCalculation(personA.birthDate, personA.birthTime, personA.city)
     const chartB = await runNatalCalculation(personB.birthDate, personB.birthTime, personB.city)
     const { calculateTransits } = await import('../utils/astrologyUtils.js')
     const interAspects = calculateTransits(chartA.pianeti, chartB.pianeti)
     if (isPreview) {
        const wallet = await pool.query(`SELECT free_synastry_used FROM wallets WHERE clerk_user_id = $1`, [userId])
        if (wallet.rows[0]?.free_synastry_used) {
           res.status(403).json({ error: 'free_preview_exhausted' })
           return
        }
        const { generateSynastryPreview } = await import('../lib/gemini.js')
        const interp = await generateSynastryPreview(chartA, chartB, interAspects)
        await pool.query(`UPDATE wallets SET free_synastry_used = true WHERE clerk_user_id = $1`, [userId])
        res.json({ status: 'ready', chartA, chartB, interAspects, interpretation: interp, is_preview: true })
        return
     }
     const exist = await pool.query(`SELECT id, status, interpretation FROM synastry_reports WHERE clerk_user_id = $1 AND person_a_data->>'birthDate' = $2 AND person_b_data->>'birthDate' = $3`, [userId, personA.birthDate, personB.birthDate])
     if (exist.rows.length > 0) {
        res.json({ id: exist.rows[0].id, status: exist.rows[0].status, interpretation: exist.rows[0].status === 'ready' ? exist.rows[0].interpretation : null, isExisting: true })
        return
     }
     const cost = 50; const bal = await pool.query(`SELECT balance_available FROM wallets WHERE clerk_user_id = $1`, [userId])
     if (!bal.rows[0] || bal.rows[0].balance_available < cost) { res.status(400).json({ error: 'insufficient_funds' }); return; }
     const { generateSynastryInterpretation } = await import('../lib/gemini.js')
     const interp = await generateSynastryInterpretation(chartA, chartB, interAspects, personA.gender, personB.gender)
     const dbClient = await pool.connect()
     try {
       await dbClient.query('BEGIN'); await dbClient.query(`UPDATE wallets SET balance_available = balance_available - $1 WHERE clerk_user_id = $2`, [cost, userId])
       await dbClient.query(`INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type) VALUES ($1, $2, 'synastry_report')`, [userId, -cost])
       const ins = await dbClient.query(`INSERT INTO synastry_reports (clerk_user_id, person_a_data, person_b_data, chart_a, chart_b, inter_aspects, interpretation, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_staff') RETURNING id`, [userId, personA, personB, chartA, chartB, interAspects, interp])
       await dbClient.query('COMMIT')
       notifyStaff(tg.newSynastry(userId)).catch(() => {})
       res.json({ id: ins.rows[0].id, status: 'pending_staff' })
     } catch (e) { await dbClient.query('ROLLBACK'); throw e } finally { dbClient.release() }
   } catch (_error) { res.status(500).json({ error: 'Internal error' }) }
}

export const getMyCharts = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId; if (!userId) { res.status(401).json({ error: "Non autorizzato" }); return; }
  try {
    const { pool } = await import('../db.js'); const { rows } = await pool.query(`SELECT * FROM natal_charts WHERE clerk_user_id = $1 ORDER BY created_at DESC`, [userId])
    res.json({ charts: rows.map(r => ({ id: r.id, type: r.chart_type, birthDate: r.birth_date, birthTime: r.birth_time, city: r.city, chartData: r.chart_data, interpretation: r.interpretation, status: r.status })) })
  } catch (err) { res.status(500).json({ error: 'Error' }) }
}

export const getCurrentSky = async (_req: Request, res: Response): Promise<void> => {
  const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3'
  execFile(pythonExecutable, [path.join(__dirname, '../../python_engine/current_sky.py')], (_error, stdout, _stderr) => {
    try { res.json(JSON.parse(stdout)) } catch { res.status(500).json({ error: 'Fail' }) }
  })
}

export const getLatestHoroscope = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId; if (!userId) { res.status(401).json({ error: 'Auth fail' }); return; }
  try {
    const { pool } = await import('../db.js')
    const result = await pool.query(`SELECT * FROM user_horoscopes WHERE clerk_user_id = $1 AND status = 'ready' ORDER BY created_at DESC LIMIT 1`, [userId])
    res.json({ forecast: result.rows[0] || null })
  } catch (err) { res.status(500).json({ error: 'Fail' }) }
}

export const getPendingCharts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { pool } = await import('../db.js')
    const charts = await pool.query(`SELECT nc.*, COALESCE(bp.first_name || ' ' || bp.last_name, bp.email_normalized, nc.clerk_user_id) as display_name FROM natal_charts nc LEFT JOIN client_billing_profiles bp ON nc.clerk_user_id = bp.clerk_user_id WHERE nc.status = 'pending_staff' ORDER BY nc.created_at ASC`)
    const horo = await pool.query(`SELECT h.*, COALESCE(bp.first_name || ' ' || bp.last_name, bp.email_normalized, h.clerk_user_id) as display_name FROM user_horoscopes h LEFT JOIN client_billing_profiles bp ON h.clerk_user_id = bp.clerk_user_id WHERE h.status = 'pending_staff' ORDER BY h.created_at ASC`)
    const syn = await pool.query(`SELECT sr.*, COALESCE(bp.first_name || ' ' || bp.last_name, bp.email_normalized, sr.clerk_user_id) as display_name FROM synastry_reports sr LEFT JOIN client_billing_profiles bp ON sr.clerk_user_id = bp.clerk_user_id WHERE sr.status = 'pending_staff' ORDER BY sr.created_at ASC`)
    res.json({ pendingCharts: charts.rows, pendingHoroscopes: horo.rows, pendingSynastries: syn.rows })
  } catch (err) { res.status(500).json({ error: 'Error' }) }
}

export const approveHoroscope = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, forecast_text, energy_level, lucky_days } = req.body; const { pool } = await import('../db.js')
    await pool.query(`UPDATE user_horoscopes SET forecast_text = $1, energy_level = $2, lucky_days = $3, status = 'ready', updated_at = now() WHERE id = $4`, [forecast_text, energy_level, lucky_days || '{}', id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: 'Error' }) }
}

export const approveChart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chartId, type, interpretation } = req.body; const { pool } = await import('../db.js')
    const tbl = type === 'chart' ? 'natal_charts' : 'synastry_reports'
    await pool.query(`UPDATE ${tbl} SET interpretation = COALESCE($1, interpretation), status = 'ready', updated_at = now() WHERE id = $2`, [interpretation, chartId])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: 'Error' }) }
}

export const generateFirstHoroscope = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId; if (!userId) { res.status(401).json({ error: 'Auth fail' }); return; }
  try {
    const { pool } = await import('../db.js'); const exist = await pool.query(`SELECT id FROM user_horoscopes WHERE clerk_user_id = $1 AND status != 'failed'`, [userId])
    if (exist.rows.length > 0) { res.status(400).json({ error: 'Existing request' }); return; }
    const start = new Date(); const end = new Date(); end.setDate(end.getDate() + 7)
    await pool.query(`INSERT INTO user_horoscopes (clerk_user_id, status, start_date, end_date) VALUES ($1, 'pending_staff', $2, $3)`, [userId, start.toISOString(), end.toISOString()])
    notifyStaff(tg.newMentore(userId)).catch(() => {})
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: 'Fail' }) }
}

export const rejectAndRefund = async (req: Request, res: Response): Promise<void> => {
  const { id, type, refundAmount } = req.body; const { pool } = await import('../db.js')
  const dbClient = await pool.connect()
  try {
    await dbClient.query('BEGIN')
    const tbl = type === 'chart' ? 'natal_charts' : 'synastry_reports'
    const ownerRes = await dbClient.query(`SELECT clerk_user_id FROM ${tbl} WHERE id = $1`, [id])
    if (ownerRes.rows.length === 0) throw new Error('Not found')
    const userId = ownerRes.rows[0].clerk_user_id
    if (refundAmount > 0) {
      await dbClient.query(`UPDATE wallets SET balance_available = balance_available + $1 WHERE clerk_user_id = $2`, [refundAmount, userId])
      await dbClient.query(`INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type) VALUES ($1, $2, 'refund_error')`, [userId, refundAmount])
    }
    await dbClient.query(`DELETE FROM ${tbl} WHERE id = $1`, [id])
    await dbClient.query('COMMIT'); res.json({ success: true })
  } catch (e) { await dbClient.query('ROLLBACK'); res.status(500).json({ error: 'Refund fail' }) } finally { dbClient.release() }
}

export const generateSummaryForExistingChart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId; if (!userId) { res.status(401).json({ error: "Non autorizzato" }); return; }
  try {
    const { chartId } = req.body; const { pool } = await import('../db.js')
    const { rows } = await pool.query(`SELECT chart_data, interpretation, gender FROM natal_charts WHERE id = $1 AND clerk_user_id = $2`, [chartId, userId])
    if (rows.length === 0) { res.status(404).json({ error: "Non trovato" }); return; }
    const { generateChartInterpretation } = await import('../lib/gemini.js')
    const interpretation = await generateChartInterpretation(rows[0].chart_data, 'basic', rows[0].gender)
    await pool.query(`UPDATE natal_charts SET interpretation = $1 WHERE id = $2`, [interpretation, chartId])
    res.json({ interpretation })
  } catch (error) { res.status(500).json({ error: 'Errore sintesi' }) }
}

export const generateStaffChart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId; if (!userId) { res.status(401).json({ error: "Non autorizzato" }); return; }
  try {
    const { pool } = await import('../db.js'); const { birthDate, birthTime, city, gender } = req.body
    const chartData = await runNatalCalculation(birthDate, birthTime, city)
    const { generateChartInterpretation } = await import('../lib/gemini.js')
    const interpretation = await generateChartInterpretation(chartData, 'advanced', gender)
    const item = await pool.query(`INSERT INTO natal_charts (clerk_user_id, chart_type, birth_date, birth_time, city, gender, chart_data, interpretation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, [userId, 'advanced', birthDate, birthTime, city, gender, chartData, interpretation])
    res.json({ ...chartData, id: item.rows[0].id, interpretation, chart_type: 'advanced' })
  } catch (error: any) { res.status(500).json({ error: error.message || 'Internal error' }) }
}

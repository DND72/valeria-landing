import type { Request, Response } from 'express'
import { execFile } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const calcSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format, use HH:MM"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  gender: z.enum(['M', 'F'], { required_error: "Il sesso (M/F) è obbligatorio" }),
  email: z.string().email().optional()
})

/** Helper per lanciare lo script python in modo asincrono */
async function runNatalCalculation(birthDate: string, birthTime: string, city: string): Promise<any> {
  const pythonScriptPath = path.join(__dirname, '../../python_engine/astrology.py')
  const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3'

  return new Promise((resolve, reject) => {
    execFile(pythonExecutable, [pythonScriptPath, birthDate, birthTime, city], (error, stdout, stderr) => {
      if (error) {
        console.error("Python Error (stderr):", stderr)
        return reject(new Error("Failed to calculate astrological chart"))
      }
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
  const userId = req.auth?.userId
  if (!userId) {
    res.status(401).json({ error: 'Non autenticato' })
    return
  }

  try {
    const { pool } = await import('../db.js')
    const result = await pool.query(
      `SELECT 
         nc.id, nc.chart_data, nc.interpretation, nc.chart_type, nc.created_at,
         bp.declared_birthday, bp.birth_time, bp.birth_city
       FROM natal_charts nc
       LEFT JOIN client_billing_profiles bp ON bp.clerk_user_id = nc.clerk_user_id
       WHERE nc.clerk_user_id = $1 
       ORDER BY nc.created_at DESC LIMIT 1`,
      [userId]
    )

    if (result.rows.length === 0) {
      res.json({ chart: null })
      return
    }

    const row = result.rows[0]
    res.json({
      chart: {
        ...row.chart_data,
        chartId: row.id,
        id: row.id,
        interpretation: row.interpretation,
        chart_type: row.chart_type,
        created_at: row.created_at,
        birthDate: row.declared_birthday ? new Date(row.declared_birthday).toISOString().split('T')[0] : null,
        birthTime: row.birth_time,
        city: row.birth_city
      }
    })
  } catch (e) {
    console.error('[astrology latest]', e)
    res.status(500).json({ error: 'Errore durante il recupero dell\'ultimo tema' })
  }
}

export const calculateNatalChart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { birthDate, birthTime, city, gender, email } = calcSchema.parse(req.body)
    const userId = req.auth?.userId

    // Se l'utente è loggato, verifichiamo prima se ha già un tema salvato
    if (userId) {
      const { pool } = await import('../db.js')
      const existing = await pool.query(
        `SELECT id, chart_data, interpretation FROM natal_charts 
         WHERE clerk_user_id = $1 AND chart_type = 'basic' LIMIT 1`,
        [userId]
      )

      if (existing.rows.length > 0) {
        const row = existing.rows[0]
        res.json({
          ...row.chart_data,
          id: (row as any).id, // Includiamo l'ID
          interpretation: row.interpretation,
          isExisting: true
        })
        return
      }
    }

    const result = await runNatalCalculation(birthDate, birthTime, city)

    // Generiamo l'interpretazione base (gratuita) solo se loggato
    let interpretation = ""
    let chartId = null

    if (userId) {
      const { generateChartInterpretation } = await import('../lib/gemini.js')
      interpretation = await generateChartInterpretation(result, 'basic', gender)
      
      // 1. Assicuriamoci che l'utente abbia un Wallet e un Profilo (Inizializzazione atomica)
      const { pool } = await import('../db.js')
      
      // Upsert Wallet (Balance 0)
      await pool.query(
        `INSERT INTO wallets (clerk_user_id, balance_available, balance_locked, updated_at)
         VALUES ($1, 0, 0, now())
         ON CONFLICT (clerk_user_id) DO NOTHING`,
        [userId]
      )

      // 2. Sincronizziamo l'Anagrafica se l'email è fornita
      if (email) {
        const normEmail = email.toLowerCase().trim();
        await pool.query(
          `INSERT INTO client_billing_profiles (clerk_user_id, email_normalized, declared_birthday, birth_time, birth_city, gender, updated_at)
           VALUES ($1, $2, $3::date, $4, $5, $6, now())
           ON CONFLICT (clerk_user_id) DO UPDATE SET 
              email_normalized = COALESCE(client_billing_profiles.email_normalized, EXCLUDED.email_normalized),
              declared_birthday = COALESCE(client_billing_profiles.declared_birthday, EXCLUDED.declared_birthday),
              birth_time = COALESCE(client_billing_profiles.birth_time, EXCLUDED.birth_time),
              birth_city = COALESCE(client_billing_profiles.birth_city, EXCLUDED.birth_city),
              gender = COALESCE(client_billing_profiles.gender, EXCLUDED.gender),
              updated_at = now()`,
          [userId, normEmail, birthDate, birthTime, city, gender]
        )
      }

      const insertRes = await pool.query(
        `INSERT INTO natal_charts (clerk_user_id, chart_type, birth_date, birth_time, city, gender, chart_data, interpretation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (clerk_user_id, birth_date, birth_time, city) 
         DO UPDATE SET interpretation = EXCLUDED.interpretation, gender = EXCLUDED.gender, created_at = now()
         RETURNING id`,
        [userId, 'basic', birthDate, birthTime, city, gender, result, interpretation]
      )
      chartId = insertRes.rows[0]?.id
    }

    res.json({
      ...result,
      id: chartId,
      interpretation,
      chart_type: 'basic',
      created_at: new Date().toISOString()
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message })
      return
    }
    console.error("Calculate API Error:", error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

const paidSchema = calcSchema.extend({
  type: z.enum(['basic', 'advanced'])
})

export const generatePaidChart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId
  if (!userId) {
    res.status(401).json({ error: "Non autorizzato" })
    return
  }

  try {
    const { birthDate, birthTime, city, gender } = paidSchema.parse(req.body)
    const cost = 30 // Unified price for Evolutionary Analysis

    const { pool } = await import('../db.js')
    
    // 1. Initial balance check (prevent useless LLM calls)
    const balanceRes = await pool.query(
      `SELECT balance_available FROM wallets WHERE clerk_user_id = $1`,
      [userId]
    )
    if (!balanceRes.rows[0] || balanceRes.rows[0].balance_available < cost) {
      res.status(400).json({ error: 'insufficient_funds' })
      return
    }

    // 2. Astrology Engine + LLM Interpretation (Heavy lifting)
    const chartData = await runNatalCalculation(birthDate, birthTime, city)
    const { generateChartInterpretation } = await import('../lib/gemini.js')
    const interpretation = await generateChartInterpretation(chartData, 'advanced', gender)

    // 3. Final atomic deduction & save
    const dbClient = await pool.connect()
    let chartId;
    
    try {
      await dbClient.query('BEGIN')
      
      const { rows } = await dbClient.query(
        `UPDATE wallets SET balance_available = balance_available - $1, updated_at = now() 
         WHERE clerk_user_id = $2 AND balance_available >= $1 RETURNING balance_available`,
        [cost, userId]
      )
      
      if (rows.length === 0) {
        await dbClient.query('ROLLBACK')
        res.status(400).json({ error: 'insufficient_funds' })
        return
      }
      
      await dbClient.query(
        `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type) VALUES ($1, $2, $3)`,
        [userId, -cost, `natal_chart_advanced`]
      )
      
      const insertRes = await dbClient.query(
        `INSERT INTO natal_charts (clerk_user_id, chart_type, birth_date, birth_time, city, gender, chart_data, interpretation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (clerk_user_id, birth_date, birth_time, city) 
         DO UPDATE SET chart_type = EXCLUDED.chart_type, interpretation = EXCLUDED.interpretation, gender = EXCLUDED.gender, created_at = now()
         RETURNING id`,
        [userId, 'advanced', birthDate, birthTime, city, gender, chartData, interpretation]
      )
      chartId = insertRes.rows[0].id

      await dbClient.query('COMMIT')
    } catch (dbErr) {
      await dbClient.query('ROLLBACK')
      throw dbErr
    } finally {
      dbClient.release()
    }

    res.json({
      ...chartData,
      id: chartId,
      interpretation,
      chart_type: 'advanced',
      created_at: new Date().toISOString(),
      birthDate,
      birthTime,
      city
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message })
      return
    }
    console.error("Generate Paid API Error:", error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

export const syncNatal = async (req: Request, res: Response) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }

    const syncSchema = z.object({
      birthDate: z.string(),
      birthTime: z.string(),
      city: z.string(),
      gender: z.enum(['M', 'F']),
      email: z.string().email().optional()
    })

    const parsed = syncSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Dati non validi' })
      return
    }

    const { birthDate, birthTime, city, gender, email } = parsed.data
    const { pool } = await import('../db.js')

    try {
      // 0. Verifica se i dati sono già presenti e bloccati (Solo se TUTTI i campi sono pieni)
      const currentProfile = await pool.query(
        `SELECT declared_birthday, birth_time, birth_city FROM client_billing_profiles WHERE clerk_user_id = $1`,
        [userId]
      )

      if (currentProfile.rows.length > 0) {
          const row = currentProfile.rows[0];
          const isComplete = row.declared_birthday && row.birth_time && row.birth_city;
          
          // Se è già completo e l'utente prova a cambiare qualcosa, blocchiamo.
          // Se non è completo, lasciamo procedere per la "finitura" dell'identità astrale.
          if (isComplete) {
              const matches = 
                  new Date(row.declared_birthday).toISOString().split('T')[0] === birthDate &&
                  row.birth_time === birthTime &&
                  row.birth_city === city;
                  
              if (!matches) {
                  res.status(403).json({ error: 'I dati di nascita sono già cristallizzati e non possono essere modificati.' })
                  return
              }
          }
      }

      // 0.5 Assicuriamoci che l'utente abbia un Wallet (Balance 0)
      await pool.query(
        `INSERT INTO wallets (clerk_user_id, balance_available, balance_locked, updated_at)
         VALUES ($1, 0, 0, now())
         ON CONFLICT (clerk_user_id) DO NOTHING`,
        [userId]
      )

      // 1. Inserisce o Aggiorna il profilo billing (Sincronizzando se presente l'email, altrimenti solo ID)
      const normEmail = email?.toLowerCase().trim() || null;
      console.log(`[SYNC] Syncing billing profile for user ${userId}, email provided: ${normEmail}`);

      const upRes = await pool.query(
        `INSERT INTO client_billing_profiles (clerk_user_id, email_normalized, declared_birthday, birth_time, birth_city, gender, updated_at)
         VALUES ($1, $2, $3::date, $4, $5, $6, now())
         ON CONFLICT (clerk_user_id) DO UPDATE SET 
            email_normalized = COALESCE(client_billing_profiles.email_normalized, EXCLUDED.email_normalized),
            declared_birthday = COALESCE(client_billing_profiles.declared_birthday, EXCLUDED.declared_birthday),
            birth_time = COALESCE(client_billing_profiles.birth_time, EXCLUDED.birth_time),
            birth_city = COALESCE(client_billing_profiles.birth_city, EXCLUDED.birth_city),
            gender = COALESCE(client_billing_profiles.gender, EXCLUDED.gender),
            updated_at = now()
         RETURNING *`,
        [userId, normEmail, birthDate, birthTime, city, gender]
      )
      console.log(`[SYNC] Upsert completed. Rows affected: ${upRes.rowCount}. Birthday in DB: ${upRes.rows[0]?.declared_birthday}`);

      // 2. Verifica se ha già un tema natale. Se no, lo creiamo in automatico (Funnel conversion)
      const existing = await pool.query(`SELECT id FROM natal_charts WHERE clerk_user_id = $1 LIMIT 1`, [userId])
      
      let created = false
      let finalId = existing.rows[0]?.id || null

      if (existing.rows.length === 0) {
        try {
          const result = await runNatalCalculation(birthDate, birthTime, city)
          const { generateChartInterpretation } = await import('../lib/gemini.js')
          const interpretation = await generateChartInterpretation(result, 'basic', gender)
          
          const insRes = await pool.query(
            `INSERT INTO natal_charts (clerk_user_id, chart_type, birth_date, birth_time, city, gender, chart_data, interpretation)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [userId, 'basic', birthDate, birthTime, city, gender, result, interpretation]
          )
          finalId = insRes.rows[0]?.id
          created = true
        } catch (calcErr) {
          console.error('[sync-natal] Auto-generation failed:', calcErr)
        }
      }
      
      res.json({ ok: true, id: finalId, alreadyHasChart: existing.rows.length > 0, autoCreated: created })
    } catch (e) {
      console.error('[me sync-natal]', e)
      res.status(500).json({ error: 'Errore sincronizzazione' })
    }
  }

export const getMyCharts = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId
  if (!userId) {
    res.status(401).json({ error: "Non autorizzato" })
    return
  }

  try {
    const { pool } = await import('../db.js')
    const { rows } = await pool.query(
      `SELECT id, chart_type, birth_date, birth_time, city, chart_data, interpretation, created_at
       FROM natal_charts WHERE clerk_user_id = $1 ORDER BY created_at DESC`,
      [userId]
    )
    
    res.json({ charts: rows.map(r => ({
      id: r.id,
      type: r.chart_type,
      birthDate: r.birth_date,
      birthTime: r.birth_time,
      city: r.city,
      chartData: r.chart_data,
      interpretation: r.interpretation,
      createdAt: r.created_at
    })) })
  } catch (err) {
    console.error('Get charts error', err)
    res.status(500).json({ error: 'Errore durante la lettura delle carte natali' })
  }
}

export const getCurrentSky = async (_req: Request, res: Response): Promise<void> => {
  const pythonScriptPath = path.join(__dirname, '../../python_engine/current_sky.py')
  const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3'

  execFile(pythonExecutable, [pythonScriptPath], (error, stdout, stderr) => {
    if (error) {
      console.error('[current-sky] Python error:', stderr)
      res.status(500).json({ error: 'Errore nel calcolo del cielo attuale' })
      return
    }
    try {
      const result = JSON.parse(stdout)
      if (result.error) {
        res.status(500).json({ error: result.error })
        return
      }
      // Cache 5 minuti lato client
      res.setHeader('Cache-Control', 'public, max-age=300')
      res.json(result)
    } catch {
      res.status(500).json({ error: 'Risposta non valida dal motore astronomico' })
    }
  })
}

export const generateSummaryForExistingChart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId
  if (!userId) {
    res.status(401).json({ error: "Non autorizzato" })
    return
  }

  const { chartId } = req.body
  if (!chartId) {
    res.status(400).json({ error: "ID Tema Natale mancante" })
    return
  }

  try {
    const { pool } = await import('../db.js')
    
    // 1. Verifica proprietà
    const { rows } = await pool.query(
      `SELECT chart_data, interpretation, gender FROM natal_charts 
       WHERE id = $1 AND clerk_user_id = $2`,
      [chartId, userId]
    )

    if (rows.length === 0) {
      res.status(404).json({ error: "Tema Natale non trovato" })
      return
    }

    const chart = rows[0]
    // Rimuoviamo il blocco dell'interpretazione esistente per permettere la rigenerazione!

    // 2. Genera Interpretazione tramite Gemini
    const { generateChartInterpretation } = await import('../lib/gemini.js')
    const interpretation = await generateChartInterpretation(chart.chart_data, 'basic', chart.gender)

    // 3. Salva nel DB
    await pool.query(
      `UPDATE natal_charts SET interpretation = $1 WHERE id = $2`,
      [interpretation, chartId]
    )

    res.json({ interpretation })

  } catch (error: any) {
    console.error("Generate Summary API Error:", error)
    res.status(500).json({ error: 'Errore durante la generazione della sintesi' })
  }
}

export const generateStaffChart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.auth?.userId
  if (!userId) {
    res.status(401).json({ error: "Non autorizzato" })
    return
  }

  try {
    const { pool } = await import('../db.js')
    
    // 1. Verifica se l'utente è effettivamente Staff
    const { rows: staffCheck } = await pool.query(
      `SELECT is_staff FROM client_billing_profiles WHERE clerk_user_id = $1`,
      [userId]
    )
    
    // In alternativa, se usiamo i ruoli di Clerk, dovremmo controllare req.auth.sessionClaims.publicMetadata
    const isStaff = staffCheck[0]?.is_staff === true || (req as any).auth?.sessionClaims?.publicMetadata?.role === 'staff'
    
    if (!isStaff) {
      res.status(403).json({ error: "Accesso riservato allo staff" })
      return
    }

    const { birthDate, birthTime, city, gender } = paidSchema.parse(req.body)

    // 2. Astrology Engine + LLM Interpretation (Gratis per lo staff)
    const chartData = await runNatalCalculation(birthDate, birthTime, city)
    const { generateChartInterpretation } = await import('../lib/gemini.js')
    const interpretation = await generateChartInterpretation(chartData, 'advanced', gender)

    // 3. Salvataggio diretto (senza transazione Wallet)
    const insertRes = await pool.query(
      `INSERT INTO natal_charts (clerk_user_id, chart_type, birth_date, birth_time, city, gender, chart_data, interpretation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (clerk_user_id, birth_date, birth_time, city) 
       DO UPDATE SET chart_type = EXCLUDED.chart_type, interpretation = EXCLUDED.interpretation, gender = EXCLUDED.gender, created_at = now()
       RETURNING id`,
      [userId, 'advanced', birthDate, birthTime, city, gender, chartData, interpretation]
    )

    res.json({
      ...chartData,
      id: insertRes.rows[0].id,
      interpretation,
      chart_type: 'advanced',
      created_at: new Date().toISOString(),
      birthDate,
      birthTime,
      city
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message })
      return
    }
    console.error("Generate Staff API Error:", error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

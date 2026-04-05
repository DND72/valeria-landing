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
  city: z.string().min(2, "City name must be at least 2 characters")
})

export const calculateNatalChart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { birthDate, birthTime, city } = calcSchema.parse(req.body)

    // Path to the python engine
    const pythonScriptPath = path.join(__dirname, '../../python_engine/astrology.py')
    
    // Use python3 if available, otherwise python
    const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3'

    execFile(pythonExecutable, [pythonScriptPath, birthDate, birthTime, city], (error, stdout, stderr) => {
      if (error) {
        console.error("Python Execution Error:", error)
        console.error("Stderr:", stderr)
        return res.status(500).json({ error: "Failed to calculate astrological chart" })
      }
      
      try {
        const result = JSON.parse(stdout)
        if (result.error) {
          return res.status(400).json({ error: result.error })
        }
        
        // Rimuoviamo i dati premium (effemeridi e case) dall'endpoint gratuito
        delete result.pianeti
        delete result.case
        
        return res.json(result)
      } catch (e) {
        console.error("Failed to parse python output:", stdout)
        return res.status(500).json({ error: "Invalid data received from calculation engine" })
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message })
      return
    }
    console.error("Calculate API Error:", error)
    res.status(500).json({ error: 'Internal server error' })
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
    const { birthDate, birthTime, city, type } = paidSchema.parse(req.body)
    const cost = type === 'basic' ? 5 : 12

    // 1. Transaction to deduct credits
    const { pool } = await import('../db.js')
    const dbClient = await pool.connect()
    
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
        [userId, -cost, `natal_chart_${type}`]
      )
      
      await dbClient.query('COMMIT')
    } catch (dbErr) {
      await dbClient.query('ROLLBACK')
      throw dbErr
    } finally {
      dbClient.release()
    }

    // 2. Execute Python
    const pythonScriptPath = path.join(__dirname, '../../python_engine/astrology.py')
    const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3'

    const pythonOutput = await new Promise<string>((resolve, reject) => {
      execFile(pythonExecutable, [pythonScriptPath, birthDate, birthTime, city], (error, stdout, stderr) => {
        if (error) {
          console.error("Python Execution Error:", stderr)
          reject(new Error("Failed to calculate astrological chart"))
        } else {
          resolve(stdout)
        }
      })
    })

    const chartData = JSON.parse(pythonOutput)
    if (chartData.error) {
      res.status(400).json({ error: chartData.error })
      return
    }

    // 3. LLM Interpretation
    const { generateChartInterpretation } = await import('../lib/gemini.js')
    const interpretation = await generateChartInterpretation(chartData, type)

    // 4. Save to DB
    await pool.query(
      `INSERT INTO natal_charts (clerk_user_id, chart_type, birth_date, birth_time, city, chart_data, interpretation)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, type, birthDate, birthTime, city, chartData, interpretation]
    )

    res.json({
      ...chartData,
      interpretation
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


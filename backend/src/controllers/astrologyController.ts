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
    const pythonScriptPath = path.join(__dirname, '../../../python_engine/astrology.py')
    
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

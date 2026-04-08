
import { execFile } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: './backend/.env' })

async function runNatalCalculation(birthDate: string, birthTime: string, city: string): Promise<any> {
  const pythonScriptPath = path.join(__dirname, './backend/python_engine/astrology.py')
  return new Promise((resolve, reject) => {
    execFile('python', [pythonScriptPath, birthDate, birthTime, city], (error: any, stdout: string, stderr: string) => {
      if (error) return reject(error)
      try {
        const data = JSON.parse(stdout)
        if (data.error) return reject(new Error(data.error))
        resolve(data)
      } catch (e) {
        reject(new Error("Errore parsing output Python"))
      }
    })
  })
}

async function test() {
  console.log("--- TEST VALERIA MAGNUM ---")
  console.log("Calcolo dati astronomici (Roma, 1990-05-15 12:00)...")
  
  try {
    const chartData = await runNatalCalculation("1990-05-15", "12:00", "Roma")
    console.log("Dati calcolati! Aspetti trovati:", chartData.aspetti?.length || 0)
    console.log("Pianeti rilevati:", chartData.pianeti.map((p: any) => p.nome).join(', '))
    
    console.log("Generazione Interpretazione (4000 parole)...")
    const { generateChartInterpretation } = await import('./backend/src/lib/gemini.js')
    
    const interpretation = await generateChartInterpretation(chartData, 'advanced', 'F')
    
    fs.writeFileSync('output_valeria.md', interpretation)
    console.log("\n--- RISULTATO SALVATO IN output_valeria.md ---\n")
  } catch (err) {
    console.error("ERRORE:", err)
  }
}

test()

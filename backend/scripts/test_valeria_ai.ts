import { generateChartInterpretation } from '../src/lib/gemini.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })

async function test() {
  console.log('🔮 Test Sintesi di Valeria...\n')
  
  const mockChartData = {
    citta: 'Roma',
    ora_utc: '2026-03-31 12:00 UTC',
    segno: 'Leone',
    grado_nel_segno: 15.5,
    pianeti: [
      { nome: 'Sole', segno: 'Leone', gradi: 15.5 },
      { nome: 'Luna', segno: 'Sagittario', gradi: 10.2 }
    ]
  }

  try {
    const interpretation = await generateChartInterpretation(mockChartData, 'basic')
    console.log('✅ RISPOSTA DI VALERIA:\n')
    console.log(interpretation)
  } catch (error) {
    console.error('❌ ERRORE IA:', error)
  }
}

test()

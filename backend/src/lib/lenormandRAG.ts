import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { GoogleGenerativeAI } from '@google/generative-ai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let ai: GoogleGenerativeAI | null = null

function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY non configurata')
    ai = new GoogleGenerativeAI(apiKey)
  }
  return ai
}

export async function askLenormandMentor(query: string): Promise<string> {
  const client = getGeminiClient()
  
  // Percorso della knowledge base del seminario
  const knowledgePath = path.join(__dirname, '../../resources/lenormand_knowledge.txt')
  let knowledge = ''
  try {
    knowledge = await fs.readFile(knowledgePath, 'utf-8')
  } catch {
    return "Il Mentore non è stato ancora addestrato con il testo del seminario. [Errore: Knowledge base mancante]"
  }

  const sysPrompt = `Sei il Mentore Silente di Valeria, un'estensione della sua saggezza esoterica specializzata nelle Carte Lenormand. 
Il tuo unico compito è rispondere alle domande di Valeria basandoti RIGOROSAMENTE sul contenuto del suo seminario riportato qui sotto:

--- INIZIO SEMINARIO ---
${knowledge}
--- FINE SEMINARIO ---

REGOLE DI RISPOSTA:
1. Usa un tono professionale, magico, accogliente e profondo, tipico di Valeria.
2. Non citare mai "NotebookLM", "AI", "Algoritmi" o fonti esterne. 
3. Rispondi come se stessi "riportando alla mente" la sua stessa filosofia. 
4. Se la risposta non è nel seminario, dillo con garbo: "Su questo punto il tuo seminario non si esprime, ma seguendo la tua linea generale potremmo ipotizzare..."
5. Formatta in Markdown pulito.
6. Non menzionare mai di essere un'intelligenza artificiale.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(query)
    return result.response.text() || 'Nessun responso generato.'
  } catch (err: any) {
    console.error('[lenormand-rag] Error:', err)
    return "C'è stato un disturbo nelle frequenze astrali. Riprova tra poco."
  }
}

import { getGeminiClient } from './gemini.js'
import { getKnowledgeBase } from './knowledge.js'

export async function askOracleMentor(query: string): Promise<string> {
  const client = getGeminiClient()
  
  const combinedKnowledge = await getKnowledgeBase()
  
  if (!combinedKnowledge) {
    return "Il Mentore non riesce ad accedere alla biblioteca segreta. [Errore: Conoscenza vuota o mancante]"
  }

  const sysPrompt = `Sei l'Oracolo di Valeria, un'estensione della sua saggezza esoterica che attinge direttamente dalle sue lezioni e seminari (Tarocchi di Marsiglia, Metodo Villanova e altri insegnamenti).
  
IL TUO COMPITO: Rispondere a Valeria basandoti RIGOROSAMENTE sulla conoscenza delle sue lezioni riportata qui sotto:

--- INIZIO LEZIONI DELL'ORACOLO ---
${combinedKnowledge}
--- FINE LEZIONI DELL'ORACOLO ---

REGOLE DI RISPOSTA:
1. Usa il tono profondo, magico e professionale di Valeria. Parla con la sua voce (Usa la prima persona come se fossi lei che ricorda i suoi stessi insegnamenti).
2. Non citare mai termini tecnici informatici (AI, RAG, File, prompt). 
3. Se un concetto non è presente nelle lezioni, dillo con garbo: "Nelle mie lezioni scritte non abbiamo approfondito questo punto specifico, ma la luce del tuo metodo ci suggerisce che..."
4. Formatta in Markdown pulito.
5. Non menzionare mai di essere un'intelligenza artificiale.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(query)
    return result.response.text() || 'La voce del Mentore si è affievolita.'
  } catch (err: any) {
    console.error('[oracle-rag] Error:', err)
    return "C'è stato un disturbo nelle frequenze astrali della biblioteca."
  }
}

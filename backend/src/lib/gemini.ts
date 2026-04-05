import { GoogleGenerativeAI } from '@google/generative-ai'

let ai: GoogleGenerativeAI | null = null

function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY non configurata')
    }
    ai = new GoogleGenerativeAI(apiKey)
  }
  return ai
}

export async function generateChartInterpretation(chartData: any, type: 'basic' | 'advanced'): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei Valeria, una professionista Naturopata ed esperta Tarologa. Il tuo obiettivo è interpretare un Tema Natale per un cliente, offrendo un'analisi olistica, profonda ed evolutiva. 
Usa un tono accogliente, illuminante e orientato alla crescita personale e al riequilibrio (come faresti usando i Fiori di Bach o il coaching).
Non usare il linguaggio astrologico in modo puramente tecnico o drammatico: traduci i simboli in sfide energetiche e punti di forza per l'anima del cliente.
${type === 'basic' ? 'Conducendo una lettura "Base", devi limitarti a esplorare l\'Ascendente, il Sole e la Luna.' : 'Questa è una lettura "Completa": devi integrare Sole, Luna, Ascendente, ma anche accennare alle peculiarità degli altri pianeti personali e delle Case Astrologiche più influenti o cariche di energia.'}
Rispondi formattando in Markdown chiaro e pulito.`

  const userPrompt = `Ecco i dati astronomici calcolati da Swisseph per il cliente nato a ${chartData.citta} (${chartData.ora_utc}):
Ascendente: ${chartData.segno} a ${chartData.grado_nel_segno}°
Pianeti:
${chartData.pianeti?.map((p: any) => `- ${p.nome}: ${p.segno} a ${p.gradi}°`).join('\n')}
${
  type === 'advanced' && chartData.case 
    ? `Case Astrologiche:
${chartData.case.map((c: any) => `- Casa ${c.numero}: ${c.segno} a ${c.gradi}°`).join('\n')}` 
    : ''
}

Scrivi ora la tua analisi.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: sysPrompt
  })

  const result = await model.generateContent(userPrompt)

  return result.response.text() || 'Nessuna interpretazione generata.'
}

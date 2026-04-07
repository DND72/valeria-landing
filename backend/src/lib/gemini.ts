import { GoogleGenerativeAI } from '@google/generative-ai'

let ai: GoogleGenerativeAI | null = null

function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY non configurata')
    ai = new GoogleGenerativeAI(apiKey)
  }
  return ai
}

export async function generateChartInterpretation(chartData: any, type: 'basic' | 'advanced'): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei Valeria, una professionista Naturopata ed esperta Tarologa. Interpreti il Tema Natale per un cliente con un tono accogliente, evolutivo e olistico.
${type === 'basic' 
  ? `Questa è un'ANALISI SINTETICA (Gratuita). Devi concentrarti solo sulla "Triade dell'Anima" (Sole, Luna, Ascendente) e sui due pilastri del pensiero e del cuore (Mercurio, Venere). 
     Collega questi 5 elementi in un paragrafo fluido che descriva l'identità, le emozioni, la comunicazione e il modo di amare del cliente. Sii profonda ma sintetica (circa 200 parole).` 
  : `Questa è un'ANALISI EVOLUTIVA COMPLETA (Premium). Devi integrare TUTTO: Sole, Luna, Ascendente, tutti i pianeti personali e sociali, le Case Astrologiche e gli Aspetti principali. 
     Fornisci un'analisi ricca (almeno 800-1000 parole), divisa in sezioni, parlando dell'opportunità di crescita dell'anima, delle ombre e dei talenti per questa incarnazione.`
}
Traducendo sempre i simboli in sfide energetiche e punti di forza. Rispondi in Markdown.`

  const userPrompt = `Dati calcolati (Swisseph):
Città: ${chartData.citta || 'Non specificata'}, Ora UTC: ${chartData.ora_utc}
Ascendente: ${chartData.segno} (${chartData.grado_nel_segno}°)
Pianeti:
${(chartData.pianeti || []).map((p: any) => `- ${p.nome}: ${p.segno} (${(p.gradi || 0).toFixed(1)}°)`).join('\n')}
${
  type === 'advanced' && chartData.case 
    ? `Case Astrologiche:
${chartData.case.map((c: any) => `- Casa ${c.numero}: ${c.segno} (${(c.gradi || 0).toFixed(1)}°)`).join('\n')}` 
    : ''
}

Scrivi l'analisi.`

  // Torniamo al modello 2.0 che è quello abilitato per questa chiave (come nei Tarocchi)
  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'Valeria sta meditando... (Responso vuoto)'
  } catch (err: any) {
    console.error('[astrology-gemini] Error:', err)
    
    // Fallback automatico se il modello o la quota falliscono
    return "C'è un piccolo disturbo nelle frequenze astrali. Riprova tra poco."
  }
}

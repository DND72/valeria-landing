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
Segui lo stile di "AstriOnLine", utilizzando sezioni chiare, dirette ed evocative.

${type === 'basic' 
  ? `Questa è un'ANALISI SINTETICA (Gratuita). Devi concentrarti solo sulla "Triade dell'Anima":
     - ASCENDENTE [SEGNO]: Descrivi l'impatto visivo, il temperamento e l'approccio alla vita (es. vestire rigido, testardaggine).
     - SOLE [SEGNO]: Descrivi il nucleo dell'identità e la volontà.
     - LUNA [SEGNO]: Descrivi il mondo emotivo e l'inconscio.
     Collega questi elementi in un'analisi fluida di circa 200 parole. Rispondi in Markdown.` 
  : `Questa è un'ANALISI EVOLUTIVA COMPLETA (Premium). Devi generare un report ricco (800-1200 parole) diviso in sezioni strutturate (H2 o H3). 
     LO STILE DEVE ESSERE IDENTICO A QUESTI ESEMPI (Diretto, Concreto, Evocativo):
     - MARTE IN 3ª: "Non sei Niki Lauda, quando sei al volante ricorda che non stai facendo una gara."
     - GIOVE IN 12ª: "Rischi di gravi dissesti finanziari, ma risoluzione finale... possibili guadagni da lavoro in posti chiusi come carceri o ospedali."
     - SATURNO IN 5ª: "Prole poco numerosa. Se donna, cura di calcio per le ossa."
     - VENERE IN 2ª: "Possibilità di sposare una persona ricca. Interesse per la fotografia."

     SEZIONI RICHIESTE:
     1. **ASCENDENTE [SEGNO]**: Aspetto fisico, temperamento, approccio al mondo.
     2. **SOLE [SEGNO]**: Il cuore dell'identità.
     3. **SOLE CASA [N]**: L'area di realizzazione (es. "capacità di attrarre l'attenzione, attore o manager").
     4. **LUNA CASA [N]**: Bisogni emotivi, sensibilità (es. "viaggiatore, incontro con stranieri, preveggenza").
     5. **MERCURIO CASA [N]**: Intelligenza e comunicazione.
     6. **VENERE CASA [N]**: Amore, piacere e guadagni.
     7. **MARTE CASA [N]**: Energia e azione (usa toni schietti).
     8. **GIOVE CASA [N]**: Espansione e rischi finanziari.
     9. **SATURNO CASA [N]**: Prove e costruzione.
     10. **URANO/NETTUNO/PLUTONE**: Breve accenno se in case rilevanti.
     11. **SINTESI DI VALERIA**: Un consiglio finale olistico ed evolutivo.

     Usa Markdown, sii schietto e usa immagini concrete.`
}
Traducendo sempre i simboli in sfide energetiche e punti di forza.`

  const userPrompt = `Dati calcolati (Swisseph):
Città: ${chartData.citta || 'Non specificata'}, Ora UTC: ${chartData.ora_utc}
Ascendente: ${chartData.segno} (${chartData.grado_nel_segno}°)
Pianeti e Case:
${(chartData.pianeti || []).map((p: any) => `- ${p.nome}: ${p.segno} in Casa ${p.casa || '?'} (${(p.gradi || 0).toFixed(1)}°)`).join('\n')}

Scrivi l'analisi strutturata.`

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

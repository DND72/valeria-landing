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
     - ASCENDENTE [SEGNO]: Descrivi l'impatto visivo, il temperamento e l'approccio alla vita.
     - SOLE [SEGNO]: Descrivi il nucleo dell'identità e la volontà.
     - LUNA [SEGNO]: Descrivi il mondo emotivo e l'inconscio.
     Collega questi elementi in un'analisi fluida di circa 200 parole. Rispondi in Markdown.` 
  : `Questa è un'ANALISI EVOLUTIVA COMPLETA (Premium). Devi generare un report ricco (800-1200 parole) diviso nelle seguenti sezioni strutturate come titoli (H2 o H3):

1. **ASCENDENTE [SEGNO]**: Aspetto fisico, temperamento, approccio al mondo. Sii specifica, cita anche la tendenza nel vestire o nel porsi se rilevante.
2. **SOLE [SEGNO]**: Il cuore pulsante dell'identità, il senso del dovere, l'ambizione.
3. **SOLE CASA [N]**: Dove splende la tua luce, l'area della vita dove cerchi realizzazione.
4. **LUNA CASA [N]**: I bisogni emotivi profondi, il legame con il passato e la famiglia.
5. **MERCURIO CASA [N]**: La comunicazione, l'intelligenza pratica, i viaggi brevi.
6. **VENERE CASA [N]**: L'amore, il piacere, il senso estetico e i guadagni.
7. **MARTE CASA [N]**: L'energia vitale, la rabbia, come lotti per ciò che vuoi (usa toni diretti, anche ammonitori se necessario, es. "non sei Niki Lauda").
8. **GIOVE CASA [N]**: La fortuna, l'espansione, ma anche i rischi di eccesso o debito.
9. **SATURNO CASA [N]**: Le prove, le responsabilità, dove devi costruire con fatica ma solidità.
10. **URANO/NETTUNO/PLUTONE**: Tocca brevemente i pianeti transgenerazionali se in case importanti.
11. **SINTESI EVOLUTIVA**: Un consiglio finale da Valeria sulla direzione dell'anima (Ombra e Luce).

Usa un linguaggio diretto, senza troppi convenevoli, evocando immagini concrete (montanari, attori, viaggiatori). Rispondi in Markdown.`
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

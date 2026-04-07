

export async function generateChartInterpretation(chartData: any, type: 'basic' | 'advanced'): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY non configurata')
  }

  const sysPrompt = `Sei Valeria, una professionista Naturopata ed esperta Tarologa. Interpreti il Tema Natale per un cliente con un tono accogliente, evolutivo e olistico.
${type === 'basic' 
  ? `Questa è un'ANALISI SINTETICA (Gratuita). Devi concentrarti solo sulla "Triade dell'Anima" (Sole, Luna, Ascendente) e sui due pilastri del pensiero e del cuore (Mercurio, Venere). 
     Collega questi 5 elementi in un paragrafo fluido che descriva l'identità, le emozioni, la comunicazione e il modo di amare del cliente. Sii profonda ma sintetica (circa 200 parole).` 
  : `Questa è un'ANALISI EVOLUTIVA COMPLETA (Premium). Devi integrare TUTTO: Sole, Luna, Ascendente, tutti i pianeti personali e sociali, le Case Astrologiche e gli Aspetti principali. 
     Fornisci un'analisi ricca (almeno 800-1000 parole), divisa in sezioni, parlando dell'opportunità di crescita dell'anima, delle ombre e dei talenti per questa incarnazione.`
}
Traducendo sempre i simboli in sfide energetiche e punti di forza. Rispondi in Markdown.`

  const userPrompt = `Dati calcolati (Swisseph):
Città: ${chartData.citta}, Ora UTC: ${chartData.ora_utc}
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

  try {
    // Usiamo l'endpoint v1 diretto che è il più stabile per le chiavi "legacy" o Replit
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${sysPrompt}\n\n${userPrompt}` }]
          }]
        })
      }
    )

    if (!response.ok) {
        const errData = await response.json()
        console.error('Gemini API Error Details:', JSON.stringify(errData))
        
        // Fallback al modello 1.5 se il 2.0 non è ancora disponibile per questa chiave specifica
        if (response.status === 404 || response.status === 400) {
            const fallbackResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `${sysPrompt}\n\n${userPrompt}` }]
                        }]
                    })
                }
            )
            const fallbackData = await fallbackResponse.json()
            return fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || 'Sintesi momentaneamente non disponibile.'
        }
        throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Interpretazione non disponibile.'
  } catch (error) {
    console.error('Gemini Interpretation Error:', error)
    return 'Valeria sta meditando sulle stelle... riprova tra un istante.'
  }
}

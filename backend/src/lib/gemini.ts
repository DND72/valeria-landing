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

export async function generateChartInterpretation(chartData: any, type: 'basic' | 'advanced', gender: 'M' | 'F' = 'M'): Promise<string> {
  const client = getGeminiClient()
  
  const genderContext = (type === 'advanced' && gender) ? (gender === 'F' 
    ? "Il destinatario è una DONNA. Usa SEMPRE il femminile." 
    : "Il destinatario è un UOMO. Usa SEMPRE il maschile.")
    : "Questo è un responso IMPERSONALE. NON usare pronomi maschili o femminili.";

  const sysPrompt = `Sei l'Algoritmo Astrale del portale "Nonsolotarocchi". Il tuo compito è generare un report astrologico professionale basato sui calcoli delle effemeridi svizzere.
${genderContext}
Sii preciso, analitico e monumentale. Traduci i dati tecnici in potenziali evolutivi.
${type === 'basic' 
  ? `Questa è un'ANALISI SINTETICA GRATUITA. Concentrati sulla Triade dell'Anima in 700 parole. 
     Firma come "L'Algoritmo Astrale di Nonsolotarocchi". ALLA FINE, invita a richiedere l'Analisi Evolutiva Completa.` 
  : `Questa è l'ANALISI EVOLUTIVA MAGNUM. Scrivi un'opera enciclopedica di circa 6000 PAROLE. Espandi ogni concetto.
     STRUTTURA: Ascendente, Sole, Luna, Aspetti (fondamentale, 1500 parole), Nodi e Chirone, Mercurio/Venere/Marte, Giove/Saturno, Urano/Nettuno/Plutone, Sintesi.
     Firma: "L'Algoritmo Astrale di Nonsolotarocchi".`
}
NOTA: Concludi con: "Questa analisi è generata da un'intelligenza artificiale basata su dati astronomici. Per una lettura intuitiva e personalizzata che integri questi dati con la tua storia, consulta direttamente Valeria."`

  const userPrompt = `Dati Astrali:
Città: ${chartData.citta || 'Non specificata'}, Ora UTC: ${chartData.ora_utc}
Ascendente: ${chartData.segno} (${(chartData.grado_nel_segno || 0).toFixed(2)}°)
Pianeti:
${(chartData.pianeti || []).map((p: any) => `- ${p.nome}: ${p.segno} in Casa ${p.casa || '?'} (${(p.gradi || 0).toFixed(1)}°)`).join('\n')}
Aspetti:
${(chartData.aspetti || []).map((a: any) => `- ${a.p1} ${a.tipo} ${a.p2} (scarto ${a.orbita}°)`).join('\n')}

Genera l'Analisi Evolutiva.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'Il motore astrale è in manutenzione...'
  } catch (err: any) {
    console.error('[astrology-gemini] Error:', err)
    throw new Error("L'algoritmo ha rilevato una turbolenza nei dati. Riprova tra poco.")
  }
}

export async function generateTransitInterpretation(natalData: any, currentSky: any, transits: any, gender: 'M' | 'F' = 'M'): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei l'Algoritmo Astrale di Nonsolotarocchi. Scrivi l'ANALISI TECNICA DEI TRANSITI DI OGGI. 
  ${gender === 'F' ? 'Usa il femminile.' : 'Usa il maschile.'}
  
  Descrivi come le energie attuali impattano sulla carta natale fornita.
  STRUTTURA: Cielo di oggi, Transiti chiave, Consiglio algoritmico.
  Firma: "L'Algoritmo Astrale di Nonsolotarocchi".
  NOTA: Specifica che è un'analisi automatizzata e invita al consulto con Valeria per l'intuizione umana.`

  const userPrompt = `
  Dati Natali: ${JSON.stringify(natalData.pianeti || [])}
  Cielo Attuale: ${JSON.stringify(currentSky.luna)} e pianeti ${JSON.stringify(currentSky.pianeti || [])}
  Transiti Rilevati: ${JSON.stringify(transits)}
  
  Scrivi l'analisi dei transiti.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'I transiti sono velati...'
  } catch (err: any) {
    console.error('[transit-gemini] Error:', err)
    return "L'algoritmo sta ricalcolando le orbite..."
  }
}

export async function generateWeeklyForecast(natalData: any, weeklyTransits: any[], gender: 'M' | 'F' = 'M'): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei l'Algoritmo Astrale di Nonsolotarocchi. Scrivi la PROIEZIONE SETTIMANALE DEI TRANSITI.
  ${gender === 'F' ? 'Usa il femminile.' : 'Usa il maschile.'}
  
  Analizza la sequenza dei transiti in 5 aree: Mood, Giorni d'oro, Sfide, Amore/Lavoro, Azione consigliata.
  Firma: "L'Algoritmo Astrale di Nonsolotarocchi".
  NOTA: Specifica che è un'analisi AI e che Valeria può integrarla con una lettura dei Tarocchi.`

  const userPrompt = `
  Pianeti Natali: ${JSON.stringify(natalData.pianeti || [])}
  Sequenza Transiti: ${JSON.stringify(weeklyTransits)}
  
  Scrivi la proiezione settimanale.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'Dati settimanali non disponibili...'
  } catch (err: any) {
    console.error('[weekly-gemini] Error:', err)
    return "Il calcolo settimanale ha subito un rallentamento."
  }
}

export async function generateSynastryInterpretation(
  dataA: any, 
  dataB: any, 
  aspects: any[], 
  genderA: string = 'M', 
  genderB: string = 'F',
  nameA: string = 'Persona A',
  nameB: string = 'Persona B'
): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei l'Algoritmo Astrale di Nonsolotarocchi. Genera un'ANALISI DI SINASTRIA TECNICA (Libro dell'Amore).
  
  Soggetti: ${nameA} (${genderA}), ${nameB} (${genderB}).
  Usa i nomi reali nel testo.
  
  REPORT MONUMENTALE (6000 PAROLE):
  VOL. I: Profilo Astrale di ${nameA}.
  VOL. II: Profilo Astrale di ${nameB}.
  VOL. III: Alchimia dei Transiti e delle Posizioni tra i due. (Incontro, Sole/Luna, Mercurio, Venere/Marte, Saturno/Nodi, Verdetto dell'Algoritmo).
  
  Firma: "L'Algoritmo Astrale di Nonsolotarocchi".
  IMPORTANTE: Inserisci a metà e alla fine che questa è una mappatura tecnica del magnetismo tra due temi natali e che per decidere le sorti di una relazione è fondamentale un consulto umano di coaching/tarocchi con Valeria.`

  const userPrompt = `
  Dati ${nameA}: ${JSON.stringify(dataA.pianeti || [])}
  Dati ${nameB}: ${JSON.stringify(dataB.pianeti || [])}
  Aspetti Sinastria: ${JSON.stringify(aspects)}
  
  Genera il Libro dell'Amore.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'L\'alchimia è in calcolo...'
  } catch (err: any) {
    console.error('[synastry-gemini] Error:', err)
    return "L'algoritmo non riesce a intrecciare i dati in questo momento."
  }
}

export async function generateSynastryPreview(
  dataA: any, 
  dataB: any, 
  aspects: any[],
  nameA: string = 'A',
  nameB: string = 'B'
): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei l'Algoritmo Astrale di Nonsolotarocchi. Genera un'ANTEPRIMA DI ALCHIMIA (Gratuita). 
  Assaggio di 800 parole su ${nameA} e ${nameB}.
  FOCALIZZATI SU: Sole/Luna, Venere, Consiglio tecnico.
  
  Firma: "L'Algoritmo Astrale di Nonsolotarocchi".
  Messaggio finale: "Questa anteprima algoritmica è solo l'inizio. Per svelare l'anima e il destino della tua unione, richiedi il Libro dell'Amore o prenota una sessione privata con Valeria."`

  const userPrompt = `
  Partner: ${nameA} & ${nameB}
  Dati: ${JSON.stringify(dataA.pianeti || [])} vs ${JSON.stringify(dataB.pianeti || [])}
  Aspetti: ${JSON.stringify(aspects)}
  
  Genera l'assaggio d'alchimia.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'Assaggio non disponibile...'
  } catch (err: any) {
    console.error('[synastry-preview-gemini] Error:', err)
    return "Velo algoritmico rilevato. Riprova tra poco."
  }
}

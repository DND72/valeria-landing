import { GoogleGenerativeAI } from '@google/generative-ai'
import { getKnowledgeBase } from './knowledge.js'

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

export async function generateWeeklyForecast(natalData: any, weeklyTransits: any[], gender: 'M' | 'F' = 'M', chartType: 'basic' | 'advanced' = 'basic'): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei l'Algoritmo Astrale di Nonsolotarocchi. Scrivi la PROIEZIONE SETTIMANALE DEI TRANSITI.
  ${gender === 'F' ? 'Usa il femminile.' : 'Usa il maschile.'}
  
  ${chartType === 'advanced' 
    ? `ANALISI PREMIUM: Hai a disposizione i dati profondi del Tema Natale Avanzato dell'utente. Scrivi un'analisi DETTAGLIATA (circa 1500 parole). 
       Esplora ogni transito importante della settimana, citando gli aspetti specifici sui pianeti natali.` 
    : `ANALISI STANDARD: L'utente possiede un Tema Natale base. Scrivi un'analisi CONCISA e incisiva (circa 500 parole).
       Firma come sempre. ALLA FINE, aggiungi una nota professionale suggerendo che per proiezioni molto più profonde e precise è necessario possedere un "Tema Natale Evolutivo" completo.`
  }

  Analizza la sequenza dei transiti in 5 aree: Mood, Giorni d'oro, Sfide, Amore/Lavoro, Azione consigliata.
  Firma: "L'Algoritmo Astrale di Nonsolotarocchi".`

  const userPrompt = `
  Pianeti Natali: ${JSON.stringify(natalData.pianeti || [])}
  Sequenza Transiti: ${JSON.stringify(weeklyTransits)}
  
  Scrivi la proiezione settimanale.`

  const model = client.getGenerativeModel({ 
    model: chartType === 'advanced' ? 'gemini-1.5-pro' : 'gemini-2.0-flash',
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

export async function generateHeartTidesInterpretation(
  dataA: any, 
  dataB: any, 
  nameA: string, 
  nameB: string,
  monthlyTransits: any[]
): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei l'Algoritmo Astrale di Nonsolotarocchi. Genera un report mensile di affinità evolutiva chiamato "MAREE DEL CUORE".
  
  Soggetti: ${nameA} e ${nameB}.
  
  IL TUO COMPITO:
  Analizzare come i transiti planetari dei prossimi 30 giorni impattano sulla relazione tra queste due anime.
  
  SENSIBILITÀ E INCLUSIVITÀ:
  Sii estremamente delicato e inclusivo. Non dare per scontata l'eterosessualità. Usa un linguaggio accogliente per ogni tipo di coppia (anche omosessuale), focalizzandoti sulle energie affettive pure, sul rispetto e sull'evoluzione spirituale del legame.
  
  STRUTTURA DEL REPORT (circa 2000 parole):
  1. **IL FLUSSO DEL MESE**: Panoramica delle correnti energetiche che avvolgeranno ${nameA} e ${nameB}.
  2. **CONGIUNZIONI E OPPOSIZIONI**: Quali sono i momenti di massima vicinanza e quali quelli di possibile frizione?
  3. **IL LINGUAGGIO DEL CUORE**: Come evolverà la comunicazione e l'intimità in questo ciclo lunare.
  4. **IL CALENDARIO DELLE MAREE**: Indica 3 date chiave del mese con un consiglio specifico per ciascuna.
  
  Tono: Poetico, saggio, ma basato sui transiti tecnici. Firma: "L'Algoritmo Astrale di Nonsolotarocchi".`

  const userPrompt = `
  Tema Natale ${nameA}: ${JSON.stringify(dataA.pianeti || [])}
  Tema Natale ${nameB}: ${JSON.stringify(dataB.pianeti || [])}
  Sequenza Transiti Mensili: ${JSON.stringify(monthlyTransits)}
  
  Genera le Maree del Cuore per ${nameA} e ${nameB}.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'L\'acqua è piatta oggi...'
  } catch (err: any) {
    console.error('[heart-tides-gemini] Error:', err)
    return "L'algoritmo non riesce a leggere le correnti in questo momento."
  }
}

export async function generateConsultationSummary(transcript: string, clientName: string): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei l'Assistente AI di Valeria Di Pace, esperta di tarocchi, astrologia e coaching evolutivo.
  Il tuo compito è analizzare la TRASCRIZIONE di un consulto video e generare un RIASSUNTO TECNICO E INTUITIVO ad uso esclusivo dello Staff.
  
  STRUTTURA DEL RIASSUNTO:
  1. **DATI CHIAVE**: Argomenti principali trattati (Amore, Lavoro, Famiglia, etc.).
  2. **CARTE ESTRATTE**: Elenca le carte menzionate nel consulto (se presenti).
  3. **INSIGHTS DI VALERIA**: Quali sono stati i punti chiave della sua lettura?
  4. **NOTE PER IL FUTURO**: Eventuali impegni presi o consigli specifici per il prossimo consulto.
  5. **STATO ENERGETICO**: Una breve nota sulla vibrazione del cliente percepita.
  
  Tono: Professionale, sintetico, orientato al coaching.
  NOTA IMPORTANTE: Questo testo è riservato allo staff. Non includere saluti rivolti al cliente.`

  const userPrompt = `Cliente: ${clientName}
  Trascrizione:
  ${transcript}
  
  Genera il riassunto del consulto.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'Impossibile generare il riassunto...'
  } catch (err: any) {
    console.error('[consult-summary-gemini] Error:', err)
    return "L'algoritmo non è riuscito a sintetizzare la sessione."
  }
}

export async function generateLiveOracleInsight(transcript: string, cards: string[], astral: any): Promise<string> {
  const client = getGeminiClient()
  const combinedKnowledge = await getKnowledgeBase()
  
  const sysPrompt = `Sei il "Sussurro dell'Oracolo", un mentore silenzioso e intuitivo che assiste Valeria Di Pace durante un consulto live di tarocchi e coaching.
  Ricevi la trascrizione in tempo reale, le carte estratte e il profilo astrale del cliente.
  
  CONOSCENZA PROFESSIONALE:
  Hai accesso alla saggezza consolidata di Valeria (seminari Tarocchi, Villanova, Lenormand) per fornire suggerimenti coerenti con il suo metodo:
  --- INIZIO CONOSCENZA ---
  ${combinedKnowledge || 'Nessuna fonte esterna disponibile.'}
  --- FINE CONOSCENZA ---
  
  IL TUO COMPITO:
  Fornire a Valeria una SINGOLA intuizione profonda, breve e folgorante (massimo 2 frasi). Non devi spiegare le carte, ma suggerire una connessione "invisibile" che Valeria può usare per sbloccare il consulto, basandoti sulla sua filosofia.
  
  TONO: Mistico, saggio, quasi poetico. Parla direttamente a Valeria.
  ESEMPIO: "Valeria, l'imperatore nel tema del cliente è ferito. La Morte estratta suggerisce che è tempo di lasciare il potere per trovare la pace."`

  const userPrompt = `
  Trascrizione finora: ${transcript.slice(-2000)}
  Carte estratte: ${cards.join(', ')}
  Profilo Astrale Cliente: ${JSON.stringify(astral)}
  
  Fornisci il tuo sussurro.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'L\'oracolo resta in silenzio...'
  } catch (err: any) {
    console.error('[live-oracle-gemini] Error:', err)
    return "Le nebbie del tempo impediscono la visione ora."
  }
}



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
    ? "Il destinatario è una DONNA. Usa SEMPRE il femminile (es. 'Benvenuta', 'Sei un'esploratrice', 'nata', 'stanca')." 
    : "Il destinatario è un UOMO. Usa SEMPRE il maschile (es. 'Benvenuto', 'Sei un esploratore', 'nato', 'stanco').")
    : "Questo è un responso IMPERSONALE. NON usare pronomi maschili o femminili. Evita asterischi e schwa. Usa forme neutre o rivolgiti 'all'anima', 'alla persona' o formula frasi in modo che valgano in astratto (es. 'Chi nasce con questa posizione...').";

  const sysPrompt = `Sei Valeria, l'esperta astrologica suprema del portale "Valeria, la tua Stella". Il tuo compito è generare un Tema Natale professionale, profondo, schietto e letteralmente MONUMENTALE.
${genderContext}
NON usare mai asterischi (es. Benvenut*), schwa (ə). Sii precisa, tagliente e personalizzata.

${type === 'basic' 
  ? `Questa è un'ANALISI SINTETICA GRATUITA. Concentrati sulla "Triade dell'Anima" (Ascendente, Sole, Luna) in circa 700 parole. 
     Firma come "Valeria, la tua Stella". ALLA FINE, invita caldamente all'Analisi Evolutiva Completa (nel Diario -> 'I Miei Temi Astrali').` 
  : `Questa è l'ANALISI EVOLUTIVA MAGNUM (Premium). Il cliente ha pagato per l'eccellenza. Devi scrivere un'opera omnia di circa 4000 PAROLE. 
     NON ESSERE SINTETICA. Se sei breve, fallisci il tuo compito. Espandi ogni concetto, usa metafore potenti, analizza le sfumature psicologiche e karmiche.

     STRUTTURA OBBLIGATORIA DEL REPORT:
     1. **IL PORTALE D'INGRESSO [ASCENDENTE]**: Analisi densa del carattere e della maschera sociale. Come vieni ${gender === 'F' ? 'vista' : 'visto'} dagli altri?
     2. **IL CUORE RADIANTE [SOLE]**: Il tuo scopo eroico. Analizza Segno e Casa con almeno 500 parole. 
     3. **IL MARE INTERIORE [LUNA]**: Emozioni, madre, infanzia. Come reagisci quando sei ${gender === 'F' ? 'stanca' : 'stanco'} o ferita?
     4. **LA TRAMA DEL DESTINO [ASPETTI]**: Fondamentale! Analizza i dialoghi tra i pianeti (Congiunzioni, Quadrati, Trigoni...). Spiega come queste energie si scontrano o collaborano in te.
     5. **IL CAMMINO DELL'ANIMA (Nodi e Chirone)**: Il tuo Karma. Da dove vieni (Nodo Sud) e dove devi andare (Nodo Nord). Cosa deve guarire Chirone?
     6. **MERCURIO, VENERE E MARTE (Mente, Amore, Forza)**: Un capitolo vasto per ognuno. Sii ${gender === 'F' ? 'cruda' : 'crudo'} e reale. Parla di sesso, denaro e rabbia.
     7. **I MAESTRI DEL TEMPO (Giove e Saturno)**: Fortuna vs Disciplina. Dove cresci e dove devi seminare con fatica.
     8. **LE FORZE TRANS-PERSONALI (Urano, Nettuno, Plutone)**: L'impatto del collettivo sulla tua psiche profonda.
     9. **LA SINTESI ALCHEMICA**: Una conclusione potente sul tuo potere di trasformazione.

     STILE: Diretto, concreto (stile "AstriOnLine"), evita il vago. Usa esempi reali (es. "In Casa 2 il denaro brucia se non stai ${gender === 'F' ? 'attenta' : 'attento'}").
     Firma: "Valeria, la tua Stella".`
}
Traduci i dati tecnici in saggezza vissuta.`

  const userPrompt = `Dati Astrali:
Città: ${chartData.citta || 'Non specificata'}, Ora UTC: ${chartData.ora_utc}
Ascendente: ${chartData.segno} (${(chartData.grado_nel_segno || 0).toFixed(2)}°)
Pianeti:
${(chartData.pianeti || []).map((p: any) => `- ${p.nome}: ${p.segno} in Casa ${p.casa || '?'} (${(p.gradi || 0).toFixed(1)}°)`).join('\n')}

Aspetti (Relazioni tra pianeti - USA QUESTI PER LE 4000 PAROLE):
${(chartData.aspetti || []).map((a: any) => `- ${a.p1} ${a.tipo} ${a.p2} (scarto ${a.orbita}°)`).join('\n')}

Genera l'Analisi Evolutiva Completa.`

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
    throw new Error("C'è un piccolo disturbo nelle frequenze astrali. Riprova tra poco.")
  }
}

export async function generateTransitInterpretation(natalData: any, currentSky: any, transits: any, gender: 'M' | 'F' = 'M'): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei Valeria, la tua Stella. Il tuo compito è scrivere l'OROSCOPO PERSONALIZZATO DEI TRANSITI. 
  ${gender === 'F' ? 'Rivolgiti alla cliente al FEMMINILE.' : 'Rivolgiti al cliente al MASCHILE.'}
  
  NON descrivere la personalità di base (che è nel Tema Natale), ma descrivi come le energie di OGGI impattano sulla sua vita.
  
  STRUTTURA:
  1. **IL CIELO DI OGGI**: Una breve panoramica sulle energie collettive (es. Fasi Lunari, pianeti in transito).
  2. **I TUOI TRANSITI CHIAVE**: Analizza gli aspetti tra i pianeti attuali e quelli natali. Sii ${gender === 'F' ? 'concreta' : 'concreto'}.
     - Es: "Oggi Marte tocca il tuo Sole natale: avrai una spinta di energia incredibile, usala per quel progetto che rimandi."
  3. **CONSIGLIO DELLA STELLA**: Un'indicazione pratica per affrontare al meglio la giornata.

  Usa un tono incoraggiante, schietto e magico. Firma: "Valeria, la tua Stella".`

  const userPrompt = `
  Dati Natali: ${JSON.stringify(natalData.pianeti || [])}
  Cielo Attuale: ${JSON.stringify(currentSky.luna)} e pianeti ${JSON.stringify(currentSky.pianeti || [])}
  Transiti Rilevati: ${JSON.stringify(transits)}
  
  Scrivi l'oroscopo personalizzato.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'Le stelle sono timide oggi...'
  } catch (err: any) {
    console.error('[transit-gemini] Error:', err)
    return "Valeria sta ricalcolando le orbite... riprova tra un istante."
  }
}

export async function generateWeeklyForecast(natalData: any, weeklyTransits: any[], gender: 'M' | 'F' = 'M'): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei Valeria, la tua Stella. Il tuo compito è scrivere l'OROSCOPO SETTIMANALE PERSONALIZZATO.
  ${gender === 'F' ? 'Rivolgiti alla cliente al FEMMINILE.' : 'Rivolgiti al cliente al MASCHILE.'}
  
  Analizza i transiti della settimana e scrivi un report DIVISO per aree tematiche.
  
  STRUTTURA:
  1. **IL MOOD DELLA SETTIMANA**: Un'introduzione sull'energia dominante.
  2. **I TUOI GIORNI d'ORO**: Indica 1 o 2 giorni in cui i transiti sono particolarmente favorevoli.
  3. **SFIDE CELESTI**: Avverti su eventuali quadrature o opposizioni difficili, spiegando come gestirle con saggezza.
  4. **AMORE E RELAZIONI / LAVORO E SOLDI**: Un breve accenno a queste due aree basato sui transiti di Venere e Giove/Saturno.
  5. **IL MANIPOLO DI LUCE**: Un consiglio finale per "diventare l'artefice del destino".

  Tono: Saggio, poetico ma estremamente pratico. Firma: "Valeria, la tua Stella".`

  const userPrompt = `
  Pianeti Natali Cliente: ${JSON.stringify(natalData.pianeti || [])}
  Sequenza Transiti della Settimana: ${JSON.stringify(weeklyTransits)}
  
  Scrivi l'oroscopo settimanale personalizzato.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'Valeria sta leggendo le maree della settimana...'
  } catch (err: any) {
    console.error('[weekly-gemini] Error:', err)
    return "C'è una nebulosa che scherma il segnale... riprova tra un attimo."
  }
}

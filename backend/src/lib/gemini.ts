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
  : `Questa è l'ANALISI EVOLUTIVA MAGNUM (Premium). Il cliente ha pagato per l'eccellenza assoluta. Devi scrivere un'opera enciclopedica di circa 6000 PAROLE. 
     NON ESSERE SINTETICA. Se sei breve, fallisci il tuo compito. Espandi ogni concetto, usa metafore potenti, analizza le sfumature psicologiche, karmiche e transgenerazionali con una profondità mai vista.
     Ogni capitolo deve essere una colonna portante di saggezza.

     STRUTTURA OBBLIGATORIA DEL REPORT:
     1. **IL PORTALE D'INGRESSO [ASCENDENTE]**: Analisi densa (circa 500 parole) del carattere e della maschera sociale.
     2. **IL CUORE RADIANTE [SOLE]**: Il tuo scopo eroico. Analizza Segno e Casa con almeno 800 parole. 
     3. **IL MARE INTERIORE [LUNA]**: Emozioni, madre, infanzia. Come reagisci nell'ombra? (800 parole)
     4. **LA TRAMA DEL DESTINO [ASPETTI]**: Fondamentale! Analizza i dialoghi tra i pianeti con una precisione chirurgica. Almeno 1500 parole dedicate a come le forze si scontrano o collaborano.
     5. **IL CAMMINO DELL'ANIMA (Nodi e Chirone)**: Il tuo Karma. Nodo Sud (passato) e Nodo Nord (missione futura). Chirone e la tua ferita sacra. (800 parole)
     6. **MERCURIO, VENERE E MARTE (Mente, Amore, Forza)**: Analisi capillare su comunicazione, desideri profondi e modalità di azione.
     7. **I MAESTRI DEL TEMPO (Giove e Saturno)**: Fortuna, espansione, limiti e disciplina. Dove devi seminare con fatica per raccogliere l'oro.
     8. **LE FORZE TRANS-PERSONALI (Urano, Nettuno, Plutone)**: L'impatto del collettivo e dei poteri occulti sulla tua vita.
     9. **LA SINTESI ALCHEMICA**: Una conclusione monumentale sul tuo potere di trasformazione e sul tuo libero arbitrio.

     STILE: Magistrale, denso, concreto, senza giri di parole inutili ma ricco di contenuto sostanziale. Firma: "Valeria, la tua Stella".`
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

export async function generateSynastryInterpretation(
  dataA: any, 
  dataB: any, 
  aspects: any[], 
  genderA: string = 'M', 
  genderB: string = 'F'
): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei Valeria, l'esperta suprema di relazioni e anime compagne. Il tuo compito è scrivere una SINASTRIA DI COPPIA (Analisi di Affinità) MONUMENTALE, strutturata come un "Libro dell'Amore" in tre volumi.
  
  ${genderA === 'F' ? 'La Persona A è DONNA.' : 'La Persona A è UOMO.'}
  ${genderB === 'F' ? 'La Persona B è DONNA.' : 'La Persona B è UOMO.'}
  
  STRUTTURA OBBLIGATORIA DEL REPORT (MINIMO 5500-6000 PAROLE TOTALI):

  VOL. I: IL PROFILO EMOZIONALE DI PERSONA A (1000-1500 PAROLE)
  Analizza la sfera affettiva e comportamentale di A. Come si pone verso gli altri? Quali sono le sue ferite d'infanzia che influenzano l'amore? Come si comporta con il partner? Usa i pianeti di A (Sole, Luna, Venere, Marte, Chirone) per questa analisi enciclopedica.
  
  VOL. II: IL PROFILO EMOZIONALE DI PERSONA B (1000-1500 PAROLE)
  Analizza la sfera affettiva e comportamentale di B con la stessa profondità. Quali sono i suoi schemi di difesa? Cosa cerca davvero in una relazione? (1000-1500 parole).

  VOL. III: L'ALCHIMIA DELLA SINASTRIA (3000 PAROLE)
  Sviluppa ora l'analisi di coppia basandoti sui profili appena creati.
  1. **L'INCONTRO DELLE OMBRE**: Perché queste due specifiche nature si sono attratte?
  2. **IL DIALOGO DEL SOLE E DELLA LUNA**: La compatibilità essenziale delle anime.
  3. **MERCURIO E LA PAROLA**: Il ponte comunicativo.
  4. **VENERE E MARTE (IL FUOCO SACRO)**: L'intesa erotica e passionale senza filtri.
  5. **SATURNO E I NODI**: Il karma e la stabilità. È un legame eterno o una lezione temporanea?
  6. **IL VERDETTO DI VALERIA**: Sintesi finale e consiglio magico per la coppia.
  
  NON ESSERE SINTETICA. Ogni sezione deve essere densa, poetica ma cruda nella verità. Analizza ogni aspetto inter-planetario fornito. Firma: "Valeria, la tua Stella".`

  const userPrompt = `
  Persona A (Pianeti): ${JSON.stringify(dataA.pianeti || [])}
  Persona B (Pianeti): ${JSON.stringify(dataB.pianeti || [])}
  Aspetti di Sinastria (A vs B): ${JSON.stringify(aspects)}
  
  Genera l'Analisi di Affinità di Coppia Completa.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'Le anime sono in silenzio...'
  } catch (err: any) {
    console.error('[synastry-gemini] Error:', err)
    return "Valeria sta leggendo l'intreccio dei vostri destini... riprova tra un attimo."
  }
}

export async function generateSynastryPreview(
  dataA: any, 
  dataB: any, 
  aspects: any[], 
  genderA: string = 'M', 
  genderB: string = 'F'
): Promise<string> {
  const client = getGeminiClient()
  
  const sysPrompt = `Sei Valeria, l'esperta di relazioni. Questa è un'ANALISI DI ALCHIMIA BASE (Preview gratuita). 
  Il tuo compito è dare un assaggio potente della compatibilità tra queste due anime in circa 800 parole.
  
  FOCALIZZATI SU:
  1. **ALCHIMIA DEL SOLE E DELLA LUNA**: La compatibilità emotiva e di scopo.
  2. **VENERE E L'ATTRAZIONE**: Il primo sguardo delle anime.
  3. **UN CONSIGLIO DI VALERIA**: Un suggerimento rapido per la coppia.
  
  Sii evocativa, poetica e schietta. ALLA FINE, invita caldamente a richiedere il "Libro dell'Amore" completo (6000 parole) per svelare i nodi karmici e il destino a lungo termine della relazione.
  Firma: "Valeria, la tua Stella".`

  const userPrompt = `
  Persona A (Pianeti): ${JSON.stringify(dataA.pianeti || [])}
  Persona B (Pianeti): ${JSON.stringify(dataB.pianeti || [])}
  Aspetti di Sinastria (A vs B): ${JSON.stringify(aspects)}
  
  Genera l'Assaggio d'Alchimia di Coppia.`

  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: sysPrompt
  })

  try {
    const result = await model.generateContent(userPrompt)
    return result.response.text() || 'Valeria sta meditando sulla vostra alchimia...'
  } catch (err: any) {
    console.error('[synastry-preview-gemini] Error:', err)
    return "C'è un piccolo velo tra le vostre anime. Riprova tra poco per svelare l'alchimia."
  }
}

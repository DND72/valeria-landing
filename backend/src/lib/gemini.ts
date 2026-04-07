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
  
  const genderContext = gender === 'F' 
    ? "Il destinatario è una DONNA. Usa SEMPRE il femminile (es. 'Benvenuta', 'Sei un'esploratrice', 'nata', 'stanca')." 
    : "Il destinatario è un UOMO. Usa SEMPRE il maschile (es. 'Benvenuto', 'Sei un esploratore', 'nato', 'stanco').";

  const sysPrompt = `Sei Valeria, l'esperta astrologica del portale, conosciuta come "Valeria, la tua Stella". Il tuo compito è generare un Tema Natale professionale, profondo e schietto.
${genderContext}
NON usare mai asterischi (es. Benvenut*), schwa (ə) o forme neutre. Sii precisa e personalizzata in base al sesso indicato.

Segui fedelmente lo stile di "AstriOnLine": usa un linguaggio diretto, concreto, a tratti crudo ma sempre illuminante. Evita il gergo troppo "new age" astratto; preferisci immagini reali e consigli pratici.

${type === 'basic' 
  ? `Questa è un'ANALISI SINTETICA GRATUITA. Concentrati sulla "Triade dell'Anima":
     - ASCENDENTE: Il tuo biglietto da visita nel mondo.
     - SOLE: La tua essenza guerriera.
     - LUNA: Il tuo nido emotivo.
     Sintetizza tutto in circa 200-300 parole. Firma come "Valeria, la tua Stella".` 
  : `Questa è un'ANALISI EVOLUTIVA PREGIATA (Premium). Il cliente ha pagato per un'esperienza completa e "degna di questo nome". Devi scrivere un report monumentale (almeno 1200-1500 parole).
     Ogni sezione deve essere ricca, dettagliata e "viva". Non limitarti a descrizioni generiche.

     STILE E CONTENUTO OBBLIGATORIO (Esempi):
     - MARTE: "Ricorda, non sei Niki Lauda. La tua irruenza in Casa 3 ti rende ${gender === 'F' ? 'franca' : 'franco'}, a volte troppo, e ${gender === 'F' ? 'pericolosa' : 'pericoloso'} al volante."
     - GIOVE: "In Casa 12 la fortuna è un angelo custode silenzioso, ma ${gender === 'F' ? 'attenta' : 'attento'} ai dissesti finanziari se non rifletti prima di indebitarti."
     - SATURNO: "La disciplina qui è ferro. Se in 5ª, la prole sarà poca, e se sei donna, cura le tue ossa con il calcio."
     - VENERE: "Amore e denaro si intrecciano. Possibilità di matrimoni vantaggiosi o guadagni dall'arte."

     STRUTTURA DEL TEMA NATALE:
     1. **L'ASCENDENTE [SEGNO]**: Analisi dettagliata del temperamento e dell'aspetto fisico prestabilito dagli astri.
     2. **IL SOLE (La tua Identità)**: Analisi profonda del Segno e della Casa. Dove splende la tua autorità? Sei un manager, un attore o una guida?
     3. **LA LUNA (L'Inconscio)**: Il legame con la madre, il passato, la sensibilità (es. "${gender === 'F' ? 'viaggiatrice' : 'viaggiatore'} dell'anima, incontri con stranieri").
     4. **VENERE (Amore e Valori)**: Come ami e come guadagni. I tuoi gusti estetici e le tue fortune materiali.
     5. **MARTE (L'Azione)**: La tua forza d'urto, la tua sessualità, la tua rabbia. Sii ${gender === 'F' ? 'schietta' : 'schietto'} nell'avvertire sui rischi.
     6. **MERCURIO (La Mente)**: Come pensi, come scrivi, come ti muovi nel mondo.
     7. **GIOVE (La Fortuna e l'Eccesso)**: Dove la vita ti sorride e dove rischi di esagerare.
     8. **SATURNO (Il Maestro Severo)**: Dove incontrerai le prove più dure ma anche la stabilità eterna.
     9. **I PIANETI LENTI E IL DESTINO**: Urano, Nettuno e Plutone come forze collettive nel tuo privato.
     10. **SINTESI EVOLUTIVA FINALE**: Una visione d'insieme sul cammino della tua anima in questa vita.

     Usa Markdown con titoli eleganti, grassetti per i concetti chiave e una chiusura calda.
     FIRMA SEMPRE: "Valeria, la tua Stella".`
}
Traduci sempre i simboli planetari in sfide energetiche reali.`

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

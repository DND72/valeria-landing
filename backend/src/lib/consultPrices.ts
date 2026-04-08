/**
 * Mappa consulto → prezzo in centesimi di euro (per Stripe).
 * Aggiorna i valori se i prezzi cambiano.
 */
export type ConsultKind =
  | 'rapido'
  | 'breve'
  | 'completo'
  | 'coaching_intro'
  | 'coaching_30'
  | 'coaching_60'
  | 'coaching_pack5'
  | 'combo_light'
  | 'combo_full'
  | 'free'
  | 'chat_15'
  | 'chat_30'
  | 'chat_60'
  | 'instant_rapido'
  | 'instant_breve'
  | 'instant_completo'
  | 'instant_chat_15'
  | 'instant_chat_30'
  | 'instant_chat_60'

export type ConsultMeta = {
  /** Prezzo originario Stripe (mantenuto per legacy) */
  amountCents: number
  /** Costo in Crediti (Wallet) */
  costCredits: number
  /** Nome leggibile per la riga d'ordine in Stripe */
  name: string
  /** Descrizione breve per la riga d'ordine */
  description: string
  /** true = non richiede pagamento Stripe */
  isFree: boolean
  /** Durata effettiva in minuti del consulto */
  durationMinutes: number
}

export const CONSULT_META: Record<ConsultKind, ConsultMeta> = {
  rapido: {
    amountCents: 2000,
    costCredits: 20,
    name: 'Consulto rapido con Valeria',
    description: '15 min · Sessione digitale flash (audio/video)',
    isFree: false,
    durationMinutes: 15,
  },
  breve: {
    amountCents: 3600,
    costCredits: 36,
    name: 'Consulto approfondito con Valeria',
    description: '30 min · Sessione digitale di lettura dei Tarocchi',
    isFree: false,
    durationMinutes: 30,
  },
  completo: {
    amountCents: 6600,
    costCredits: 66,
    name: 'Consulto completo con Valeria',
    description: '60 min · Sessione digitale approfondita di Tarocchi',
    isFree: false,
    durationMinutes: 60,
  },
  coaching_intro: {
    amountCents: 0,
    costCredits: 0,
    name: 'Sessione di conoscenza Coaching',
    description: '10 min · Sessione digitale di conoscenza – gratuita',
    isFree: true,
    durationMinutes: 15,
  },
  coaching_30: {
    amountCents: 4800,
    costCredits: 48,
    name: 'Coaching - Sessione 30',
    description: '30 min · Crescita personale e obiettivi brevi',
    isFree: false,
    durationMinutes: 30,
  },
  coaching_60: {
    amountCents: 8700,
    costCredits: 87,
    name: 'Coaching - Sessione 60',
    description: '60 min · Crescita personale, obiettivi e piano d\'azione',
    isFree: false,
    durationMinutes: 60,
  },
  coaching_pack5: {
    amountCents: 39000,
    costCredits: 390,
    name: 'Coaching – Pacchetto 5 sedute',
    description: '5 sessioni da 60 min · Sconto quantità incluso',
    isFree: false,
    durationMinutes: 60,
  },
  combo_light: {
    amountCents: 11200,
    costCredits: 112,
    name: 'Combo Light "Focus & Azione"',
    description: '2× Consulto breve Tarocchi (30 min) + 1× Coaching (30 min)',
    isFree: false,
    durationMinutes: 30,
  },
  combo_full: {
    amountCents: 20700,
    costCredits: 207,
    name: 'Combo Full "TRASFORMAZIONE"',
    description: '2× Consulto completo Tarocchi (60 min) + 1× Coaching (60 min)',
    isFree: false,
    durationMinutes: 60,
  },
  free: {
    amountCents: 0,
    costCredits: 0,
    name: 'Consulto omaggio con Valeria',
    description: '7 min · Primo incontro gratuito',
    isFree: true,
    durationMinutes: 15,
  },
  chat_15: {
    amountCents: 1800,
    costCredits: 18,
    name: 'Live Chat (15 min)',
    description: '15 min · Sessione flash in ChatRoom',
    isFree: false,
    durationMinutes: 15,
  },
  chat_30: {
    amountCents: 3300,
    costCredits: 33,
    name: 'Live Chat (30 min)',
    description: '30 min · Sessione standard in ChatRoom',
    isFree: false,
    durationMinutes: 30,
  },
  chat_60: {
    amountCents: 6000,
    costCredits: 60,
    name: 'Live Chat (60 min)',
    description: '60 min · Sessione approfondita in ChatRoom',
    isFree: false,
    durationMinutes: 60,
  },
  instant_rapido: {
    amountCents: 2250,
    costCredits: 23,
    name: 'Consulto Rapido (Istantaneo)',
    description: '15 min · Fast-track digitale via Meet/Zoom/Chat',
    isFree: false,
    durationMinutes: 15,
  },
  instant_breve: {
    amountCents: 4200,
    costCredits: 42,
    name: 'Consulto Approfondito (Istantaneo)',
    description: '30 min · Video sessione immediata',
    isFree: false,
    durationMinutes: 30,
  },
  instant_completo: {
    amountCents: 7800,
    costCredits: 78,
    name: 'Consulto Completo (Istantaneo)',
    description: '60 min · Sessione completa immediata',
    isFree: false,
    durationMinutes: 60,
  },
  instant_chat_15: {
    amountCents: 2100,
    costCredits: 21,
    name: 'Chat Flash (Istantanea)',
    description: '15 min · Live Chat immediata',
    isFree: false,
    durationMinutes: 15,
  },
  instant_chat_30: {
    amountCents: 4200,
    costCredits: 42,
    name: 'Chat Standard (Istantanea)',
    description: '30 min · Live Chat immediata',
    isFree: false,
    durationMinutes: 30,
  },
  instant_chat_60: {
    amountCents: 7800,
    costCredits: 78,
    name: 'Chat Profonda (Istantanea)',
    description: '60 min · Live Chat immediata',
    isFree: false,
    durationMinutes: 60,
  },
}

export function isValidConsultKind(k: unknown): k is ConsultKind {
  return typeof k === 'string' && k in CONSULT_META
}

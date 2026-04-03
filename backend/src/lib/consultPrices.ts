/**
 * Mappa consulto → prezzo in centesimi di euro (per Stripe).
 * Aggiorna i valori se i prezzi cambiano.
 */
export type ConsultKind =
  | 'rapido'
  | 'breve'
  | 'online'
  | 'completo'
  | 'coaching_intro'
  | 'coaching_30'
  | 'coaching_60'
  | 'coaching_pack5'
  | 'combo_light'
  | 'combo_full'
  | 'free'

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
}

export const CONSULT_META: Record<ConsultKind, ConsultMeta> = {
  rapido: {
    amountCents: 1500,
    costCredits: 15,
    name: 'Consulto rapido con Valeria',
    description: '10 min · Sessione telefonica flash di Tarocchi',
    isFree: false,
  },
  breve: {
    amountCents: 4000,
    costCredits: 40,
    name: 'Consulto approfondito con Valeria',
    description: '30 min · Sessione telefonica di lettura dei Tarocchi',
    isFree: false,
  },
  online: {
    amountCents: 4000,
    costCredits: 40,
    name: 'Consulto online con Valeria',
    description: '30 min · Videochiamata di lettura dei Tarocchi',
    isFree: false,
  },
  completo: {
    amountCents: 8000,
    costCredits: 80,
    name: 'Consulto completo con Valeria',
    description: '60 min · Sessione telefonica approfondita di Tarocchi',
    isFree: false,
  },
  coaching_intro: {
    amountCents: 0,
    costCredits: 0,
    name: 'Sessione di conoscenza Coaching',
    description: '10 min · Videochiamata o telefono – gratuita',
    isFree: true,
  },
  coaching_30: {
    amountCents: 4000,
    costCredits: 40,
    name: 'Coaching - Sessione 30',
    description: '30 min · Crescita personale e obiettivi brevi',
    isFree: false,
  },
  coaching_60: {
    amountCents: 7000,
    costCredits: 70,
    name: 'Coaching - Sessione 60',
    description: '60 min · Crescita personale, obiettivi e piano d\'azione',
    isFree: false,
  },
  coaching_pack5: {
    amountCents: 30000,
    costCredits: 300,
    name: 'Coaching – Pacchetto 5 sedute',
    description: '5 sessioni da 60 min · 60€/seduta · Risparmio incluso',
    isFree: false,
  },
  combo_light: {
    amountCents: 9000,
    costCredits: 90,
    name: 'Combo Light "Focus & Azione"',
    description: '2× Consulto breve Tarocchi (30 min) + 1× Coaching (30 min)',
    isFree: false,
  },
  combo_full: {
    amountCents: 16000,
    costCredits: 160,
    name: 'Combo Full "TRASFORMAZIONE"',
    description: '2× Consulto completo Tarocchi (60 min) + 1× Coaching (60 min)',
    isFree: false,
  },
  free: {
    amountCents: 0,
    costCredits: 0,
    name: 'Consulto omaggio con Valeria',
    description: '7 min · Primo incontro gratuito',
    isFree: true,
  },
}

export function isValidConsultKind(k: unknown): k is ConsultKind {
  return typeof k === 'string' && k in CONSULT_META
}

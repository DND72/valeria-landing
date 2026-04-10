/**
 * Mappa consulto → prezzo in centesimi di euro (per Stripe).
 * Aggiorna i valori se i prezzi cambiano.
 */
export type ConsultKind =
  | 'tarocchi_flash'
  | 'tarocchi_prenotabile'
  | 'coaching_flash'
  | 'coaching_prenotabile'
  | 'combo_flash'
  | 'combo_prenotabile'
  | 'free'
  | 'chat_prenotabile'
  | 'chat_flash'

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
  tarocchi_flash: {
    amountCents: 1300,
    costCredits: 13,
    name: 'Tarocchi Flash',
    description: 'Consulto Tarocchi istantaneo (1,3 cr / min)',
    isFree: false,
    durationMinutes: 10,
  },
  tarocchi_prenotabile: {
    amountCents: 1000,
    costCredits: 10,
    name: 'Tarocchi Prenotabile',
    description: 'Consulto Tarocchi su appuntamento (1,0 cr / min)',
    isFree: false,
    durationMinutes: 10,
  },
  coaching_flash: {
    amountCents: 1500,
    costCredits: 15,
    name: 'Coaching Flash',
    description: 'Coaching immediato (1,5 cr / min)',
    isFree: false,
    durationMinutes: 10,
  },
  coaching_prenotabile: {
    amountCents: 1200,
    costCredits: 12,
    name: 'Coaching Prenotabile',
    description: 'Coaching su appuntamento (1,2 cr / min)',
    isFree: false,
    durationMinutes: 10,
  },
  combo_flash: {
    amountCents: 1700,
    costCredits: 17,
    name: 'Combo Flash',
    description: 'Tarocchi + Coaching immediato (1,7 cr / min)',
    isFree: false,
    durationMinutes: 10,
  },
  combo_prenotabile: {
    amountCents: 1400,
    costCredits: 14,
    name: 'Combo Prenotabile',
    description: 'Tarocchi + Coaching su appuntamento (1,4 cr / min)',
    isFree: false,
    durationMinutes: 10,
  },
  free: {
    amountCents: 0,
    costCredits: 0,
    name: 'Consulto omaggio con Valeria',
    description: '7 min · Primo incontro gratuito',
    isFree: true,
    durationMinutes: 7,
  },
  chat_prenotabile: {
    amountCents: 1000,
    costCredits: 10, 
    name: 'Chat Prenotabile',
    description: 'Chat programmata a tempo (1,0 cr / min)',
    isFree: false,
    durationMinutes: 10,
  },
  chat_flash: {
    amountCents: 1300,
    costCredits: 13, 
    name: 'Chat Flash',
    description: 'Chat prioritaria istantanea (1,3 cr / min)',
    isFree: false,
    durationMinutes: 10,
  },

export function isValidConsultKind(k: unknown): k is ConsultKind {
  return typeof k === 'string' && k in CONSULT_META
}

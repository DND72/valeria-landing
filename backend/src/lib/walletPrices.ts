export type TopUpKind = 'topup_15' | 'topup_30' | 'topup_50' | 'topup_100'

export type TopUpMeta = {
  /** Prezzo in centesimi da addebitare su Stripe */
  amountCents: number
  /** Quanti crediti vengono ricaricati sul wallet */
  credits: number
  /** Nome visibile su Stripe Checkout */
  name: string
  /** Descrizione visibile su Stripe Checkout */
  description: string
}

export const TOPUP_META: Record<TopUpKind, TopUpMeta> = {
  topup_15: {
    amountCents: 1500,
    credits: 15,
    name: 'Ricarica 15 Crediti',
    description: 'Aggiunge 15 Crediti al tuo Wallet',
  },
  topup_30: {
    amountCents: 3000,
    credits: 32, // +2 crediti omaggio ad esempio
    name: 'Ricarica 30 Crediti',
    description: 'Aggiunge 30 Crediti + 2 Omaggio al tuo Wallet',
  },
  topup_50: {
    amountCents: 5000,
    credits: 55, // +5 crediti omaggio
    name: 'Ricarica 50 Crediti',
    description: 'Aggiunge 50 Crediti + 5 Omaggio al tuo Wallet',
  },
  topup_100: {
    amountCents: 10000,
    credits: 115, // +15 crediti omaggio
    name: 'Ricarica 100 Crediti',
    description: 'Aggiunge 100 Crediti + 15 Omaggio al tuo Wallet',
  },
}

export function isValidTopUpKind(k: unknown): k is TopUpKind {
  return typeof k === 'string' && k in TOPUP_META
}

export type TopUpKind = 'topup_30' | 'topup_50' | 'topup_80' | 'topup_150'

export type TopUpMeta = {
  /** Prezzo in centesimi */
  amountCents: number
  /** Quanti crediti vengono ricaricati sul wallet */
  credits: number
  name: string
  description: string
}

export const TOPUP_META: Record<TopUpKind, TopUpMeta> = {
  topup_30: {
    amountCents: 3000,
    credits: 30,
    name: 'Ricarica Nebula',
    description: '30 Crediti per il tuo viaggio astrale',
  },
  topup_50: {
    amountCents: 5000,
    credits: 55, // +5 bonus
    name: 'Ricarica Stella',
    description: '50 Crediti + 5 Omaggio',
  },
  topup_80: {
    amountCents: 8000,
    credits: 90, // +10 bonus
    name: 'Ricarica Cometa',
    description: '80 Crediti + 10 Omaggio',
  },
  topup_150: {
    amountCents: 15000,
    credits: 180, // +30 bonus
    name: 'Ricarica Sole',
    description: '150 Crediti + 30 Omaggio',
  },
}

export function isValidTopUpKind(k: unknown): k is TopUpKind {
  return typeof k === 'string' && k in TOPUP_META
}

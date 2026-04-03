export type TopUpKind = 'topup_15' | 'topup_30' | 'topup_50' | 'topup_100'

export type TopUpMeta = {
  amountCents: number
  credits: number
  name: string
  description: string
  popular?: boolean
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
    credits: 32,
    name: 'Ricarica 30 Crediti',
    description: 'Ottieni 30 Crediti + 2 Omaggio',
    popular: true,
  },
  topup_50: {
    amountCents: 5000,
    credits: 55,
    name: 'Ricarica 50 Crediti',
    description: 'Ottieni 50 Crediti + 5 Omaggio',
  },
  topup_100: {
    amountCents: 10000,
    credits: 115,
    name: 'Ricarica 100 Crediti',
    description: 'Ottieni 100 Crediti + 15 Omaggio',
  },
}

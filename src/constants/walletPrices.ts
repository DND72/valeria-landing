export type TopUpKind = 'topup_30' | 'topup_50' | 'topup_80' | 'topup_150'

export type TopUpMeta = {
  amountCents: number
  credits: number
  name: string
  description: string
  popular?: boolean
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
    credits: 55,
    name: 'Ricarica Astro',
    description: '50 Crediti + 5 Omaggio',
    popular: true,
  },
  topup_80: {
    amountCents: 8000,
    credits: 90,
    name: 'Ricarica Cometa',
    description: '80 Crediti + 10 Omaggio',
  },
  topup_150: {
    amountCents: 15000,
    credits: 180,
    name: 'Ricarica Sole',
    description: '150 Crediti + 30 Omaggio',
  },
}

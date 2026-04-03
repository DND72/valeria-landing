/** Tipi di consulto mostrati nelle card (stessa grafica “dorata” di prima). */
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

export type ConsultChoice = {
  kind: ConsultKind
  name: string
  duration: string
  priceLabel: string
  icon: string
  costCredits: number
}

export const CONSULT_CHOICES: ConsultChoice[] = [
  { kind: 'rapido', name: 'Consulto rapido', duration: '10 min · Telefonico', priceLabel: '1,50 €/min', icon: '🚀', costCredits: 15 },
  { kind: 'breve', name: 'Consulto approfondito', duration: '30 min · Telefonico', priceLabel: '1,40 €/min', icon: '🌙', costCredits: 42 },
  { kind: 'online', name: 'Consulto online', duration: '30 min · Videochiamata', priceLabel: '1,40 €/min', icon: '🌐', costCredits: 42 },
  { kind: 'completo', name: 'Consulto completo', duration: '60 min · Telefonico', priceLabel: '1,30 €/min', icon: '✨', costCredits: 78 },
  {
    kind: 'coaching_intro',
    name: 'Coaching · Conoscenza',
    duration: '10 min · Video o telefono',
    priceLabel: 'Gratis',
    icon: '🌱',
    costCredits: 0
  },
  {
    kind: 'coaching_30',
    name: 'Coaching - Sessione 30',
    duration: '30 min · Video o telefono',
    priceLabel: '40 CR',
    icon: '🍃',
    costCredits: 40
  },
  {
    kind: 'coaching_60',
    name: 'Coaching - Sessione 60',
    duration: '60 min · Video o telefono',
    priceLabel: '70 CR',
    icon: '🌿',
    costCredits: 70
  },
  {
    kind: 'coaching_pack5',
    name: 'Coaching · 5 sedute',
    duration: '5 appuntamenti separati · 1 h ciascuno',
    priceLabel: '300 CR (60/sed)',
    icon: '🌳',
    costCredits: 300
  },
  { kind: 'free', name: 'Consulto omaggio', duration: '7 minuti con Valeria', priceLabel: 'Free', icon: '🎁', costCredits: 0 },
]

/** Settore offerta nel Diario cliente: letture vs coaching/crescita personale vs combo. */
export type OfferCategory = 'tarocchi' | 'crescita' | 'combo'

export function consultOfferCategory(kind: ConsultKind): OfferCategory {
  if (kind.startsWith('combo_')) return 'combo'
  if (kind.startsWith('coaching_')) return 'crescita'
  return 'tarocchi'
}

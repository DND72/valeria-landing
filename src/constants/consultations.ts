/** Tipi di consulto mostrati nelle card (stessa grafica “dorata” di prima). */
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

export type ConsultChoice = {
  kind: ConsultKind
  name: string
  duration: string
  priceLabel: string
  icon: string
  costCredits: number
}

export const CONSULT_CHOICES: ConsultChoice[] = [
  { kind: 'rapido', name: 'Consulto rapido', duration: '10 min · Digitale', priceLabel: '1,50 €/min', icon: '🚀', costCredits: 15 },
  { kind: 'breve', name: 'Consulto approfondito', duration: '30 min · Digitale', priceLabel: '1,40 €/min', icon: '🌙', costCredits: 42 },
  { kind: 'completo', name: 'Consulto completo', duration: '60 min · Digitale', priceLabel: '1,30 €/min', icon: '✨', costCredits: 78 },
  {
    kind: 'coaching_intro',
    name: 'Coaching · Conoscenza',
    duration: '10 min · Digitale',
    priceLabel: 'Gratis',
    icon: '🌱',
    costCredits: 0
  },
  {
    kind: 'coaching_30',
    name: 'Coaching - Sessione 30',
    duration: '30 min · Digitale',
    priceLabel: '1,60 €/min',
    icon: '🍃',
    costCredits: 48
  },
  {
    kind: 'coaching_60',
    name: 'Coaching - Sessione 60',
    duration: '60 min · Digitale',
    priceLabel: '1,45 €/min',
    icon: '🌿',
    costCredits: 87
  },
  {
    kind: 'coaching_pack5',
    name: 'Coaching · 5 sedute',
    duration: '5 appuntamenti separati · 1 h ciascuno',
    priceLabel: '1,30 €/min',
    icon: '🌳',
    costCredits: 390
  },
  { kind: 'free', name: 'Consulto omaggio', duration: '7 minuti con Valeria', priceLabel: 'Free', icon: '🎁', costCredits: 0 },
  { kind: 'chat_15', name: 'Chat Flash', duration: '15 min · Testo in Diretta', priceLabel: '1,40 €/min', icon: '⚡', costCredits: 21 },
  { kind: 'chat_30', name: 'Chat Standard', duration: '30 min · Testo in Diretta', priceLabel: '1,40 €/min', icon: '💬', costCredits: 42 },
  { kind: 'chat_60', name: 'Chat Profonda', duration: '60 min · Testo in Diretta', priceLabel: '1,40 €/min', icon: '✨', costCredits: 84 },
]

/** Settore offerta nel Diario cliente: letture vs coaching/crescita personale vs combo. */
export type OfferCategory = 'tarocchi' | 'crescita' | 'combo' | 'chat'

export function consultOfferCategory(kind: ConsultKind): OfferCategory {
  if (kind.startsWith('chat_')) return 'chat'
  if (kind.startsWith('combo_')) return 'combo'
  if (kind.startsWith('coaching_')) return 'crescita'
  return 'tarocchi'
}

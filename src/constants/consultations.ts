/** Tipi di consulto mostrati nelle card (stessa grafica “dorata” di prima). */
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

export type ConsultChoice = {
  kind: ConsultKind
  name: string
  duration: string
  priceLabel: string
  icon: string
  costCredits: number
}

export const CONSULT_CHOICES: ConsultChoice[] = [
  { kind: 'free', name: 'Consulto omaggio', duration: '7 minuti con Valeria', priceLabel: 'Free', icon: '🎁', costCredits: 0 },
  { kind: 'tarocchi_flash', name: 'Tarocchi Flash', duration: 'A Tempo', priceLabel: '1,30 cr/min', icon: '⚡', costCredits: 1.3 },
  { kind: 'tarocchi_prenotabile', name: 'Tarocchi Prenotabile', duration: 'A Tempo', priceLabel: '1,00 cr/min', icon: '✨', costCredits: 1.0 },
  { kind: 'coaching_flash', name: 'Coaching Flash', duration: 'A Tempo', priceLabel: '1,50 cr/min', icon: '⚡', costCredits: 1.5 },
  { kind: 'coaching_prenotabile', name: 'Coaching Prenotabile', duration: 'A Tempo', priceLabel: '1,20 cr/min', icon: '🌱', costCredits: 1.2 },
  { kind: 'chat_flash', name: 'Chat Flash', duration: 'A Tempo', priceLabel: '1,30 cr/min', icon: '⚡', costCredits: 1.3 },
  { kind: 'chat_prenotabile', name: 'Chat Prenotabile', duration: 'A Tempo', priceLabel: '1,00 cr/min', icon: '💬', costCredits: 1.0 },
  { kind: 'combo_flash', name: 'Combo Flash', duration: 'A Tempo', priceLabel: '1,70 cr/min', icon: '⚡', costCredits: 1.7 },
  { kind: 'combo_prenotabile', name: 'Combo Prenotabile', duration: 'A Tempo', priceLabel: '1,40 cr/min', icon: '🔥', costCredits: 1.4 },
]

/** Settore offerta nel Diario cliente: letture vs coaching/crescita personale vs combo. */
export type OfferCategory = 'tarocchi' | 'crescita' | 'combo' | 'chat'

export function consultOfferCategory(kind: ConsultKind): OfferCategory {
  if (kind.startsWith('chat_')) return 'chat'
  if (kind.startsWith('combo_')) return 'combo'
  if (kind.startsWith('coaching_')) return 'crescita'
  return 'tarocchi'
}

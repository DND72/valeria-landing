/** Tipi di consulto mostrati nelle card (stessa grafica “dorata” di prima). */
export type ConsultKind =
  | 'breve'
  | 'online'
  | 'completo'
  | 'coaching_intro'
  | 'coaching_60'
  | 'coaching_pack5'
  | 'free'

export type ConsultChoice = {
  kind: ConsultKind
  name: string
  duration: string
  priceLabel: string
  icon: string
}

export const CONSULT_CHOICES: ConsultChoice[] = [
  { kind: 'breve', name: 'Consulto breve', duration: '30 min · Telefonico', priceLabel: '30€', icon: '🌙' },
  { kind: 'online', name: 'Consulto online', duration: '30 min · Videochiamata', priceLabel: '40€', icon: '🌐' },
  { kind: 'completo', name: 'Consulto completo', duration: '60 min · Telefonico', priceLabel: '50€', icon: '✨' },
  {
    kind: 'coaching_intro',
    name: 'Coaching · Conoscenza',
    duration: '10 min · Video o telefono',
    priceLabel: 'Gratis',
    icon: '🌱',
  },
  {
    kind: 'coaching_60',
    name: 'Coaching · Sessione',
    duration: '60 min · Video o telefono',
    priceLabel: '80€',
    icon: '🌿',
  },
  {
    kind: 'coaching_pack5',
    name: 'Coaching · 5 sedute',
    duration: 'Pacchetto · date su Calendly',
    priceLabel: '350€',
    icon: '🌳',
  },
  { kind: 'free', name: 'Consulto omaggio', duration: '7 minuti con Valeria', priceLabel: 'Omaggio', icon: '🎁' },
]

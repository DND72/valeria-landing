/** Tipi di consulto mostrati nelle card (stessa grafica “dorata” di prima). */
export type ConsultKind = 'breve' | 'online' | 'completo' | 'coaching' | 'free'

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
  { kind: 'coaching', name: 'Crescita personale', duration: '50 min · Video o telefono', priceLabel: '45€', icon: '🌱' },
  { kind: 'free', name: 'Consulto omaggio', duration: '7 minuti con Valeria', priceLabel: 'Omaggio', icon: '🎁' },
]

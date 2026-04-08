export type AstralStatus = 'nebula' | 'stella_fissa' | 'cometa' | 'sole_centrale'

export interface StatusMeta {
  label: string
  discountEmoji: string
  discountFactor: number // e.g. 0.95 for 5% off
  color: string
  description: string
}

export const ASTRAL_STATUSES: Record<AstralStatus, StatusMeta> = {
  nebula: {
    label: 'Nebula',
    discountEmoji: '☁️',
    discountFactor: 1,
    color: 'text-white/40',
    description: 'Il tuo viaggio è appena iniziato. Esplora il cosmo.'
  },
  stella_fissa: {
    label: 'Stella Fissa',
    discountEmoji: '✨',
    discountFactor: 0.95,
    color: 'text-emerald-400',
    description: 'La tua luce è costante. 5% di sconto su tutti i consulti.'
  },
  cometa: {
    label: 'Cometa',
    discountEmoji: '☄️',
    discountFactor: 0.90,
    color: 'text-gold-400',
    description: 'Corri veloce nel cielo. 10% di sconto su tutti i consulti.'
  },
  sole_centrale: {
    label: 'Sole Centrale',
    discountEmoji: '☀️',
    discountFactor: 0.85,
    color: 'text-amber-500',
    description: 'Il centro del tuo universo. 15% di sconto su tutti i consulti.'
  }
}

export function getAstralStatus(user: any, doneCount: number = 0): AstralStatus {
  // Se forzato via metadata (per sconti speciali manuali)
  if (user?.publicMetadata?.astralStatus) return user.publicMetadata.astralStatus as AstralStatus

  if (doneCount >= 15) return 'sole_centrale'
  if (doneCount >= 8) return 'cometa'
  if (doneCount >= 3) return 'stella_fissa'
  return 'nebula'
}

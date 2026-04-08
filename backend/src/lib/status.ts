export type AstralStatus = 'nebula' | 'stella_fissa' | 'cometa' | 'sole_centrale'

export interface StatusMeta {
  label: string
  discountFactor: number
}

export const ASTRAL_STATUSES: Record<AstralStatus, StatusMeta> = {
  nebula: {
    label: 'Nebula',
    discountFactor: 1
  },
  stella_fissa: {
    label: 'Stella Fissa',
    discountFactor: 0.95
  },
  cometa: {
    label: 'Cometa',
    discountFactor: 0.90
  },
  sole_centrale: {
    label: 'Sole Centrale',
    discountFactor: 0.85
  }
}

export function calculateAstralStatus(doneCount: number, metadataStatus?: string): AstralStatus {
  if (metadataStatus && metadataStatus in ASTRAL_STATUSES) {
    return metadataStatus as AstralStatus
  }

  if (doneCount >= 15) return 'sole_centrale'
  if (doneCount >= 8) return 'cometa'
  if (doneCount >= 3) return 'stella_fissa'
  return 'nebula'
}

export function getDiscountFactor(doneCount: number, metadataStatus?: string): number {
  const status = calculateAstralStatus(doneCount, metadataStatus)
  return ASTRAL_STATUSES[status].discountFactor
}

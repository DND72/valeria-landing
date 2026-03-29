/** Classificazione indicativa dal nome tipo evento Calendly (testo libero). */
export type ServiceKind = 'tarocchi' | 'coaching' | 'unknown'

export function serviceKindFromEventName(name: string | null | undefined): ServiceKind {
  const n = (name ?? '').toLowerCase()
  if (!n.trim()) return 'unknown'

  const coachingHints = [
    'coaching',
    'crescita',
    'conoscenza',
    'pacchetto',
    'pack',
    'seduta',
    'sessione',
    '70',
    '60',
    '80',
    '300',
    '350',
    '400',
    '5 sedute',
    '5 x',
  ]
  const tarotHints = [
    'taroc',
    'lettura',
    'stesa',
    'consulto breve',
    'consulto online',
    'consulto completo',
    'omaggio',
    'gratuit',
    '7 min',
    'telefon',
    'videochiamata',
  ]

  const hitC = coachingHints.some((h) => n.includes(h))
  const hitT = tarotHints.some((h) => n.includes(h))

  if (hitC && hitT) return 'unknown'
  if (hitC) return 'coaching'
  if (hitT) return 'tarocchi'
  return 'unknown'
}

export type ClientServiceMix = 'tarocchi' | 'coaching' | 'entrambi' | 'sconosciuto'

/** Riepilogo per email: se ha avuto consulti classificati tarocchi e/o coaching. */
export function clientServiceMixFromKinds(kinds: ServiceKind[]): ClientServiceMix {
  const hasT = kinds.some((k) => k === 'tarocchi')
  const hasC = kinds.some((k) => k === 'coaching')
  const hasU = kinds.some((k) => k === 'unknown')
  if (hasT && hasC) return 'entrambi'
  if (hasT) return 'tarocchi'
  if (hasC) return 'coaching'
  if (hasU) return 'sconosciuto'
  return 'sconosciuto'
}

import type { ConsultKind } from './consultations'

/**
 * URL pubblici Calendly (Tipi di evento → Copia link).
 * Per il flusso “prima card, poi calendario”: un URL per tipo di consulto.
 * Se non imposti gli URL dedicati, i tre a pagamento usano lo stesso fallback (CALENDLY_BOOKING_URL).
 *
 * Opzionale in .env / Railway (poi rebuild):
 *   VITE_CALENDLY_CONSULTO_BREVE, VITE_CALENDLY_CONSULTO_ONLINE, VITE_CALENDLY_CONSULTO_COMPLETO
 *   VITE_CALENDLY_FREE
 */
const DEFAULT_BOOKING =
  'https://calendly.com/valeriadipace?hide_gdpr_banner=1&background_color=0a0e1a&text_color=f5f0e8&primary_color=d4a017'

const DEFAULT_FREE =
  'https://calendly.com/valeriadipace/new-meeting-2?hide_gdpr_banner=1&background_color=0a0e1a&text_color=f5f0e8&primary_color=d4a017'

function envTrim(key: string): string | undefined {
  const v = import.meta.env[key as keyof ImportMetaEnv]
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined
}

function envBooking(fallback: string): string {
  return envTrim('VITE_CALENDLY_BOOKING_URL') ?? fallback
}

/** Embed homepage / fallback generico */
export const CALENDLY_BOOKING_URL = envBooking(DEFAULT_BOOKING)

/** Calendly per tipo di consulto — dopo la scelta dalla card dorata. */
export function calendlyUrlForConsult(kind: ConsultKind): string {
  switch (kind) {
    case 'breve':
      return envTrim('VITE_CALENDLY_CONSULTO_BREVE') ?? CALENDLY_BOOKING_URL
    case 'online':
      return envTrim('VITE_CALENDLY_CONSULTO_ONLINE') ?? CALENDLY_BOOKING_URL
    case 'completo':
      return envTrim('VITE_CALENDLY_CONSULTO_COMPLETO') ?? CALENDLY_BOOKING_URL
    case 'free':
      return envTrim('VITE_CALENDLY_FREE') ?? DEFAULT_FREE
  }
}

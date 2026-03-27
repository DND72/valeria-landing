/**
 * URL pubblici Calendly (copiali da Calendly → Tipi di evento → Copia link).
 * Opzionale: sovrascrivi con VITE_CALENDLY_BOOKING_URL / VITE_CALENDLY_FREE_URL in .env o Railway (poi rebuild).
 *
 * In Calendly → Impostazioni → Condivisione: aggiungi il dominio del sito (es. nonsolotarocchi.it) se l’embed è bloccato.
 */
const DEFAULT_BOOKING =
  'https://calendly.com/valeriadipace?hide_gdpr_banner=1&background_color=060608&text_color=f5f0e8&primary_color=d4a017'
const DEFAULT_FREE =
  'https://calendly.com/valeriadipace/new-meeting-2?hide_gdpr_banner=1&background_color=060608&text_color=f5f0e8&primary_color=d4a017'

function envUrl(key: 'VITE_CALENDLY_BOOKING_URL' | 'VITE_CALENDLY_FREE_URL', fallback: string): string {
  const v = import.meta.env[key]
  if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  return fallback
}

/** Calendario prenotazioni — embed anche in homepage */
export const CALENDLY_BOOKING_URL = envUrl('VITE_CALENDLY_BOOKING_URL', DEFAULT_BOOKING)

/** Consulto omaggio (7 min) — evento dedicato su Calendly */
export const CALENDLY_FREE_URL = envUrl('VITE_CALENDLY_FREE_URL', DEFAULT_FREE)

/**
 * URL pubblico Calendly (copialo da Calendly → Tipi di evento → Copia link).
 * Opzionale: sovrascrivi con VITE_CALENDLY_BOOKING_URL in .env o Railway (poi rebuild).
 */
const DEFAULT_BOOKING =
  'https://calendly.com/valeriadipace?hide_gdpr_banner=1&background_color=060608&text_color=f5f0e8&primary_color=d4a017'

function envBooking(fallback: string): string {
  const v = import.meta.env.VITE_CALENDLY_BOOKING_URL
  if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  return fallback
}

/** Un solo calendario di prenotazioni — embed in homepage e Dashboard */
export const CALENDLY_BOOKING_URL = envBooking(DEFAULT_BOOKING)

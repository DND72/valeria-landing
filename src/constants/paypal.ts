/**
 * Pulsanti PayPal (Hosted buttons) — ID da PayPal → Strumenti per le vendite → Pulsanti PayPal.
 *
 * Quantità / opzioni / prezzo del pulsante: sempre nel pannello PayPal quando modifichi quel pulsante
 * (non nel codice qui: qui c’è solo l’ID per aprire il checkout).
 *
 * Calendly: “quanti appuntamenti per fascia” / slot non è PayPal — è in Calendly → Tipi di evento →
 * evento → Impostazioni disponibilità / Inviti per slot / durata evento.
 */

export type PayPalConsulto = {
  id: string
  name: string
  duration: string
  price: string
  icon: string
}

export const PAYPAL_CONSULTI: PayPalConsulto[] = [
  { id: 'MYR75N4X68N7E', name: 'Consulto breve', duration: '30 min · Telefonico', price: '30€', icon: '🌙' },
  { id: 'SVPB6FGR6L6G2', name: 'Consulto online', duration: '30 min · Videochiamata', price: '40€', icon: '🌐' },
  { id: 'RRN5H6RBWLUYL', name: 'Consulto completo', duration: '60 min · Telefonico', price: '50€', icon: '✨' },
]

/** Checkout PayPal in nuova scheda — niente SDK / widget nel sito. */
export function paypalHostedCheckoutUrl(hostedButtonId: string): string {
  const q = new URLSearchParams({
    cmd: '_s-xclick',
    hosted_button_id: hostedButtonId,
  })
  return `https://www.paypal.com/cgi-bin/webscr?${q.toString()}`
}

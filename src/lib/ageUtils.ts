/**
 * Verifica l'eta' in tempo reale dalla data di nascita dichiarata.
 * Usata nel componente AgeGate (frontend-only, nessuna chiamata API).
 */

export const MINIMUM_AGE = 18

/**
 * Calcola l'eta' in anni compiuti rispetto ad oggi.
 * @returns null se la data non e' valida
 */
export function computeAgeFromBirthday(birthday: string): number | null {
  const bd = new Date(birthday)
  if (isNaN(bd.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - bd.getFullYear()
  const m = today.getMonth() - bd.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--
  return age
}

/**
 * Restituisce true se la data di nascita dichiara un'eta' >= 18 anni.
 */
export function isAdult(birthday: string): boolean {
  const age = computeAgeFromBirthday(birthday)
  return age !== null && age >= MINIMUM_AGE
}

/**
 * Restituisce true se la stringa e' una data valida nel passato.
 */
export function isValidPastDate(value: string): boolean {
  if (!value) return false
  const d = new Date(value)
  return !isNaN(d.getTime()) && d < new Date()
}

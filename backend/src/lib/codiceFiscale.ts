/**
 * Libreria per la decodifica e validazione del Codice Fiscale italiano.
 *
 * Algoritmo ufficiale (art. 1 D.M. 23/12/1976):
 *   - Pos 0-5:  cognome (3) + nome (3) — lettere
 *   - Pos 6-7:  anno di nascita (2 cifre)
 *   - Pos 8:    mese di nascita (lettera: A-T secondo tabella)
 *   - Pos 9-10: giorno di nascita + sesso (01-31 M, 41-71 F)
 *   - Pos 11-15: codice comune + carattere di controllo
 */

// Tabella mesi CF → numero mese (1-12)
const CF_MONTH_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, H: 6,
  L: 7, M: 8, P: 9, R: 10, S: 11, T: 12,
}

export type CfDecodeResult =
  | { ok: true; birthDate: Date; isMale: boolean; year: number; month: number; day: number }
  | { ok: false; error: string }

/**
 * Decodifica la data di nascita (e il sesso) da un Codice Fiscale italiano.
 *
 * Gestisce correttamente l'ambiguità dell'anno a 2 cifre:
 *   - Se YY <= anno corrente a 2 cifre → 2000+YY
 *   - Altrimenti → 1900+YY
 * (Un CF non può mai appartenere a un futuro non ancora nato.)
 */
export function decodeBirthDateFromCF(cf: string): CfDecodeResult {
  const normalized = (cf ?? '').trim().toUpperCase().replace(/\s/g, '')

  if (normalized.length !== 16) {
    return { ok: false, error: `Lunghezza CF non valida: ${normalized.length} (attesi 16 caratteri)` }
  }

  // Anno (pos 6-7)
  const yearStr = normalized.slice(6, 8)
  const yearShort = parseInt(yearStr, 10)
  if (isNaN(yearShort)) {
    return { ok: false, error: 'Anno non valido nel Codice Fiscale' }
  }

  // Disambiguazione: anni futuri → 1900, anni ≤ corrente → 2000
  const currentYearShort = new Date().getFullYear() % 100
  const fullYear = yearShort <= currentYearShort ? 2000 + yearShort : 1900 + yearShort

  // Mese (pos 8)
  const monthChar = normalized[8]
  const month = CF_MONTH_MAP[monthChar ?? '']
  if (!month) {
    return { ok: false, error: `Carattere mese non valido nel CF: '${monthChar}'` }
  }

  // Giorno + sesso (pos 9-10)
  const dayStr = normalized.slice(9, 11)
  const rawDay = parseInt(dayStr, 10)
  if (isNaN(rawDay)) {
    return { ok: false, error: 'Giorno non valido nel Codice Fiscale' }
  }

  // Le donne hanno il giorno aumentato di 40
  const isMale = rawDay <= 31
  const day = isMale ? rawDay : rawDay - 40

  if (day < 1 || day > 31) {
    return { ok: false, error: `Giorno fuori range nel CF: ${rawDay}` }
  }

  const birthDate = new Date(Date.UTC(fullYear, month - 1, day))

  // Sanity check: la data deve essere reale
  if (
    birthDate.getUTCFullYear() !== fullYear ||
    birthDate.getUTCMonth() + 1 !== month ||
    birthDate.getUTCDate() !== day
  ) {
    return { ok: false, error: 'Data di nascita non valida nel Codice Fiscale' }
  }

  return { ok: true, birthDate, isMale, year: fullYear, month, day }
}

/**
 * Calcola l'età in anni compiuti rispetto ad oggi (o a una data di riferimento).
 */
export function computeAge(birthDate: Date, referenceDate = new Date()): number {
  let age = referenceDate.getFullYear() - birthDate.getUTCFullYear()
  const m = referenceDate.getMonth() + 1 - birthDate.getUTCMonth() - 1 // offset mesi
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getUTCDate())) {
    age--
  }
  return age
}

export const MINIMUM_AGE = 18

export type AgeVerificationResult =
  | {
      verified: true
      age: number
      birthDate: Date
      birthDateISO: string
    }
  | {
      verified: false
      age: number | null
      birthDate: Date | null
      birthDateISO: string | null
      reason: 'minor' | 'cf_invalid' | 'cf_too_old'
      error?: string
    }

/**
 * Verifica che il Codice Fiscale appartenga a un maggiorenne.
 *
 * - `cf_invalid`: il CF non è sintatticamente decodificabile
 * - `minor`: l'età decodificata è < 18
 * - `cf_too_old`: l'anno risultante > 150 anni fa (anomalia)
 */
export function verifyAgeFromCF(cf: string): AgeVerificationResult {
  const decoded = decodeBirthDateFromCF(cf)

  if (!decoded.ok) {
    return {
      verified: false,
      age: null,
      birthDate: null,
      birthDateISO: null,
      reason: 'cf_invalid',
      error: decoded.error,
    }
  }

  const age = computeAge(decoded.birthDate)

  // Anomalia: nessuno ha 150+ anni
  if (age > 150) {
    return {
      verified: false,
      age,
      birthDate: decoded.birthDate,
      birthDateISO: decoded.birthDate.toISOString().slice(0, 10),
      reason: 'cf_too_old',
      error: `Età estratta dal CF anomala: ${age} anni`,
    }
  }

  if (age < MINIMUM_AGE) {
    return {
      verified: false,
      age,
      birthDate: decoded.birthDate,
      birthDateISO: decoded.birthDate.toISOString().slice(0, 10),
      reason: 'minor',
    }
  }

  return {
    verified: true,
    age,
    birthDate: decoded.birthDate,
    birthDateISO: decoded.birthDate.toISOString().slice(0, 10),
  }
}

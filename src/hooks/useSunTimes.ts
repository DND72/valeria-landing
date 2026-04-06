/**
 * useSunTimes — calcola alba e tramonto astronomici per la posizione dell'utente.
 *
 * Strategia:
 *  1. Richiede la posizione via navigator.geolocation (timeout 6s)
 *  2. Se l'utente rifiuta o il browser non la supporta → fallback su Roma (41.9028°N, 12.4964°E)
 *  3. Calcola alba/tramonto con l'algoritmo NOAA (Jean Meeus, Astronomical Algorithms)
 *  4. I risultati vengono espressi nell'ora locale del browser (DST incluso automaticamente)
 */

import { useState, useEffect } from 'react'

// ── Fallback: Roma, Italia ────────────────────────────────────────────────────
const ROME_LAT = 41.9028
const ROME_LON = 12.4964

const RAD = Math.PI / 180
const DEG = 180 / Math.PI

// ── Algoritmo solare NOAA ─────────────────────────────────────────────────────

/** Julian Day Number per una data UTC */
function julianDay(date: Date): number {
  const Y = date.getUTCFullYear()
  const M = date.getUTCMonth() + 1
  const D = date.getUTCDate()
  const A = Math.floor(Y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5
}

interface SolarParams {
  eqTimeMin: number   // Equation of Time in minutes
  decDeg: number      // Solar declination in degrees
}

/** Calcola l'Equation of Time e la declinazione solare per un dato Julian Day */
function solarParams(jd: number): SolarParams {
  const T = (jd - 2451545.0) / 36525.0

  // Geometric mean longitude of the Sun (deg)
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360

  // Geometric mean anomaly of the Sun (deg)
  const M = (357.52911 + T * (35999.05029 - T * 0.0001537)) % 360

  // Orbit eccentricity
  const e = 0.016708634 - T * (0.000042037 + T * 0.0000001267)

  // Equation of Center
  const C =
    Math.sin(M * RAD) * (1.914602 - T * (0.004817 + T * 0.000014)) +
    Math.sin(2 * M * RAD) * (0.019993 - T * 0.000101) +
    Math.sin(3 * M * RAD) * 0.000289

  const sunLon = L0 + C                        // Sun's true longitude
  const omega  = 125.04 - 1934.136 * T         // Longitude of ascending node of moon
  const lambda = sunLon - 0.00569 - 0.00478 * Math.sin(omega * RAD) // apparent longitude

  // Mean obliquity of ecliptic (deg)
  const eps0 =
    23 + (26 + (21.448 - T * (46.8150 + T * (0.00059 - T * 0.001813))) / 60) / 60
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD) // corrected obliquity

  // Solar declination
  const decDeg = DEG * Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD))

  // Equation of time (minutes)
  const y = Math.tan((eps * RAD) / 2) ** 2
  const eqTimeMin =
    (4 *
      (y * Math.sin(2 * L0 * RAD) -
        2 * e * Math.sin(M * RAD) +
        4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) -
        0.5 * y * y * Math.sin(4 * L0 * RAD) -
        1.25 * e * e * Math.sin(2 * M * RAD))) *
    DEG  // converts radians-result to minutes (multiply by 4)

  return { eqTimeMin, decDeg }
}

/**
 * Restituisce un Date UTC per l'alba (rise=true) o il tramonto (rise=false),
 * oppure null se il Sole non sorge/tramonta quel giorno (poli).
 */
function calcSunEvent(lat: number, lon: number, date: Date, rise: boolean): Date | null {
  const jd = julianDay(date)
  const { eqTimeMin, decDeg } = solarParams(jd)

  // Hour angle at sunrise/sunset (zenith = 90.833° includes refraction + solar radius)
  const cosHA =
    Math.cos(90.833 * RAD) / (Math.cos(lat * RAD) * Math.cos(decDeg * RAD)) -
    Math.tan(lat * RAD) * Math.tan(decDeg * RAD)

  if (cosHA < -1 || cosHA > 1) return null // midnight sun or polar night

  const haDeg = DEG * Math.acos(cosHA)

  // UTC minutes from midnight
  const utcMin = rise
    ? 720 - 4 * (lon + haDeg) - eqTimeMin
    : 720 - 4 * (lon - haDeg) - eqTimeMin

  const result = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0
  ))
  result.setUTCMinutes(result.getUTCMinutes() + Math.round(utcMin))
  return result
}

/** Formatta un Date UTC come HH:MM nell'ora locale del browser */
function fmtLocal(d: Date): string {
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

// ── Hook pubblico ─────────────────────────────────────────────────────────────

export interface SunTimes {
  sunrise: string       // es. "06:12"
  sunset: string        // es. "20:05"
  lat: number
  lon: number
  usingGeolocation: boolean  // true = posizione reale, false = fallback Roma
}

export function useSunTimes(): SunTimes | null {
  const [times, setTimes] = useState<SunTimes | null>(null)

  useEffect(() => {
    const compute = (lat: number, lon: number, geo: boolean) => {
      const today = new Date()
      const rise = calcSunEvent(lat, lon, today, true)
      const set  = calcSunEvent(lat, lon, today, false)
      if (!rise || !set) return
      setTimes({
        sunrise: fmtLocal(rise),
        sunset:  fmtLocal(set),
        lat,
        lon,
        usingGeolocation: geo,
      })
    }

    if (!navigator.geolocation) {
      compute(ROME_LAT, ROME_LON, false)
      return
    }

    // Timeout dopo 6 secondi → fallback Roma
    const timer = setTimeout(() => compute(ROME_LAT, ROME_LON, false), 6000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        compute(pos.coords.latitude, pos.coords.longitude, true)
      },
      () => {
        clearTimeout(timer)
        compute(ROME_LAT, ROME_LON, false)
      },
      { timeout: 6000, maximumAge: 60 * 60 * 1000 } // cache posizione 1 ora
    )

    return () => clearTimeout(timer)
  }, [])

  return times
}

import { useState, useEffect } from 'react'

export type CircadianPeriod = 'dawn' | 'noon' | 'dusk' | 'night'

export interface CircadianTheme {
  period: CircadianPeriod
  label: string
  emoji: string
  /** Fixed background layer (#hex or rgba) */
  bgBase: string
  /** Radial gradient overlay on the fixed BG */
  bgGradient: string
  /** Radial gradient for the "aurora" glow at top */
  topGlow: string
  /** Secondary ambient blob color (bottom) */
  bottomGlowColor: string
  /** Panel card gradient */
  cardGradient: string
  /** Card border color (rgba) */
  cardBorder: string
  /** Intensity multiplier for planet glow: 0.0–1.0 */
  glowIntensity: number
  /** 'glow' for night (blur filter) or 'shadow' for day (drop-shadow) */
  planetLighting: 'glow' | 'shadow'
  /** Aspect line color and opacity */
  aspectLineColor: string
  aspectLineOpacity: number
  /** Central disk color in ZodiacWheel */
  zodiacDiskColor: string
  /** Optional linear gradient for background (Tramonto) */
  bgLinear?: string
  /** Header accent tag color */
  headerAccent: string
  /** Clock widget bg */
  clockBg: string
}

const THEMES: Record<CircadianPeriod, CircadianTheme> = {
  // 🌅 06:00–11:59 — ALBA: Viola Indaco (esterno) → Rosa Cipria/Pesca (centro)
  dawn: {
    period: 'dawn',
    label: 'Alba',
    emoji: '🌅',
    bgBase: '#120826',
    bgGradient: [
      'radial-gradient(circle at 50% 40%,',
      '  rgba(255, 218, 185, 0.65) 0%,',   // Peach/Pesca
      '  rgba(255, 182, 193, 0.45) 30%,',  // Light Pink
      '  rgba(75, 0, 130, 0.25) 70%,',     // Indigo
      '  rgba(18, 8, 38, 0.0) 100%)',
    ].join(''),
    topGlow: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255, 200, 150, 0.25) 0%, transparent 80%)',
    bottomGlowColor: 'rgba(255, 150, 180, 0.15)',
    cardGradient: 'linear-gradient(135deg, rgba(75, 0, 130, 0.15) 0%, rgba(255, 182, 193, 0.10) 100%)',
    cardBorder: 'rgba(255, 182, 193, 0.25)',
    glowIntensity: 0.4,
    planetLighting: 'shadow', // Ombre scure per contrasto matutino
    aspectLineColor: '#FFFFFF',
    aspectLineOpacity: 0.4,
    zodiacDiskColor: '#1A0B2E',
    headerAccent: '#FFB6C1',
    clockBg: 'rgba(75, 0, 130, 0.25)',
  },

  // ☀️ 12:00–17:59 — MEZZOGIORNO: Blu Oltremare profondo e vibrante
  noon: {
    period: 'noon',
    label: 'Mezzogiorno',
    emoji: '☀️',
    bgBase: '#001440', // Deep Ultramarine base
    bgGradient: [
      'radial-gradient(circle at 50% -20%,',
      '  rgba(0, 102, 255, 0.75) 0%,',    // Radiant Blue
      '  rgba(0, 60, 180, 0.50) 40%,',    // Deep Blue
      '  rgba(0, 20, 64, 0.0) 90%)',
    ].join(''),
    topGlow: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(255, 255, 255, 0.15) 0%, transparent 80%)',
    bottomGlowColor: 'rgba(0, 100, 255, 0.12)',
    cardGradient: 'linear-gradient(135deg, rgba(0, 40, 120, 0.25) 0%, rgba(0, 100, 255, 0.12) 100%)',
    cardBorder: 'rgba(0, 150, 255, 0.35)',
    glowIntensity: 0.3,
    planetLighting: 'shadow',
    aspectLineColor: '#E0E0E0', // Argento/Bianco ad alta opacità
    aspectLineOpacity: 0.7,
    zodiacDiskColor: '#00081A',
    headerAccent: '#00A2FF',
    clockBg: 'rgba(0, 40, 120, 0.40)',
  },

  // 🌇 18:00–20:59 — TRAMONTO: Arancio Rame (orizzonte) → Viola Prugna/Nero (zenit)
  dusk: {
    period: 'dusk',
    label: 'Tramonto',
    emoji: '🌇',
    bgBase: '#0A0510',
    bgLinear: 'linear-gradient(135deg, #D2691E 0%, #800080 45%, #0A0510 100%)', // Copper -> Plum -> Black angled
    bgGradient: 'radial-gradient(circle at 50% 120%, rgba(210, 105, 30, 0.6) 0%, transparent 60%)',
    topGlow: 'none',
    bottomGlowColor: 'rgba(210, 105, 30, 0.3)',
    cardGradient: 'linear-gradient(135deg, rgba(128, 0, 128, 0.2) 0%, rgba(210, 105, 30, 0.12) 100%)',
    cardBorder: 'rgba(210, 105, 30, 0.4)',
    glowIntensity: 0.85,
    planetLighting: 'glow', // Massima emissione aurea
    aspectLineColor: '#FFD700', // Oro per fondersi col rame
    aspectLineOpacity: 0.4,
    zodiacDiskColor: '#100618',
    headerAccent: '#FF8C00',
    clockBg: 'rgba(128, 0, 128, 0.35)',
  },

  // 🌌 21:00–05:59 — NOTTE: Nero cosmico con tocchi di Nebulosa Blu Cobalto
  night: {
    period: 'night',
    label: 'Notte',
    emoji: '🌌',
    bgBase: '#020108',
    bgGradient: [
      'radial-gradient(circle at 30% 20%, rgba(0, 71, 171, 0.12) 0%, transparent 50%),', // Nebula spot 1
      'radial-gradient(circle at 70% 80%, rgba(65, 105, 225, 0.08) 0%, transparent 40%),', // Nebula spot 2
      'radial-gradient(circle at 50% -10%, rgba(120, 80, 240, 0.15) 0%, transparent 60%)',
    ].join(''),
    topGlow: 'radial-gradient(ellipse 50% 30% at 50% 0%, rgba(80, 40, 180, 0.10) 0%, transparent 70%)',
    bottomGlowColor: 'rgba(40, 20, 100, 0.12)',
    cardGradient: 'linear-gradient(135deg, rgba(80, 40, 160, 0.10) 0%, transparent 100%)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    glowIntensity: 1.0,
    planetLighting: 'glow',
    aspectLineColor: '#FFFFFF', // Seta luminosa
    aspectLineOpacity: 0.2, // Quasi trasparente
    zodiacDiskColor: '#080512',
    headerAccent: '#D4A017',
    clockBg: 'rgba(0, 0, 0, 0.65)',
  },
}

function getPeriod(hour: number): CircadianPeriod {
  if (hour >= 6  && hour < 12) return 'dawn'
  if (hour >= 12 && hour < 18) return 'noon'
  if (hour >= 18 && hour < 21) return 'dusk'
  return 'night'
}

export function useCircadianTheme(): CircadianTheme {
  const [theme, setTheme] = useState<CircadianTheme>(() => THEMES[getPeriod(new Date().getHours())])

  useEffect(() => {
    // Check every 60 seconds if the period has changed
    const id = setInterval(() => {
      const next = THEMES[getPeriod(new Date().getHours())]
      setTheme(prev => (prev.period !== next.period ? next : prev))
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  return theme
}

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
  /** Header accent tag color */
  headerAccent: string
  /** Clock widget bg */
  clockBg: string
}

const THEMES: Record<CircadianPeriod, CircadianTheme> = {
  // 🌅 06:00–11:59 — Alba/Mattina: indaco profondo → rose cipria → oro pallido
  dawn: {
    period: 'dawn',
    label: 'Alba',
    emoji: '🌅',
    bgBase: '#1A0B2E',  // lavanda scuro — nettamente più caldo del nero notturno
    bgGradient: [
      'radial-gradient(ellipse 120% 70% at 50% -15%,',
      '  rgba(220, 100, 100, 0.65) 0%,',
      '  rgba(180, 80, 140, 0.50) 25%,',
      '  rgba(100, 40, 120, 0.30) 55%,',
      '  rgba(26, 11, 46, 0.0) 85%)',
    ].join(''),
    topGlow: [
      'radial-gradient(ellipse 80% 50% at 50% -5%,',
      '  rgba(255, 180, 100, 0.30) 0%,',
      '  rgba(255, 130, 80, 0.15) 40%,',
      '  transparent 75%)',
    ].join(''),
    bottomGlowColor: 'rgba(200, 100, 120, 0.18)',
    cardGradient: 'linear-gradient(135deg, rgba(180, 80, 120, 0.18) 0%, rgba(255, 140, 80, 0.08) 100%)',
    cardBorder: 'rgba(230, 140, 110, 0.28)',
    glowIntensity: 0.50,
    headerAccent: '#F0A070',
    clockBg: 'rgba(180, 70, 100, 0.22)',
  },

  // ☀️ 12:00–17:59 — Pomeriggio: blu oltremare/zaffiro con bagliori dorati
  noon: {
    period: 'noon',
    label: 'Pomeriggio',
    emoji: '☀️',
    bgBase: '#020B20',  // blu notte profondo — chiaramente più blu del viola notturno
    bgGradient: [
      'radial-gradient(ellipse 110% 75% at 50% -10%,',
      '  rgba(30, 80, 220, 0.70) 0%,',
      '  rgba(20, 60, 180, 0.50) 30%,',
      '  rgba(10, 30, 100, 0.25) 60%,',
      '  rgba(2, 11, 32, 0.0) 85%)',
    ].join(''),
    topGlow: [
      'radial-gradient(ellipse 75% 45% at 50% -5%,',
      '  rgba(100, 180, 255, 0.25) 0%,',
      '  rgba(60, 140, 240, 0.12) 50%,',
      '  transparent 80%)',
    ].join(''),
    bottomGlowColor: 'rgba(20, 60, 180, 0.18)',
    cardGradient: 'linear-gradient(135deg, rgba(20, 70, 200, 0.20) 0%, rgba(80, 160, 255, 0.08) 100%)',
    cardBorder: 'rgba(80, 150, 255, 0.30)',
    glowIntensity: 0.35,
    headerAccent: '#70B0FF',
    clockBg: 'rgba(20, 60, 190, 0.28)',
  },

  // 🌇 18:00–20:59 — Tramonto: viola magenta con rame/arancio bruciato
  dusk: {
    period: 'dusk',
    label: 'Tramonto',
    emoji: '🌇',
    bgBase: '#0E0318',
    bgGradient: [
      'radial-gradient(ellipse 110% 70% at 50% -5%,',
      '  rgba(160, 30, 140, 0.70) 0%,',
      '  rgba(100, 20, 120, 0.45) 40%,',
      '  rgba(14, 3, 24, 0.0) 80%)',
    ].join(''),
    topGlow: [
      'radial-gradient(ellipse 70% 45% at 50% 0%,',
      '  rgba(220, 90, 60, 0.25) 0%,',
      '  rgba(180, 60, 80, 0.12) 50%,',
      '  transparent 80%)',
    ].join(''),
    bottomGlowColor: 'rgba(120, 20, 90, 0.18)',
    cardGradient: 'linear-gradient(135deg, rgba(120, 20, 100, 0.20) 0%, rgba(200, 80, 60, 0.08) 100%)',
    cardBorder: 'rgba(190, 80, 150, 0.30)',
    glowIntensity: 0.80,
    headerAccent: '#D070A0',
    clockBg: 'rgba(110, 20, 80, 0.28)',
  },

  // 🌌 21:00–05:59 — Notte: nero cosmico (tema originale)
  night: {
    period: 'night',
    label: 'Notte',
    emoji: '🌌',
    bgBase: '#060410',
    bgGradient: 'radial-gradient(circle at 50% -10%, rgba(120,80,240,0.15) 0%, transparent 60%)',
    topGlow: 'radial-gradient(ellipse 50% 30% at 50% 0%, rgba(80,40,180,0.10) 0%, transparent 70%)',
    bottomGlowColor: 'rgba(40,20,100,0.12)',
    cardGradient: 'linear-gradient(135deg, rgba(80,40,160,0.10) 0%, transparent 100%)',
    cardBorder: 'rgba(255,255,255,0.08)',
    glowIntensity: 1.0,
    headerAccent: '#D4A017',
    clockBg: 'rgba(0,0,0,0.50)',
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

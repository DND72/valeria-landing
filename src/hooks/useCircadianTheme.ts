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
  dawn: {
    period: 'dawn',
    label: 'Alba',
    emoji: '🌅',
    bgBase: '#0D0820',
    bgGradient: 'radial-gradient(ellipse 90% 70% at 50% -5%, rgba(140,60,120,0.55) 0%, rgba(200,100,80,0.25) 40%, rgba(13,8,32,0.0) 80%)',
    topGlow: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,160,100,0.18) 0%, transparent 70%)',
    bottomGlowColor: 'rgba(180,80,120,0.12)',
    cardGradient: 'linear-gradient(135deg, rgba(150,60,100,0.12) 0%, rgba(255,140,80,0.06) 100%)',
    cardBorder: 'rgba(220,130,100,0.18)',
    glowIntensity: 0.45,
    headerAccent: '#E8967A',
    clockBg: 'rgba(180,80,100,0.15)',
  },
  noon: {
    period: 'noon',
    label: 'Pomeriggio',
    emoji: '☀️',
    bgBase: '#030A1A',
    bgGradient: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(20,60,180,0.55) 0%, rgba(10,40,120,0.30) 50%, rgba(3,10,26,0.0) 85%)',
    topGlow: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(80,160,255,0.15) 0%, transparent 70%)',
    bottomGlowColor: 'rgba(20,60,160,0.12)',
    cardGradient: 'linear-gradient(135deg, rgba(20,60,160,0.14) 0%, rgba(80,160,255,0.06) 100%)',
    cardBorder: 'rgba(80,140,255,0.20)',
    glowIntensity: 0.30,
    headerAccent: '#60A0FF',
    clockBg: 'rgba(20,60,160,0.20)',
  },
  dusk: {
    period: 'dusk',
    label: 'Tramonto',
    emoji: '🌇',
    bgBase: '#08030F',
    bgGradient: 'radial-gradient(ellipse 85% 65% at 50% 0%, rgba(120,20,100,0.60) 0%, rgba(80,30,140,0.35) 45%, rgba(8,3,15,0.0) 85%)',
    topGlow: 'radial-gradient(ellipse 65% 40% at 50% 0%, rgba(200,80,60,0.18) 0%, transparent 70%)',
    bottomGlowColor: 'rgba(100,20,80,0.14)',
    cardGradient: 'linear-gradient(135deg, rgba(100,20,80,0.15) 0%, rgba(200,80,60,0.07) 100%)',
    cardBorder: 'rgba(180,80,140,0.22)',
    glowIntensity: 0.80,
    headerAccent: '#C06090',
    clockBg: 'rgba(100,20,80,0.20)',
  },
  night: {
    period: 'night',
    label: 'Notte',
    emoji: '🌌',
    bgBase: '#060410',
    bgGradient: 'radial-gradient(circle at 50% -10%, rgba(120,80,240,0.12) 0%, transparent 60%)',
    topGlow: 'radial-gradient(ellipse 50% 30% at 50% 0%, rgba(80,40,180,0.10) 0%, transparent 70%)',
    bottomGlowColor: 'rgba(40,20,100,0.10)',
    cardGradient: 'linear-gradient(135deg, rgba(80,40,160,0.08) 0%, transparent 100%)',
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

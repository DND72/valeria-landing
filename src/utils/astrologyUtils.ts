export interface PlanetData {
  nome: string
  segno: string
  gradi: number
  lon_assoluta: number
  categoria: string
}

export const ASPECTS_DEF = [
  { deg: 0,   orb: 8, symbol: '☌', color: '#FFFFFF', label: 'Congiunzione' },
  { deg: 60,  orb: 5, symbol: '⚹', color: '#4ADE80', label: 'Sestile'      },
  { deg: 90,  orb: 7, symbol: '□', color: '#F87171', label: 'Quadrato'     },
  { deg: 120, orb: 8, symbol: '△', color: '#3B82F6', label: 'Trigono'      },
  { deg: 180, orb: 8, symbol: '☍', color: '#A855F7', label: 'Opposizione'  },
]

export interface AspectResult {
  p1: string
  p2: string
  type: string
  symbol: string
  color: string
  precision: number // 1 = exact, 0 = at orb limit
  diff: number
}

export function calculateAspects(planets: PlanetData[]): AspectResult[] {
  if (!planets || planets.length < 2) return []
  const results: AspectResult[] = []

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i]
      const p2 = planets[j]
      
      let diff = Math.abs(p1.lon_assoluta - p2.lon_assoluta)
      if (diff > 180) diff = 360 - diff
      
      const asp = ASPECTS_DEF.find(a => Math.abs(diff - a.deg) <= a.orb)
      if (asp) {
        const dist = Math.abs(diff - asp.deg)
        results.push({
          p1: p1.nome,
          p2: p2.nome,
          type: asp.label,
          symbol: asp.symbol,
          color: asp.color,
          diff: dist,
          precision: 1 - (dist / asp.orb)
        })
      }
    }
  }
  return results
}

export const BODY_GLYPHS: Record<string, string> = {
  'Sole': '☉', 'Luna': '☽', 'Mercurio': '☿', 'Venere': '♀', 'Marte': '♂',
  'Giove': '♃', 'Saturno': '♄', 'Urano': '♅', 'Nettuno': '♆', 'Plutone': '♇',
  'Chirone': '⚷', 'Cerere': '⚳', 'Pallade': '⚴', 'Giunone': '⚵', 'Vesta': '⚶',
  'Nodo Nord': '☊', 'Nodo Sud': '☋', 'Lilith': '⚸', 'Vertex': 'Vx', 'Parte della Fortuna': '⊗'
}

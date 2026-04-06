import { useState, useMemo } from 'react'

// ─────────────────────────────────────────────
// Dati Zodiacali e Planetari
// ─────────────────────────────────────────────
const ZODIAC = [
  { name: 'Ariete',      symbol: '♈', color: '#e05c5c', el: 'Fuoco' },
  { name: 'Toro',        symbol: '♉', color: '#7ec89e', el: 'Terra' },
  { name: 'Gemelli',     symbol: '♊', color: '#f5d77a', el: 'Aria'  },
  { name: 'Cancro',      symbol: '♋', color: '#88b8e0', el: 'Acqua' },
  { name: 'Leone',       symbol: '♌', color: '#f5a623', el: 'Fuoco' },
  { name: 'Vergine',     symbol: '♍', color: '#aed68a', el: 'Terra' },
  { name: 'Bilancia',    symbol: '♎', color: '#d4a0e8', el: 'Aria'  },
  { name: 'Scorpione',   symbol: '♏', color: '#c0526c', el: 'Acqua' },
  { name: 'Sagittario',  symbol: '♐', color: '#f08050', el: 'Fuoco' },
  { name: 'Capricorno',  symbol: '♑', color: '#9aaaba', el: 'Terra' },
  { name: 'Acquario',    symbol: '♒', color: '#6ab0e0', el: 'Aria'  },
  { name: 'Pesci',       symbol: '♓', color: '#9a80d0', el: 'Acqua' },
]

const ELEMENT_BG: Record<string, string> = {
  'Fuoco': 'rgba(220,80,60,0.06)',
  'Terra': 'rgba(80,200,100,0.06)',
  'Aria':  'rgba(255,220,80,0.06)',
  'Acqua': 'rgba(80,160,220,0.06)',
}

const BODY_INFO: Record<string, { glyph: string; color: string; ring: string }> = {
  'Sole':                { glyph: '☉', color: '#FFD700', ring: 'veloce' },
  'Luna':                { glyph: '☽', color: '#C8E0FF', ring: 'veloce' },
  'Mercurio':            { glyph: '☿', color: '#CCCCCC', ring: 'veloce' },
  'Venere':              { glyph: '♀', color: '#FFB3C6', ring: 'veloce' },
  'Marte':               { glyph: '♂', color: '#FF6060', ring: 'veloce' },
  'Giove':               { glyph: '♃', color: '#FFA050', ring: 'lento'  },
  'Saturno':             { glyph: '♄', color: '#C8B89A', ring: 'lento'  },
  'Urano':               { glyph: '♅', color: '#70D0D0', ring: 'lento'  },
  'Nettuno':             { glyph: '♆', color: '#8080F0', ring: 'lento'  },
  'Plutone':             { glyph: '♇', color: '#B090C0', ring: 'lento'  },
  'Chirone':             { glyph: '⚷', color: '#D08060', ring: 'lento'  },
  'Cerere':              { glyph: '⚳', color: '#80C080', ring: 'asteroide' },
  'Pallade':             { glyph: '⚴', color: '#A090D0', ring: 'asteroide' },
  'Giunone':             { glyph: '⚵', color: '#E0A080', ring: 'asteroide' },
  'Vesta':               { glyph: '⚶', color: '#D0C060', ring: 'asteroide' },
  'Nodo Nord':           { glyph: '☊', color: '#FFD700', ring: 'punto'  },
  'Nodo Sud':            { glyph: '☋', color: '#C0A030', ring: 'punto'  },
  'Lilith':              { glyph: '⚸', color: '#C060A0', ring: 'punto'  },
  'Vertex':              { glyph: 'Vx', color: '#70D0C0', ring: 'punto' },
  'Parte della Fortuna': { glyph: '⊗', color: '#FFE080', ring: 'punto' },
}

// ─────────────────────────────────────────────
// Definizioni Aspetti
// ─────────────────────────────────────────────
const ASPECTS = [
  { deg: 0,   orb: 8, color: '#FFFFFF', label: 'Congiunzione', dash: '0' },
  { deg: 60,  orb: 5, color: '#4ADE80', label: 'Sestile',      dash: '4 4' },
  { deg: 90,  orb: 7, color: '#F87171', label: 'Quadrato',     dash: '0' },
  { deg: 120, orb: 8, color: '#3B82F6', label: 'Trigono',      dash: '0' },
  { deg: 180, orb: 8, color: '#A855F7', label: 'Opposizione',  dash: '0' },
]

// ─────────────────────────────────────────────
// Geometria (ViewBox 2000x2000)
// ─────────────────────────────────────────────
const CX = 1000; const CY = 1000

function toXY(r: number, lon: number) {
  const rad = ((180 - lon) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function arcPath(rOuter: number, rInner: number, lonStart: number, lonEnd: number) {
  const p1 = toXY(rOuter, lonStart); const p2 = toXY(rOuter, lonEnd)
  const p3 = toXY(rInner, lonEnd);   const p4 = toXY(rInner, lonStart)
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 0 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 0 1 ${p4.x} ${p4.y}`,
    'Z'
  ].join(' ')
}

// Raggi (Raddoppiati rispetto alla versione 1000x1000)
const R = {
  OUTER:       960,   
  SIGN_OUT:    950,   
  SIGN_IN:     820,   
  CONST_IN:    700,   
  FAST:        620,   
  SLOW:        490,   
  AST:         370,   
  POINT:       260,   
  INNER:       160,   
}

const RING_R: Record<string, number> = {
  veloce:    R.FAST,
  lento:     R.SLOW,
  asteroide: R.AST,
  punto:     R.POINT,
}

// ─────────────────────────────────────────────
// Interfacce
// ─────────────────────────────────────────────
export interface PlanetData {
  nome: string
  segno: string
  gradi: number
  lon_assoluta: number
  categoria: string
}

interface ZodiacWheelProps {
  planets: PlanetData[]
  ascLon?: number
  ascSign?: string
  ascDeg?: number
  className?: string
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────
export default function ZodiacWheel({ planets, ascLon, ascSign, ascDeg, className = '' }: ZodiacWheelProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  // Calcolo Aspetti
  const aspectLines = useMemo(() => {
    if (!planets || planets.length < 2) return []
    const lines: any[] = []
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const p1 = planets[i]
        const p2 = planets[j]
        
        let diff = Math.abs(p1.lon_assoluta - p2.lon_assoluta)
        if (diff > 180) diff = 360 - diff
        
        // Trova se c'è un aspetto
        const asp = ASPECTS.find(a => Math.abs(diff - a.deg) <= a.orb)
        if (asp && asp.deg !== 0) { // Saltiamo congiunzioni (0°) perché sono icone vicine
          const precision = 1 - (Math.abs(diff - asp.deg) / asp.orb)
          const r1 = RING_R[p1.categoria] ?? R.FAST
          const r2 = RING_R[p2.categoria] ?? R.FAST
          lines.push({
            p1Name: p1.nome,
            p2Name: p2.nome,
            pos1: toXY(r1 - 15, p1.lon_assoluta),
            pos2: toXY(r2 - 15, p2.lon_assoluta),
            color: asp.color,
            dash: asp.dash,
            opacity: 0.15 + (precision * 0.45)
          })
        }
      }
    }
    return lines
  }, [planets])

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ aspectRatio: '1/1' }}>
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(120,80,240,0.15) 0%, rgba(40,20,120,0.05) 65%, transparent 85%)' }} />

      <svg viewBox="0 0 2000 2000" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="zw-disk-big" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0d091e" />
            <stop offset="85%"  stopColor="#04030a" />
          </radialGradient>
          <filter id="glow-big" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx={CX} cy={CY} r={R.OUTER} fill="url(#zw-disk-big)" />

        {/* Stelle Background */}
        {Array.from({ length: 200 }, (_, i) => {
          const a = (i * 137.5) % 360; const d = 100 + (i % 8) * 110;
          const { x, y } = toXY(Math.min(d, R.POINT - 20), a)
          return <circle key={i} cx={x} cy={y} r={1 + (i % 3)} fill="white" fillOpacity={0.1 + (i % 5) * 0.05} />
        })}

        {/* ── Linee Aspetti ── */}
        <g opacity="0.8">
          {aspectLines.map((line, idx) => (
            <line
              key={idx}
              x1={line.pos1.x} y1={line.pos1.y}
              x2={line.pos2.x} y2={line.pos2.y}
              stroke={line.color}
              strokeWidth="2.5"
              strokeDasharray={line.dash}
              strokeOpacity={line.opacity}
              className="transition-opacity duration-300"
            />
          ))}
        </g>

        {/* ── 12 Settori ── */}
        {ZODIAC.map((sign, i) => {
          const lon0 = i * 30; const lon1 = lon0 + 30; const mid = lon0 + 15
          const symPos = toXY((R.SIGN_OUT + R.SIGN_IN) / 2, mid)
          return (
            <g key={sign.name}>
              <path d={arcPath(R.SIGN_OUT, R.SIGN_IN, lon0, lon1)}
                fill={ELEMENT_BG[sign.el]} stroke="rgba(212,160,23,0.25)" strokeWidth="2" />
              <text x={symPos.x} y={symPos.y + 5} textAnchor="middle" dominantBaseline="central"
                fontSize="72" fill={sign.color} fillOpacity="0.85" className="select-none font-serif">
                {sign.symbol}
              </text>
            </g>
          )
        })}

        {/* Bordi Dorati */}
        <circle cx={CX} cy={CY} r={R.SIGN_OUT} fill="none" stroke="rgba(212,160,23,0.6)" strokeWidth="4" />
        <circle cx={CX} cy={CY} r={R.SIGN_IN}  fill="none" stroke="rgba(212,160,23,0.2)" strokeWidth="2" />

        {/* Orbite tratteggiate */}
        {[R.FAST, R.SLOW, R.AST, R.POINT].map((r, i) => (
          <circle key={i} cx={CX} cy={CY} r={r} fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="2" strokeDasharray="10 20" />
        ))}

        {/* ── Pianeti ── */}
        {planets.map(p => {
          const info = BODY_INFO[p.nome]; if (!info) return null
          const r_orb = RING_R[p.categoria] ?? R.FAST
          const pos = toXY(r_orb, p.lon_assoluta); const isHov = hovered === p.nome
          const dotR = p.categoria === 'veloce' ? 18 : p.categoria === 'lento' ? 14 : 10

          return (
            <g key={p.nome} onMouseEnter={() => setHovered(p.nome)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
              {isHov && <line x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke={info.color} strokeOpacity="0.25" strokeWidth="2" />}
              {isHov && <circle cx={pos.x} cy={pos.y} r={dotR * 2.5} fill={info.color} fillOpacity="0.12" filter="url(#glow-big)" />}
              <circle cx={pos.x} cy={pos.y} r={dotR} fill={info.color} fillOpacity={isHov ? 1 : 0.85} filter="url(#glow-big)" />
              <text x={pos.x + dotR + 8} y={pos.y - 4} fontSize={p.categoria === 'veloce' ? 44 : 36} fill={info.color} fillOpacity={isHov ? 1 : 0.8} className="select-none font-serif">
                {info.glyph}
              </text>

              {isHov && (() => {
                const label = `${p.nome} • ${p.segno} ${p.gradi.toFixed(1)}°`
                const tx = Math.max(200, Math.min(1800, pos.x))
                const ty = pos.y < CY ? pos.y - 60 : pos.y + 60
                return (
                  <g transform={`translate(${tx}, ${ty})`}>
                    <rect x="-140" y="-20" width="280" height="40" rx="10" fill="rgba(6,4,14,0.95)" stroke={info.color} strokeWidth="1.5" />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="24" fill="white" className="font-sans font-medium">{label}</text>
                  </g>
                )
              })()}
            </g>
          )
        })}

        {/* ── ASC ── */}
        {ascLon !== undefined && (() => {
          const p1 = toXY(R.SIGN_OUT + 24, ascLon); const pI = toXY(R.INNER, ascLon)
          return (
            <g>
              <line x1={pI.x} y1={pI.y} x2={p1.x} y2={p1.y} stroke="#D4A017" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
              <circle cx={p1.x} cy={p1.y} r="10" fill="#D4A017" filter="url(#glow-big)" />
              <text x={p1.x} y={p1.y - 25} textAnchor="middle" fontSize="32" fill="#D4A017" fontWeight="bold" className="font-serif">ASC</text>
            </g>
          )
        })()}

        {/* Hub Centrale */}
        <circle cx={CX} cy={CY} r={R.INNER} fill="rgba(8,5,18,0.98)" stroke="rgba(212,160,23,0.4)" strokeWidth="3" />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-1">{ascSign ? 'Ascendente' : 'Cielo'}</p>
          <p className="text-white font-serif font-bold text-2xl md:text-3xl">{ascSign || 'Attuale'}</p>
          {ascDeg !== undefined && <p className="text-gold-500/50 text-xs mt-1 font-mono">{ascDeg.toFixed(1)}°</p>}
        </div>
      </div>
    </div>
  )
}

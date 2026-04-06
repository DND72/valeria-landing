import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { calculateAspects, BODY_GLYPHS, type PlanetData, type AspectResult } from '../utils/astrologyUtils'
import { type CircadianTheme } from '../hooks/useCircadianTheme'

// ─────────────────────────────────────────────
// Dati Zodiacali
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

const BODY_INFO_STATIC: Record<string, { color: string; ring: string }> = {
  'Sole':                { color: '#FFD700', ring: 'veloce' },
  'Luna':                { color: '#C8E0FF', ring: 'veloce' },
  'Mercurio':            { color: '#CCCCCC', ring: 'veloce' },
  'Venere':              { color: '#FFB3C6', ring: 'veloce' },
  'Marte':               { color: '#FF6060', ring: 'veloce' },
  'Giove':               { color: '#FFA050', ring: 'lento'  },
  'Saturno':             { color: '#C8B89A', ring: 'lento'  },
  'Urano':               { color: '#70D0D0', ring: 'lento'  },
  'Nettuno':             { color: '#8080F0', ring: 'lento'  },
  'Plutone':             { color: '#B090C0', ring: 'lento'  },
  'Chirone':             { color: '#D08060', ring: 'lento'  },
  'Cerere':              { color: '#80C080', ring: 'asteroide' },
  'Pallade':             { color: '#A090D0', ring: 'asteroide' },
  'Giunone':             { color: '#E0A080', ring: 'asteroide' },
  'Vesta':               { color: '#D0C060', ring: 'asteroide' },
  'Nodo Nord':           { color: '#FFD700', ring: 'punto'  },
  'Nodo Sud':            { color: '#C0A030', ring: 'punto'  },
  'Lilith':              { color: '#C060A0', ring: 'punto'  },
  'Vertex':              { color: '#70D0C0', ring: 'punto' },
  'Parte della Fortuna': { color: '#FFE080', ring: 'punto' },
}

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

// Raggi
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

interface ZodiacWheelProps {
  planets: PlanetData[]
  ascLon?: number
  ascSign?: string
  ascDeg?: number
  className?: string
  theme: CircadianTheme
}

interface TypedAspectLine extends AspectResult {
  pos1: { x: number; y: number }
  pos2: { x: number; y: number }
  dash: string
}

export default function ZodiacWheel({ planets, ascLon, ascSign, ascDeg, className = '', theme }: ZodiacWheelProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  // Calcolo Aspetti usando l'utility condivisa
  const aspectLines = useMemo(() => {
    const rawAspects = calculateAspects(planets)
    return rawAspects
      .filter(a => a.type !== 'Congiunzione')
      .map(asp => {
        const p1 = planets.find((p: PlanetData) => p.nome === asp.p1)!
        const p2 = planets.find((p: PlanetData) => p.nome === asp.p2)!
        const r1 = RING_R[p1.categoria] ?? R.FAST
        const r2 = RING_R[p2.categoria] ?? R.FAST
        return {
          ...asp,
          pos1: toXY(r1 - 15, p1.lon_assoluta),
          pos2: toXY(r2 - 15, p2.lon_assoluta),
          dash: asp.type === 'Sestile' ? '10 20' : '0'
        } as TypedAspectLine
      })
  }, [planets])

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ aspectRatio: '1/1' }}>
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(120,80,240,0.15) 0%, rgba(40,20,120,0.05) 65%, transparent 85%)' }} />

      <svg viewBox="0 0 2000 2000" className="w-full h-full overflow-visible">
        <defs>
          <filter id="glow-big" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Disco di sfondo della ruota */}
        <circle 
          cx={CX} cy={CY} 
          r={R.OUTER} 
          fill={theme.zodiacDiskColor} 
          style={{ transition: 'fill 4s ease-in-out' }}
        />

        {/* ── Linee Aspetti ── */}
        <g style={{ transition: 'opacity 4s ease-in-out' }} opacity={theme.aspectLineOpacity}>
          {aspectLines.map((line: TypedAspectLine, idx: number) => (
            <line
              key={idx}
              x1={line.pos1.x} y1={line.pos1.y}
              x2={line.pos2.x} y2={line.pos2.y}
              stroke={theme.aspectLineColor === '#E0E0E0' || theme.aspectLineColor === '#FFFFFF' ? theme.aspectLineColor : line.color}
              strokeWidth="3"
              strokeDasharray={line.dash}
              strokeOpacity={0.25 + (line.precision * 0.55)}
              style={{ transition: 'stroke 4s ease-in-out' }}
            />
          ))}
        </g>

        {/* ── 12 Settori ── */}
        {ZODIAC.map((sign, i) => {
          const lon0 = i * 30; const lon1 = lon0 + 30; const mid = lon0 + 15
          const symPos = toXY((R.SIGN_OUT + R.SIGN_IN) / 2, mid)
          return (
            <g key={sign.name} className="cursor-help group">
              <title>{`${sign.name} (${sign.el})`}</title>
              <path 
                d={arcPath(R.SIGN_OUT, R.SIGN_IN, lon0, lon1)}
                fill={ELEMENT_BG[sign.el]} 
                stroke="rgba(212,160,23,0.25)" 
                strokeWidth="2" 
                className="transition-opacity group-hover:fill-opacity-20"
              />
              <text 
                x={symPos.x} y={symPos.y + 5} 
                textAnchor="middle" dominantBaseline="central"
                fontSize="72" fill={sign.color} fillOpacity="0.85" 
                className="select-none font-serif transition-transform group-hover:scale-110 origin-center"
                style={{ transformOrigin: `${symPos.x}px ${symPos.y}px` }}
              >
                {sign.symbol}
              </text>
            </g>
          )
        })}

        {/* Bordi Dorati */}
        <circle cx={CX} cy={CY} r={R.SIGN_OUT} fill="none" stroke="rgba(212,160,23,0.6)" strokeWidth="4" />
        <circle cx={CX} cy={CY} r={R.SIGN_IN}  fill="none" stroke="rgba(212,160,23,0.2)" strokeWidth="2" />

        {/* ── Pianeti ── */}
        {planets.map((p: PlanetData) => {
          const info = BODY_INFO_STATIC[p.nome]; if (!info) return null
          const r_orb = RING_R[p.categoria] ?? R.FAST
          const pos = toXY(r_orb, p.lon_assoluta); const isHov = hovered === p.nome
          const dotR = p.categoria === 'veloce' ? 18 : p.categoria === 'lento' ? 14 : 10
          const glyph = BODY_GLYPHS[p.nome] || '●'

          return (
            <g key={p.nome} onMouseEnter={() => setHovered(p.nome)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
              {isHov && <line x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke={info.color} strokeOpacity="0.25" strokeWidth="2" />}
              {isHov && <circle cx={pos.x} cy={pos.y} r={dotR * 2.5} fill={info.color} fillOpacity={0.12} filter={theme.planetLighting === 'glow' ? 'url(#glow-big)' : 'none'} />}
              
              <circle 
                cx={pos.x} cy={pos.y} r={dotR} 
                fill={info.color} 
                fillOpacity={isHov ? 1 : 0.85} 
                filter={theme.planetLighting === 'glow' ? 'url(#glow-big)' : 'none'}
                style={{ 
                  filter: theme.planetLighting === 'shadow' 
                    ? `drop-shadow(2px 2px 0px rgba(0,0,0,1))` 
                    : undefined,
                  transition: 'filter 4s ease-in-out'
                }}
              />
              
              <text 
                x={pos.x + dotR + 8} y={pos.y - 4} 
                fontSize={p.categoria === 'veloce' ? 44 : 36} 
                fill={info.color} 
                fillOpacity={isHov ? 1 : 0.8} 
                className="select-none font-serif"
                style={{ 
                  filter: theme.planetLighting === 'shadow' 
                    ? `drop-shadow(2px 2px 0px rgba(0,0,0,1))` 
                    : undefined,
                  transition: 'filter 4s ease-in-out'
                }}
              >
                {glyph}
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

        {/* ── 360° Graduazioni (Ticks) - OVERLAY ── */}
        {useMemo(() => {
          const ticks = []
          for (let i = 0; i < 360; i++) {
            const isSign = i % 30 === 0
            const isDecan = i % 10 === 0
            const isFive = i % 5 === 0
            
            let tickLen = 15
            let strokeW = 2
            let opacity = 0.3
            
            if (isSign) { tickLen = 50; strokeW = 4; opacity = 0.8 }
            else if (isDecan) { tickLen = 35; strokeW = 3; opacity = 0.6 }
            else if (isFive) { tickLen = 25; strokeW = 2; opacity = 0.4 }
            
            const p1 = toXY(R.INNER, i)
            const p2 = toXY(R.INNER + tickLen, i)
            
            ticks.push(
              <line 
                key={`tick-${i}`} 
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
                stroke="rgba(212,160,23,0.9)" 
                strokeWidth={strokeW} 
                opacity={opacity} 
              />
            )
          }
          return ticks
        }, [])}

        {/* ── Puntatore Luna ( Overlay ) ── */}
        {(() => {
          const luna = planets.find(p => p.nome === 'Luna')
          if (!luna) return null
          const r_orb = RING_R[luna.categoria] ?? R.FAST
          const pMoon = toXY(r_orb, luna.lon_assoluta)
          const pScale = toXY(R.INNER, luna.lon_assoluta)
          return (
            <g>
              <line 
                x1={pScale.x} y1={pScale.y} x2={pMoon.x} y2={pMoon.y} 
                stroke="#C8E0FF" strokeWidth="3" 
                strokeOpacity="0.8"
                filter="url(#glow-big)"
              />
              <circle cx={pScale.x} cy={pScale.y} r="8" fill="#C8E0FF" filter="url(#glow-big)" />
              <circle cx={pMoon.x} cy={pMoon.y} r="25" fill="none" stroke="#C8E0FF" strokeWidth="2" strokeDasharray="5 5" opacity="0.5" />
            </g>
          )
        })()}

        {/* Hub Centrale */}
        <circle cx={CX} cy={CY} r={R.INNER} fill="rgba(8,5,18,0.98)" stroke="rgba(212,160,23,0.4)" strokeWidth="3" />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
            {(() => {
              const luna = planets.find(p => p.nome === 'Luna')
              if (luna) {
                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-1"
                  >
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#C8E0FF] opacity-80 mb-0.5">Luna a</p>
                    <p className="text-[#C8E0FF] font-mono text-xl font-bold leading-none">{luna.gradi.toFixed(2)}°</p>
                    <p className="text-[10px] text-[#C8E0FF]/60 font-serif">{luna.segno}</p>
                  </motion.div>
                )
              }
              return (
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-1">{ascSign ? 'Ascendente' : 'Cielo'}</p>
              )
            })()}
          <p className="text-white font-serif font-bold text-2xl md:text-3xl mt-1">{ascSign || 'Attuale'}</p>
          {ascDeg !== undefined && !planets.find(p => p.nome === 'Luna') && (
            <p className="text-gold-500/50 text-xs mt-1 font-mono">{ascDeg.toFixed(1)}°</p>
          )}
        </div>
      </div>
    </div>
  )
}

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

const CX = 1000; const CY = 1000

function toXY(r: number, lon: number, rotationOffset: number = 0) {
  const angleDeg = 180 - (lon - rotationOffset)
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function arcPath(rOuter: number, rInner: number, lonStart: number, lonEnd: number, offset: number) {
  const p1 = toXY(rOuter, lonStart, offset); const p2 = toXY(rOuter, lonEnd, offset)
  const p3 = toXY(rInner, lonEnd, offset);   const p4 = toXY(rInner, lonStart, offset)
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 0 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 0 1 ${p4.x} ${p4.y}`,
    'Z'
  ].join(' ')
}

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
  mcLon?: number
  className?: string
  theme: CircadianTheme
}

interface TypedAspectLine extends AspectResult {
  pos1: { x: number; y: number }
  pos2: { x: number; y: number }
  dash: string
}

export default function ZodiacWheel({ planets, ascLon, ascSign, mcLon, className = '', theme }: ZodiacWheelProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const rotationOffset = ascLon ?? 0

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
          pos1: toXY(r1 - 15, p1.lon_assoluta, rotationOffset),
          pos2: toXY(r2 - 15, p2.lon_assoluta, rotationOffset),
          dash: asp.type === 'Sestile' ? '10 20' : '0'
        } as TypedAspectLine
      })
  }, [planets, rotationOffset])

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ aspectRatio: '1/1' }}>
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(120,80,240,0.15) 0%, rgba(40,20,120,0.05) 65%, transparent 85%)' }} />

      <svg viewBox="0 0 2000 2000" className="w-full h-full overflow-visible">
        <defs>
          <filter id="glow-p" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle 
          cx={CX} cy={CY} 
          r={R.OUTER} 
          fill={theme.zodiacDiskColor} 
          style={{ transition: 'fill 4s ease-in-out' }}
        />

        {/* ── Ombreggiatura Emisfero Inferiore ── */}
        <path 
           d={`M ${CX - R.OUTER} ${CY} A ${R.OUTER} ${R.OUTER} 0 0 0 ${CX + R.OUTER} ${CY} L ${CX} ${CY} Z`}
           fill="black" fillOpacity="0.1"
        />

        {/* ── Linee Aspetti ── */}
        <g style={{ transition: 'opacity 4s ease-in-out' }} opacity={theme.aspectLineOpacity}>
          {aspectLines.map((line: TypedAspectLine, idx: number) => (
            <line
              key={idx}
              x1={line.pos1.x} y1={line.pos1.y}
              x2={line.pos2.x} y2={line.pos2.y}
              stroke={theme.aspectLineColor === '#E0E0E0' || theme.aspectLineColor === '#FFFFFF' ? theme.aspectLineColor : line.color}
              strokeWidth="2.5"
              strokeDasharray={line.dash}
              strokeOpacity={0.2 + (line.precision * 0.45)}
              style={{ transition: 'stroke 4s ease-in-out' }}
            />
          ))}
        </g>

        {/* ── 12 Settori ── */}
        {ZODIAC.map((sign, i) => {
          const lon0 = i * 30; const lon1 = lon0 + 30; const mid = lon0 + 15
          const symPos = toXY((R.SIGN_OUT + R.SIGN_IN) / 2, mid, rotationOffset)
          return (
            <g key={sign.name} className="cursor-help group">
              <title>{`${sign.name} (${sign.el})`}</title>
              <path 
                d={arcPath(R.SIGN_OUT, R.SIGN_IN, lon0, lon1, rotationOffset)}
                fill={ELEMENT_BG[sign.el]} 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="1" 
                className="transition-opacity group-hover:fill-opacity-20"
              />
              <text 
                x={symPos.x} y={symPos.y + 5} 
                textAnchor="middle" dominantBaseline="central"
                fontSize="72" fill={sign.color} fillOpacity="0.6" 
                className="select-none font-serif transition-transform group-hover:scale-110 origin-center"
                style={{ transformOrigin: `${symPos.x}px ${symPos.y}px` }}
              >
                {sign.symbol}
              </text>
            </g>
          )
        })}

        {/* Bordi ── */}
        <circle cx={CX} cy={CY} r={R.SIGN_OUT} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        <circle cx={CX} cy={CY} r={R.SIGN_IN}  fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />

        {/* ── GRID: Orizzonte & Meridiano (BLUE THICK LINES LIKE ASTRONLINE) ── */}
        {ascLon !== undefined && (
          <g>
            {/* Orizzonte ASC-DSC */}
            <line 
               x1={CX - R.SIGN_OUT} y1={CY} x2={CX + R.SIGN_OUT} y2={CY} 
               stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" 
               className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            />
            <text x={CX - R.SIGN_OUT - 20} y={CY + 12} textAnchor="end" fontSize="36" fill="#3b82f6" fontWeight="bold" className="font-serif shadow-sm">ASC</text>
            <text x={CX + R.SIGN_OUT + 20} y={CY + 12} textAnchor="start" fontSize="36" fill="#3b82f6" fontWeight="bold" opacity="0.8" className="font-serif shadow-sm">DSC</text>
          </g>
        )}

        {mcLon !== undefined && (() => {
          const pMC = toXY(R.SIGN_OUT, mcLon, rotationOffset)
          const pIC = toXY(R.SIGN_OUT, (mcLon + 180) % 360, rotationOffset)
          const pMCLabel = toXY(R.SIGN_OUT + 45, mcLon, rotationOffset)
          const pICLabel = toXY(R.SIGN_OUT + 55, (mcLon + 180) % 360, rotationOffset)
          return (
            <g>
              <line 
                 x1={pIC.x} y1={pIC.y} x2={pMC.x} y2={pMC.y} 
                 stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" 
                 className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              />
              <text x={pMCLabel.x} y={pMCLabel.y} textAnchor="middle" dominantBaseline="middle" fontSize="38" fill="#3b82f6" fontWeight="bold" className="font-serif">MC</text>
              <text x={pICLabel.x} y={pICLabel.y} textAnchor="middle" dominantBaseline="middle" fontSize="38" fill="#3b82f6" fontWeight="bold" opacity="0.8" className="font-serif">IC</text>
            </g>
          )
        })()}

        {/* ── Pianeti ── */}
        {planets.map((p: PlanetData) => {
          const info = BODY_INFO_STATIC[p.nome]; if (!info) return null
          const r_orb = RING_R[p.categoria] ?? R.FAST
          const pos = toXY(r_orb, p.lon_assoluta, rotationOffset); const isHov = hovered === p.nome
          const dotR = p.categoria === 'veloce' ? 18 : p.categoria === 'lento' ? 14 : 10
          const glyph = BODY_GLYPHS[p.nome] || '●'

          return (
            <g key={p.nome} onMouseEnter={() => setHovered(p.nome)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
              {isHov && <line x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke={info.color} strokeOpacity="0.25" strokeWidth="2" />}
              <circle cx={pos.x} cy={pos.y} r={dotR} fill={info.color} fillOpacity={isHov ? 1 : 0.85} filter={isHov ? 'url(#glow-p)' : 'none'} />
              <text x={pos.x + dotR + 8} y={pos.y - 4} fontSize={p.categoria === 'veloce' ? 44 : 36} fill={info.color} fillOpacity={isHov ? 1 : 0.8} className="select-none font-serif">{glyph}</text>
            </g>
          )
        })}

        {/* ── 360° PRECISION GRADUATION (ON BORDER INTERNAL FACING OUT) ── */}
        {useMemo(() => {
          const elements = []
          for (let i = 0; i < 360; i++) {
            const isSign = i % 30 === 0
            const isDecan = i % 10 === 0
            const isFive = i % 5 === 0
            
            let tickLen = 10; let strokeW = 0.8; let opacity = 0.15; let strokeColor = "rgba(255,255,255,0.4)"
            
            if (isSign) { 
              tickLen = 60; strokeW = 4.5; opacity = 1.0; strokeColor = "rgba(212,160,23,1)" // ORO BRILLANTE
            } else if (isDecan) { 
              tickLen = 35; strokeW = 2.5; opacity = 0.8; strokeColor = "rgba(212,160,23,0.7)" // MARCATORE DECANO
            } else if (isFive) { 
              tickLen = 20; strokeW = 1.5; opacity = 0.5; strokeColor = "rgba(255,255,255,0.6)" // OGNI 5 GRADI
            }
            
            const p1 = toXY(R.SIGN_IN, i, rotationOffset)
            const p2 = toXY(R.SIGN_IN + tickLen, i, rotationOffset)
            
            elements.push(
              <line 
                key={`tick-${i}`} 
                x1={p1.x} y1={p1.y} 
                x2={p2.x} y2={p2.y} 
                stroke={strokeColor} 
                strokeWidth={strokeW} 
                opacity={opacity} 
                filter={isSign ? 'url(#glow-p)' : 'none'}
              />
            )

            if (isDecan && !isSign) {
              const labelPos = toXY(R.SIGN_IN + 55, i, rotationOffset)
              elements.push(
                <text 
                  key={`deg-${i}`} 
                  x={labelPos.x} y={labelPos.y} 
                  fontSize="44" 
                  fill="#FFD700" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="font-mono font-bold"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 5px rgba(255,215,0,0.5)' }}
                >
                  {i % 30}
                </text>
              )
            }
          }
          return elements
        }, [rotationOffset])}

        {/* ── MOON LASER POINTER ── */}
        {(() => {
          const luna = planets.find(p => p.nome === 'Luna')
          if (!luna) return null
          const pScale = toXY(R.SIGN_IN, luna.lon_assoluta, rotationOffset)
          const pText = toXY(R.SIGN_IN + 100, luna.lon_assoluta, rotationOffset)
          
          return (
            <g>
              <line x1={CX} y1={CY} x2={pScale.x} y2={pScale.y} stroke="#fff" strokeWidth="2.5" strokeOpacity="1" filter="url(#glow-p)" />
              <circle cx={pScale.x} cy={pScale.y} r="12" fill="#fff" filter="url(#glow-p)" />
              <g transform={`translate(${pText.x}, ${pText.y})`}>
                <rect x="-60" y="-25" width="120" height="50" rx="10" fill="#fff" />
                <text textAnchor="middle" dominantBaseline="middle" fontSize="32" fill="#000" fontWeight="bold" className="font-mono">{luna.gradi.toFixed(1)}°</text>
              </g>
            </g>
          )
        })()}

        <circle cx={CX} cy={CY} r={R.INNER} fill="rgba(8,5,18,0.95)" stroke="rgba(212,160,23,0.4)" strokeWidth="3" />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
            {(() => {
              const luna = planets.find(p => p.nome === 'Luna')
              if (luna) {
                return (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-1">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#C8E0FF] opacity-80 mb-0.5">Luna</p>
                    <p className="text-[#C8E0FF] font-mono text-xl font-bold leading-none">{luna.gradi.toFixed(2)}°</p>
                    <p className="text-[10px] text-[#C8E0FF]/60 font-serif lowercase italic">{luna.segno}</p>
                  </motion.div>
                )
              }
              return <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-1">{ascSign ? 'Ascendente' : 'Cielo'}</p>
            })()}
          <p className="text-white font-serif font-bold text-2xl md:text-3xl mt-1 tracking-tight">{ascSign || 'Attuale'}</p>
        </div>
      </div>
    </div>
  )
}

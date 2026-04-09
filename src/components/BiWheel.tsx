import { useState } from 'react'
import { BODY_GLYPHS, type PlanetData, type AspectResult } from '../utils/astrologyUtils'
import { type CircadianTheme } from '../hooks/useCircadianTheme'

// ─────────────────────────────────────────────
// CONFIGURAZIONE BI-WHEEL
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

const BODY_INFO_STATIC: Record<string, { color: string }> = {
  'Sole':                { color: '#FFD700' },
  'Luna':                { color: '#C8E0FF' },
  'Mercurio':            { color: '#CCCCCC' },
  'Venere':              { color: '#FFB3C6' },
  'Marte':               { color: '#FF6060' },
  'Giove':               { color: '#FFA050' },
  'Saturno':             { color: '#C8B89A' },
  'Urano':               { color: '#70D0D0' },
  'Nettuno':             { color: '#8080F0' },
  'Plutone':             { color: '#B090C0' },
  'Chirone':             { color: '#D08060' },
  'Nodo Nord':           { color: '#FFD700' },
  'Nodo Sud':            { color: '#C0A030' },
  'Lilith':              { color: '#C060A0' },
}

const CX = 1000; const CY = 1000
const R = {
  OUTER:       960,   
  SIGN_OUT:    950,   
  SIGN_IN:     800,   
  TRANSIT_R:   700,    // Anello esterno: Transiti
  NATAL_R:     500,    // Anello interno: Natali
  INNER:       300,   
}

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

export interface TransitAspect {
  pianeta_attuale: string
  pianeta_natale: string
  tipo: string
  orbita: number
  intensita: number
}

interface BiWheelProps {
  natalPlanets: PlanetData[]
  transitPlanets: PlanetData[]
  transitAspects: AspectResult[]
  ascLon?: number
  houses?: { numero: number; lon_assoluta: number }[]
  className?: string
  theme: CircadianTheme
}

export default function BiWheel({ 
  natalPlanets, transitPlanets, transitAspects, 
  ascLon, houses = [],
  className = '', theme 
}: BiWheelProps) {
  const [hovered, setHovered] = useState<{name: string, type: 'natal' | 'transit'} | null>(null)
  const rotationOffset = ascLon ?? 0

  return (
    <div className={`relative flex flex-col lg:flex-row items-center justify-center gap-12 ${className}`}>
      {/* ── Ruota Astrale ── */}
      <div className="relative w-full max-w-[800px] flex-shrink-0" style={{ aspectRatio: '1/1' }}>
        <svg viewBox="0 0 2000 2000" className="w-full h-full overflow-visible">
          <defs>
            <filter id="glow-p" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <circle 
            cx={CX} cy={CY} r={R.OUTER} 
            fill={theme.zodiacDiskColor} 
            className="transition-colors duration-1000"
          />

          {/* ── Guide Visive Cerchi Interno/Esterno ── */}
          {/* Cerchio Transiti (Esterno) - Area bluastra */}
        <circle 
          cx={CX} cy={CY} r={R.TRANSIT_R + 50} 
          fill="none" stroke="rgba(59, 130, 246, 0.12)" strokeWidth="100" 
        />
        <text x={CX} y={CY - R.TRANSIT_R - 35} textAnchor="middle" fontSize="38" fill="rgba(100, 170, 255, 1)" fontWeight="black" className="uppercase tracking-[0.6em]">
          CORRENTE DEL PRESENTE (TRANSITI)
        </text>

        {/* Cerchio Natale (Interno) - Area dorata */}
        <circle 
          cx={CX} cy={CY} r={R.NATAL_R + 40} 
          fill="none" stroke="rgba(212, 160, 23, 0.08)" strokeWidth="90" 
        />
        <text x={CX} y={CY - R.NATAL_R + 30} textAnchor="middle" fontSize="38" fill="rgba(212, 160, 23, 0.85)" fontWeight="black" className="uppercase tracking-[0.6em]">
          RADICE IMMUTABILE (NATALE)
        </text>

          {/* ── 12 Segni Zodiacali ── */}
          {ZODIAC.map((sign, i) => {
            const lon0 = i * 30; const lon1 = lon0 + 30; const mid = lon0 + 15
            const symPos = toXY((R.SIGN_OUT + R.SIGN_IN) / 2, mid, rotationOffset)
            return (
              <g key={sign.name}>
                <path 
                  d={arcPath(R.SIGN_OUT, R.SIGN_IN, lon0, lon1, rotationOffset)}
                  fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"
                />
                <text 
                  x={symPos.x} y={symPos.y + 5} 
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="60" fill={sign.color} fillOpacity="0.6"
                >
                  {sign.symbol}
                </text>
              </g>
            )
          })}

          {/* ── Griglia Case Natali ── */}
          {houses.map(h => {
            const p1 = toXY(R.INNER, h.lon_assoluta, rotationOffset)
            const p2 = toXY(R.SIGN_IN, h.lon_assoluta, rotationOffset)
            return (
              <line 
                key={h.numero}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5 5"
              />
            )
          })}

          {/* ── Linee Transiti (Aspetti attivi tra esterno ed interno) ── */}
          {transitAspects.map((asp, idx) => {
            const nP = natalPlanets.find(p => p.nome === asp.p1)
            const tP = transitPlanets.find(p => p.nome === asp.p2)
            if (!nP || !tP) return null
            
            const posN = toXY(R.NATAL_R, nP.lon_assoluta, rotationOffset)
            const posT = toXY(R.TRANSIT_R, tP.lon_assoluta, rotationOffset)
            
            let color = '#fff'
            if (asp.type === 'Quadrato' || asp.type === 'Opposizione') color = '#ef4444'
            if (asp.type === 'Trigono' || asp.type === 'Sestile') color = '#3b82f6'
            if (asp.type === 'Congiunzione') color = '#fbbf24'

            return (
              <line
                key={idx}
                x1={posN.x} y1={posN.y} x2={posT.x} y2={posT.y}
                stroke={color} strokeWidth="3" strokeOpacity={asp.precision * 0.8}
              />
            )
          })}

          {/* ── Pianeti Natali (Anello Interno) ── */}
          {natalPlanets.map(p => {
            const info = BODY_INFO_STATIC[p.nome]; if (!info) return null
            const pos = toXY(R.NATAL_R, p.lon_assoluta, rotationOffset)
            const glyph = BODY_GLYPHS[p.nome] || '●'

            return (
              <g key={`natal-${p.nome}`} onMouseEnter={() => setHovered({name: p.nome, type: 'natal'})} onMouseLeave={() => setHovered(null)}>
                <circle cx={pos.x} cy={pos.y} r="15" fill={info.color} fillOpacity="0.4" />
                <text 
                  x={pos.x} y={pos.y + 2} textAnchor="middle" dominantBaseline="middle"
                  fontSize="40" fill={info.color}
                >
                  {glyph}
                </text>
              </g>
            )
          })}

          {/* ── Pianeti in Transito (Anello Esterno) ── */}
          {transitPlanets.map(p => {
            const info = BODY_INFO_STATIC[p.nome]; if (!info) return null
            const pos = toXY(R.TRANSIT_R, p.lon_assoluta, rotationOffset)
            const glyph = BODY_GLYPHS[p.nome] || '●'
            const isHov = hovered?.name === p.nome && hovered?.type === 'transit'

            return (
              <g key={`transit-${p.nome}`} onMouseEnter={() => setHovered({name: p.nome, type: 'transit'})} onMouseLeave={() => setHovered(null)}>
                <circle cx={pos.x} cy={pos.y} r="20" fill="none" stroke={info.color} strokeWidth="2" strokeDasharray="2 2" />
                <text 
                  x={pos.x} y={pos.y + 2} textAnchor="middle" dominantBaseline="middle"
                  fontSize="45" fill={info.color}
                >
                  {glyph}
                </text>
                {isHov && (
                  <text x={pos.x} y={pos.y - 35} textAnchor="middle" fontSize="24" fill="#fff" fontWeight="bold">
                    {p.nome} OGGI
                  </text>
                )}
              </g>
            )
          })}

          {/* Centro Ruota */}
          <circle cx={CX} cy={CY} r={R.INNER} fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <text 
            x={CX} y={CY} textAnchor="middle" dominantBaseline="middle"
            fontSize="40" fill="white" fillOpacity="0.2" fontWeight="bold"
          >
            TRANSITI
          </text>
        </svg>
      </div>

      {/* ── Legenda Astrale ── */}
      <div className="flex-1 w-full max-w-sm mystical-card bg-white/[0.02] border-white/5 p-6 h-fit self-start lg:mt-12">
         <h4 className="font-serif text-lg text-white mb-6 flex items-center gap-2">
            <span className="text-xl">📜</span> Simbolismo Celeste
         </h4>
         <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {Object.keys(BODY_GLYPHS).map(name => {
               const glyph = BODY_GLYPHS[name]
               const color = BODY_INFO_STATIC[name]?.color || '#fff'
               return (
                  <div key={name} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.03] hover:bg-white/5 transition-colors group">
                     <span className="text-2xl w-8 text-center" style={{ color }}>{glyph}</span>
                     <span className="text-xs text-white/60 group-hover:text-white transition-colors">{name}</span>
                  </div>
               )
            })}
         </div>
         <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-gold-500/20 border border-gold-500/50" />
               <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none">Anello Interno: Radice Natale</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full border border-blue-400 border-dashed" />
               <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none">Anello Esterno: Transiti Oggi</p>
            </div>
         </div>
      </div>
    </div>
  )
}

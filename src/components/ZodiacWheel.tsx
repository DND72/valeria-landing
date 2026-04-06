import { useState } from 'react'

// -------------------------------------------------------
// Costanti
// -------------------------------------------------------
const ZODIAC = [
  { name: 'Ariete',     symbol: '♈', color: '#e05c5c' },
  { name: 'Toro',       symbol: '♉', color: '#7ec89e' },
  { name: 'Gemelli',    symbol: '♊', color: '#f5d77a' },
  { name: 'Cancro',     symbol: '♋', color: '#88b8e0' },
  { name: 'Leone',      symbol: '♌', color: '#f5a623' },
  { name: 'Vergine',    symbol: '♍', color: '#aed68a' },
  { name: 'Bilancia',   symbol: '♎', color: '#d4a0e8' },
  { name: 'Scorpione',  symbol: '♏', color: '#c0526c' },
  { name: 'Sagittario', symbol: '♐', color: '#f08050' },
  { name: 'Capricorno', symbol: '♑', color: '#9aaaba' },
  { name: 'Acquario',   symbol: '♒', color: '#6ab0e0' },
  { name: 'Pesci',      symbol: '♓', color: '#9a80d0' },
]

const PLANET_SYMBOLS: Record<string, { glyph: string; color: string }> = {
  'Sole':     { glyph: '☉', color: '#FFD700' },
  'Luna':     { glyph: '☽', color: '#C0D8F0' },
  'Mercurio': { glyph: '☿', color: '#CCC' },
  'Venere':   { glyph: '♀', color: '#FFB3C6' },
  'Marte':    { glyph: '♂', color: '#FF6060' },
  'Giove':    { glyph: '♃', color: '#FFA050' },
  'Saturno':  { glyph: '♄', color: '#C8B89A' },
  'Urano':    { glyph: '♅', color: '#70D0D0' },
  'Nettuno':  { glyph: '♆', color: '#8080F0' },
  'Plutone':  { glyph: '♇', color: '#B090C0' },
}

// -------------------------------------------------------
// Geometria: lon assoluta → coordinate SVG
// La convenzione astrologica ha 0°Ariete a sinistra=9h orologio,
// e i gradi crescono in senso antiorario.
// In SVG: x = cx + r·cos(θ), y = cy - r·sin(θ)  (asse Y invertito)
// -------------------------------------------------------
function toXY(cx: number, cy: number, r: number, lonDeg: number) {
  // lonDeg: 0 = Ariete, cresce antiorario sopra
  // Vogliamo Ariete a sx (180° Math) e crescita antioraria
  const rad = ((180 - lonDeg) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

// -------------------------------------------------------
// Interfacce
// -------------------------------------------------------
export interface PlanetData {
  nome: string
  segno: string
  gradi: number
  lon_assoluta: number
}

interface ZodiacWheelProps {
  planets: PlanetData[]
  ascLon?: number      // longitudine assoluta dell'Ascendente (opzionale)
  ascSign?: string     // segno ascendente (opzionale)
  ascDeg?: number      // grado nel segno (opzionale)
  size?: number
}

// -------------------------------------------------------
// Componente
// -------------------------------------------------------
export default function ZodiacWheel({ planets, ascLon, ascSign, ascDeg, size = 440 }: ZodiacWheelProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const cx = size / 2
  const cy = size / 2

  // Raggi
  const R_OUTER     = size * 0.46   // bordo esterno (anello segni)
  const R_SIGN_IN   = size * 0.36   // bordo interno anello segni
  const R_PLANET    = size * 0.27   // orbita dei pianeti
  const R_INNER     = size * 0.18   // cerchio interno vuoto

  return (
    <div className="relative" style={{ width: size, height: size, maxWidth: '100%' }}>
      {/* Glow */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(120,80,200,0.25) 0%, rgba(60,30,120,0.1) 60%, transparent 80%)' }} />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="w-full h-auto overflow-visible"
        style={{ maxWidth: '100%' }}
      >
        <defs>
          {/* Sfondo disco */}
          <radialGradient id="zw-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0f0a1e" />
            <stop offset="100%" stopColor="#060410" />
          </radialGradient>
          {/* Glow ring */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Clip cerchio */}
          <clipPath id="outerClip">
            <circle cx={cx} cy={cy} r={R_OUTER} />
          </clipPath>
        </defs>

        {/* ── Disco base ── */}
        <circle cx={cx} cy={cy} r={R_OUTER} fill="url(#zw-bg)" />

        {/* ── Anello Zodiaco: 12 settori ── */}
        {ZODIAC.map((sign, i) => {
          const startLon = i * 30       // 0,30,60,...
          const endLon   = startLon + 30
          const midLon   = startLon + 15

          const p1 = toXY(cx, cy, R_OUTER, startLon)
          const p2 = toXY(cx, cy, R_OUTER, endLon)
          const p3 = toXY(cx, cy, R_SIGN_IN, endLon)
          const p4 = toXY(cx, cy, R_SIGN_IN, startLon)

          // Arc flags: grande arco se sweep > 180, antiorario → sweep-flag=0
          const d = [
            `M ${p1.x} ${p1.y}`,
            `A ${R_OUTER} ${R_OUTER} 0 0 0 ${p2.x} ${p2.y}`,
            `L ${p3.x} ${p3.y}`,
            `A ${R_SIGN_IN} ${R_SIGN_IN} 0 0 1 ${p4.x} ${p4.y}`,
            'Z'
          ].join(' ')

          // Simbolo al centro del settore
          const symPos = toXY(cx, cy, (R_OUTER + R_SIGN_IN) / 2, midLon)

          // Spessore alternato per gli elementi (fuoco/terra/aria/acqua)
          const bgOpacity = [0.07, 0.04, 0.07, 0.04][i % 4]

          return (
            <g key={sign.name}>
              <path d={d} fill={sign.color} fillOpacity={bgOpacity}
                stroke="rgba(212,160,23,0.25)" strokeWidth="0.5" />
              <text
                x={symPos.x} y={symPos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.038} fill={sign.color}
                className="select-none"
                style={{ fontFamily: 'serif', pointerEvents: 'none' }}
              >
                {sign.symbol}
              </text>
            </g>
          )
        })}

        {/* ── Bordo esterno dorato ── */}
        <circle cx={cx} cy={cy} r={R_OUTER} fill="none"
          stroke="rgba(212,160,23,0.6)" strokeWidth="1.5" />

        {/* ── Bordo interno anello segni ── */}
        <circle cx={cx} cy={cy} r={R_SIGN_IN} fill="rgba(0,0,0,0.55)"
          stroke="rgba(212,160,23,0.3)" strokeWidth="1" />

        {/* ── Divisori dei segni dal cerchio interno ── */}
        {Array.from({ length: 12 }, (_, i) => {
          const lon = i * 30
          const p1 = toXY(cx, cy, R_SIGN_IN, lon)
          const p2 = toXY(cx, cy, R_INNER, lon)
          return (
            <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke="rgba(212,160,23,0.15)" strokeWidth="1" />
          )
        })}

        {/* ── Cerchio orbita pianeti ── */}
        <circle cx={cx} cy={cy} r={R_PLANET} fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2 4" />

        {/* ── Cerchio interno ── */}
        <circle cx={cx} cy={cy} r={R_INNER} fill="rgba(8,4,20,0.9)"
          stroke="rgba(212,160,23,0.4)" strokeWidth="1" />

        {/* ── Pianeti ── */}
        {planets.map((planet) => {
          const { x, y } = toXY(cx, cy, R_PLANET, planet.lon_assoluta)
          const info = PLANET_SYMBOLS[planet.nome]
          const isHovered = hovered === planet.nome

          return (
            <g key={planet.nome}
              onMouseEnter={() => setHovered(planet.nome)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Linea radiale sottile */}
              <line x1={cx} y1={cy} x2={x} y2={y}
                stroke={info?.color || '#fff'}
                strokeOpacity={isHovered ? 0.3 : 0.1}
                strokeWidth="0.5" />

              {/* Alone al hover */}
              {isHovered && (
                <circle cx={x} cy={y} r={size * 0.032}
                  fill={info?.color || '#fff'} fillOpacity="0.15" />
              )}

              {/* Cerchietto base */}
              <circle cx={x} cy={y} r={size * 0.018}
                fill={info?.color || '#fff'} fillOpacity={isHovered ? 1 : 0.7}
                filter="url(#glow)" />

              {/* Simbolo */}
              <text x={x + size * 0.022} y={y - size * 0.015}
                fontSize={size * 0.032}
                fill={info?.color || '#fff'}
                fillOpacity={isHovered ? 1 : 0.75}
                textAnchor="start" dominantBaseline="central"
                className="select-none"
                style={{ fontFamily: 'serif', pointerEvents: 'none' }}
              >
                {info?.glyph || '●'}
              </text>

              {/* Tooltip al hover */}
              {isHovered && (() => {
                // Calcola posizione tooltip (se vicino al bordo, inverti)
                const tx = x < cx ? x + size * 0.05 : x - size * 0.05
                const ty = y < cy ? y - size * 0.06 : y + size * 0.06
                const label = `${planet.nome} ${planet.segno} ${planet.gradi.toFixed(1)}°`
                return (
                  <g>
                    <rect
                      x={tx - label.length * 3.2}
                      y={ty - 10}
                      width={label.length * 6.4}
                      height={20}
                      rx="4"
                      fill="rgba(10,5,25,0.9)"
                      stroke="rgba(212,160,23,0.5)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={tx} y={ty + 1}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={size * 0.026}
                      fill="#fff"
                      className="select-none"
                      style={{ fontFamily: 'sans-serif', pointerEvents: 'none' }}
                    >
                      {label}
                    </text>
                  </g>
                )
              })()}
            </g>
          )
        })}

        {/* ── Asse Ascendente / Discendente ── */}
        {ascLon !== undefined && (() => {
          const pAsc = toXY(cx, cy, R_OUTER + 8, ascLon)
          const pDsc = toXY(cx, cy, R_OUTER + 8, (ascLon + 180) % 360)
          const pAscIn = toXY(cx, cy, R_INNER, ascLon)
          const pDscIn = toXY(cx, cy, R_INNER, (ascLon + 180) % 360)
          return (
            <g>
              <line x1={pAscIn.x} y1={pAscIn.y} x2={pAsc.x} y2={pAsc.y}
                stroke="#D4A017" strokeWidth="2" strokeLinecap="round" />
              <line x1={pDscIn.x} y1={pDscIn.y} x2={pDsc.x} y2={pDsc.y}
                stroke="#D4A017" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx={pAsc.x} cy={pAsc.y} r="4" fill="#D4A017" filter="url(#glow)" />
              {/* Label ASC */}
              <text x={pAsc.x} y={pAsc.y - 12}
                textAnchor="middle" fontSize={size * 0.028}
                fill="#D4A017" fontWeight="bold"
                className="select-none"
                style={{ fontFamily: 'serif', pointerEvents: 'none' }}
              >
                ASC
              </text>
            </g>
          )
        })()}
      </svg>

      {/* Testo centrale sovrapposto (HTML, non ruota) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          {ascSign ? (
            <>
              <p className="text-[9px] uppercase tracking-[0.2em] text-gold-500/70 mb-1">Ascendente</p>
              <p className="font-serif text-white leading-none mb-0.5"
                style={{ fontSize: size * 0.065 }}>
                {ascSign}
              </p>
              {ascDeg !== undefined && (
                <p className="text-white/40 text-[10px] tracking-wider">{ascDeg.toFixed(1)}°</p>
              )}
            </>
          ) : (
            <>
              <p className="text-[9px] uppercase tracking-[0.15em] text-gold-500/60 mb-1">Cielo</p>
              <p className="text-gold-400/80 text-[9px]">Attuale</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'

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
  'Fuoco': 'rgba(220,80,60,0.07)',
  'Terra': 'rgba(80,200,100,0.07)',
  'Aria':  'rgba(255,220,80,0.07)',
  'Acqua': 'rgba(80,160,220,0.07)',
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
// Dati Costellazioni (posizioni stilizzate)
// rl = longitudine relativa nel settore (0-30)
// lat = latitudine eclittica approssimata (-8..+8)
// sz = dimensione stella (1=piccola, 2=media, 3=grande/brillante)
// ─────────────────────────────────────────────
interface StarDef { rl: number; lat: number; sz?: number }
interface ConstellationDef { stars: StarDef[]; lines: [number, number][] }

const CONSTELLATION: Record<string, ConstellationDef> = {
  'Ariete':     { stars: [{rl:4,lat:9,sz:2},{rl:7,lat:8},{rl:10,lat:7},{rl:25,lat:3}], lines:[[0,1],[1,2],[2,3]] },
  'Toro':       { stars: [{rl:5,lat:-5},{rl:9,lat:0},{rl:12,lat:4,sz:3},{rl:14,lat:-4},{rl:26,lat:4,sz:2}], lines:[[0,1],[1,2],[1,3]] },
  'Gemelli':    { stars: [{rl:4,lat:8,sz:2},{rl:6,lat:8,sz:2},{rl:5,lat:2},{rl:8,lat:2},{rl:12,lat:0},{rl:20,lat:5}], lines:[[0,1],[0,2],[1,3],[2,4],[3,4],[4,5]] },
  'Cancro':     { stars: [{rl:6,lat:-5},{rl:10,lat:-2},{rl:15,lat:0},{rl:12,lat:3},{rl:18,lat:-3}], lines:[[0,1],[1,2],[2,3],[2,4]] },
  'Leone':      { stars: [{rl:3,lat:-1,sz:3},{rl:7,lat:2},{rl:10,lat:5},{rl:12,lat:4},{rl:16,lat:0},{rl:20,lat:12,sz:2}], lines:[[0,1],[1,2],[2,3],[3,4],[0,4],[4,5]] },
  'Vergine':    { stars: [{rl:3,lat:8},{rl:8,lat:5},{rl:13,lat:2},{rl:17,lat:0},{rl:21,lat:-3,sz:3},{rl:26,lat:-5}], lines:[[0,1],[1,2],[2,3],[3,4],[4,5]] },
  'Bilancia':   { stars: [{rl:4,lat:5},{rl:10,lat:0},{rl:16,lat:-3},{rl:22,lat:0},{rl:26,lat:4,sz:2}], lines:[[0,1],[1,2],[2,3],[3,4],[0,4]] },
  'Scorpione':  { stars: [{rl:3,lat:-3,sz:3},{rl:6,lat:-2},{rl:10,lat:-1},{rl:13,lat:-3},{rl:17,lat:-6},{rl:21,lat:-10},{rl:25,lat:-14},{rl:28,lat:-16}], lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]] },
  'Sagittario': { stars: [{rl:3,lat:-4},{rl:8,lat:0},{rl:12,lat:3},{rl:9,lat:-2},{rl:16,lat:-1,sz:2},{rl:20,lat:2},{rl:23,lat:-3},{rl:27,lat:-5}], lines:[[0,1],[1,2],[3,4],[4,5],[5,6],[6,7],[1,3]] },
  'Capricorno': { stars: [{rl:2,lat:-2},{rl:7,lat:-5},{rl:13,lat:-6},{rl:18,lat:-4},{rl:23,lat:-2},{rl:27,lat:0}], lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[0,5]] },
  'Acquario':   { stars: [{rl:4,lat:-8,sz:2},{rl:10,lat:-6},{rl:16,lat:-5},{rl:21,lat:-8},{rl:8,lat:-3},{rl:14,lat:-2},{rl:23,lat:-3}], lines:[[0,1],[1,2],[2,3],[4,5],[5,6]] },
  'Pesci':      { stars: [{rl:3,lat:6},{rl:8,lat:4},{rl:13,lat:2},{rl:15,lat:5},{rl:19,lat:7},{rl:22,lat:4},{rl:26,lat:2}], lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[2,6]] },
}

// ─────────────────────────────────────────────
// Geometria: longitudine eclittica → coordinate SVG
// Ariete 0° → sinistra (9 o'clock). Gradi crescono antiorari.
// ViewBox: 1000×1000, centro = (500,500)
// ─────────────────────────────────────────────
const CX = 500; const CY = 500

function toXY(r: number, lon: number) {
  const rad = ((180 - lon) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

// Arco SVG tra due longitudini per un anello (interno e esterno)
function arcPath(rOuter: number, rInner: number, lonStart: number, lonEnd: number) {
  const p1 = toXY(rOuter, lonStart)
  const p2 = toXY(rOuter, lonEnd)
  const p3 = toXY(rInner, lonEnd)
  const p4 = toXY(rInner, lonStart)
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 0 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 0 1 ${p4.x} ${p4.y}`,
    'Z'
  ].join(' ')
}

// ─────────────────────────────────────────────
// Costanti raggi (in unità ViewBox 1000×1000)
// ─────────────────────────────────────────────
const R = {
  OUTER:       470,   // bordo esterno
  SIGN_OUT:    465,   // outer anello segni
  SIGN_IN:     395,   // inner anello segni / outer anello costellazioni
  CONST_IN:    340,   // inner anello costellazioni
  FAST:        288,   // Sole Luna Mercurio Venere Marte
  SLOW:        218,   // Giove … Chirone
  AST:         155,   // Asteroidi
  POINT:       100,   // Nodi Lunari, Lilith, etc.
  INNER:        65,   // hub centrale
}

// Mappatura categoria → raggio orbita
const RING_R: Record<string, number> = {
  veloce:    R.FAST,
  lento:     R.SLOW,
  asteroide: R.AST,
  punto:     R.POINT,
}

// ─────────────────────────────────────────────
// Interfaccia prop
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

  // Latitudine eclittica → raggio nell'anello costellazioni
  const latToR = (lat: number) => {
    const mid = (R.SIGN_IN + R.CONST_IN) / 2
    const hw  = (R.SIGN_IN - R.CONST_IN) / 2 * 0.85
    return mid + (lat / 8) * hw
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ aspectRatio: '1/1' }}>
      {/* Aura esterna */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(100,60,200,0.18) 0%, rgba(40,20,100,0.08) 55%, transparent 75%)' }} />

      <svg viewBox="0 0 1000 1000" className="w-full h-full overflow-visible"
        style={{ maxWidth: '100%', maxHeight: '100%' }}>

        <defs>
          {/* Sfondo disco */}
          <radialGradient id="zw-disk" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0e0820" />
            <stop offset="70%"  stopColor="#080512" />
            <stop offset="100%" stopColor="#050310" />
          </radialGradient>
          {/* Glow filtro */}
          <filter id="zw-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="zw-glow-sm" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Disco Base Universe ── */}
        <circle cx={CX} cy={CY} r={R.OUTER} fill="url(#zw-disk)" />

        {/* Stelle di sfondo (puntini random nell'area della ruota) */}
        {Array.from({ length: 120 }, (_, i) => {
          const angle = (i * 137.508) % 360   // filotassi per distribuzione uniforme
          const dist  = 50 + (i % 4) * 80 + (i % 7) * 20
          const r_star = Math.min(dist, R.POINT - 15)
          const { x, y } = toXY(r_star, angle)
          const sz = [0.8, 1.2, 1.5, 2.0, 0.6, 1.0, 1.8][i % 7]
          const op = [0.15, 0.25, 0.3, 0.2, 0.4, 0.15, 0.35][i % 7]
          return <circle key={i} cx={x} cy={y} r={sz} fill="white" fillOpacity={op} />
        })}

        {/* ── 12 Settori Zodiacali ── */}
        {ZODIAC.map((sign, i) => {
          const lon0 = i * 30
          const lon1 = lon0 + 30
          const midLon = lon0 + 15
          const symPos = toXY((R.SIGN_OUT + R.SIGN_IN) / 2, midLon)

          return (
            <g key={sign.name}>
              <path
                d={arcPath(R.SIGN_OUT, R.SIGN_IN, lon0, lon1)}
                fill={ELEMENT_BG[sign.el]}
                stroke="rgba(212,160,23,0.3)"
                strokeWidth="1"
              />
              {/* Simbolo segno */}
              <text
                x={symPos.x} y={symPos.y + 2}
                textAnchor="middle" dominantBaseline="central"
                fontSize="38" fill={sign.color} fillOpacity="0.9"
                style={{ fontFamily: 'serif', pointerEvents: 'none', userSelect: 'none' }}
              >
                {sign.symbol}
              </text>
              {/* Gradi 0° a inizio settore */}
              {(() => {
                const tp = toXY(R.SIGN_IN - 10, lon0)
                return <circle cx={tp.x} cy={tp.y} r="1.5" fill="rgba(212,160,23,0.4)" />
              })()}
            </g>
          )
        })}

        {/* ── Bordo Esterno ── */}
        <circle cx={CX} cy={CY} r={R.SIGN_OUT} fill="none" stroke="rgba(212,160,23,0.7)" strokeWidth="2" />
        <circle cx={CX} cy={CY} r={R.SIGN_IN}  fill="none" stroke="rgba(212,160,23,0.25)" strokeWidth="1" />

        {/* ── Anello Costellazioni ── */}
        {ZODIAC.map((sign, i) => {
          const sectorStart = i * 30
          const data = CONSTELLATION[sign.name]
          if (!data) return null

          const stars = data.stars.map(s => {
            const absLon = sectorStart + s.rl
            const r_s   = latToR(s.lat)
            return { ...toXY(r_s, absLon), sz: s.sz || 1 }
          })

          return (
            <g key={`const-${sign.name}`}>
              {/* Linee costellazione */}
              {data.lines.map(([a, b], li) => {
                const sa = stars[a], sb = stars[b]
                if (!sa || !sb) return null
                return (
                  <line key={li}
                    x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
                    stroke={sign.color} strokeOpacity="0.35" strokeWidth="0.8" />
                )
              })}
              {/* Stelle */}
              {stars.map((s, si) => (
                <circle key={si} cx={s.x} cy={s.y}
                  r={s.sz * 2.2}
                  fill={sign.color} fillOpacity={0.5 + s.sz * 0.15}
                  filter="url(#zw-glow-sm)"
                />
              ))}
            </g>
          )
        })}

        {/* Bordo interno anello costellazioni */}
        <circle cx={CX} cy={CY} r={R.CONST_IN} fill="rgba(0,0,0,0.45)" stroke="rgba(212,160,23,0.15)" strokeWidth="1" />

        {/* ── Orbite (cerchi tratteggiati per ogni anello) ── */}
        {[R.FAST, R.SLOW, R.AST, R.POINT].map((r_orb, i) => (
          <circle key={i} cx={CX} cy={CY} r={r_orb} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            strokeDasharray={i === 0 ? '3 6' : i === 1 ? '2 8' : '1 10'}
          />
        ))}

        {/* Label anelli orbita */}
        {[
          { r: R.FAST,  label: 'Pianeti Veloci' },
          { r: R.SLOW,  label: 'Pianeti Lenti'  },
          { r: R.AST,   label: 'Asteroidi'       },
          { r: R.POINT, label: 'Punti Speciali'  },
        ].map(({ r: r_l, label }) => {
          const pos = toXY(r_l, 270) // Posiziona label in cima (270° = top)
          return (
            <text key={label} x={pos.x} y={pos.y - 6}
              textAnchor="middle" fontSize="9"
              fill="rgba(255,255,255,0.2)"
              style={{ fontFamily: 'sans-serif', pointerEvents: 'none', userSelect: 'none' }}
            >
              {label}
            </text>
          )
        })}

        {/* ── Separatori dei 12 segni (linee dal CONST_IN al FAST) ── */}
        {Array.from({ length: 12 }, (_, i) => {
          const lon = i * 30
          const p1  = toXY(R.CONST_IN, lon)
          const p2  = toXY(R.INNER, lon)
          return (
            <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke="rgba(212,160,23,0.12)" strokeWidth="1" />
          )
        })}

        {/* ── Pianeti & Corpi Celesti ── */}
        {planets.map(planet => {
          const info     = BODY_INFO[planet.nome]
          if (!info) return null
          const r_orb    = RING_R[planet.categoria] ?? R.FAST
          const pos      = toXY(r_orb, planet.lon_assoluta)
          const isHov    = hovered === planet.nome
          const dotR     = planet.categoria === 'veloce' ? 9 : planet.categoria === 'lento' ? 7 : 5
          const labelFSz = planet.categoria === 'veloce' ? 24 : planet.categoria === 'lento' ? 20 : 16

          return (
            <g key={planet.nome}
              onMouseEnter={() => setHovered(planet.nome)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Raggio verso il centro al hover */}
              {isHov && (
                <line x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                  stroke={info.color} strokeOpacity="0.2" strokeWidth="1" />
              )}

              {/* Cerchio alone al hover */}
              {isHov && (
                <circle cx={pos.x} cy={pos.y} r={dotR * 2.5}
                  fill={info.color} fillOpacity="0.15"
                  filter="url(#zw-glow)" />
              )}

              {/* Punto base */}
              <circle cx={pos.x} cy={pos.y} r={dotR}
                fill={isHov ? info.color : info.color}
                fillOpacity={isHov ? 1 : 0.75}
                filter="url(#zw-glow-sm)"
              />

              {/* Glifo */}
              <text
                x={pos.x + dotR + 3} y={pos.y - dotR - 1}
                fontSize={labelFSz}
                fill={info.color}
                fillOpacity={isHov ? 1 : 0.8}
                style={{ fontFamily: 'serif', pointerEvents: 'none', userSelect: 'none' }}
                filter={isHov ? 'url(#zw-glow)' : undefined}
              >
                {info.glyph}
              </text>

              {/* Tooltip al hover */}
              {isHov && (() => {
                const label   = `${planet.nome}  •  ${planet.segno} ${planet.gradi.toFixed(1)}°`
                const lw      = label.length * 6.8
                const tx      = Math.max(lw / 2 + 10, Math.min(990 - lw / 2, pos.x))
                const ty      = pos.y < CY ? pos.y - 28 : pos.y + 28
                return (
                  <g>
                    <rect x={tx - lw / 2 - 8} y={ty - 11} width={lw + 16} height={22}
                      rx="6" fill="rgba(8,4,20,0.92)"
                      stroke={info.color} strokeOpacity="0.6" strokeWidth="1" />
                    <text x={tx} y={ty + 1}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize="13" fill="white"
                      style={{ fontFamily: 'sans-serif', pointerEvents: 'none', userSelect: 'none', fontWeight: 500 }}
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
          const pAsc = toXY(R.SIGN_OUT + 12, ascLon)
          const pDsc = toXY(R.SIGN_OUT + 12, (ascLon + 180) % 360)
          const pAscI = toXY(R.INNER, ascLon)
          const pDscI = toXY(R.INNER, (ascLon + 180) % 360)
          return (
            <g>
              <line x1={pAscI.x} y1={pAscI.y} x2={pAsc.x} y2={pAsc.y}
                stroke="#D4A017" strokeWidth="2.5" strokeLinecap="round"
                filter="url(#zw-glow-sm)" />
              <line x1={pDscI.x} y1={pDscI.y} x2={pDsc.x} y2={pDsc.y}
                stroke="#D4A017" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx={pAsc.x} cy={pAsc.y} r="6" fill="#D4A017" filter="url(#zw-glow)" />
              <text x={pAsc.x} y={pAsc.y - 14}
                textAnchor="middle" fontSize="14" fill="#D4A017" fontWeight="bold"
                style={{ fontFamily: 'serif', pointerEvents: 'none', userSelect: 'none' }}
              >ASC</text>
            </g>
          )
        })()}

        {/* ── Hub Centrale ── */}
        <circle cx={CX} cy={CY} r={R.INNER} fill="rgba(5,3,15,0.95)"
          stroke="rgba(212,160,23,0.5)" strokeWidth="1.5" />
        {/* Croce centrale sottile */}
        <line x1={CX - R.INNER * 0.6} y1={CY} x2={CX + R.INNER * 0.6} y2={CY}
          stroke="rgba(212,160,23,0.2)" strokeWidth="0.8" />
        <line x1={CX} y1={CY - R.INNER * 0.6} x2={CX} y2={CY + R.INNER * 0.6}
          stroke="rgba(212,160,23,0.2)" strokeWidth="0.8" />
      </svg>

      {/* ── Centro HTML (non distorto dalla SVG) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-2">
          {ascSign ? (
            <>
              <p className="text-[8px] uppercase tracking-[0.2em] text-gold-500/60 mb-0.5">Ascendente</p>
              <p className="font-serif text-white leading-none font-bold" style={{ fontSize: 'clamp(14px, 3vw, 22px)' }}>
                {ascSign}
              </p>
              {ascDeg !== undefined && (
                <p className="text-white/40 text-[9px] mt-0.5">{ascDeg.toFixed(1)}°</p>
              )}
            </>
          ) : (
            <p className="text-gold-500/50 text-[9px] uppercase tracking-widest">Cielo<br/>Attuale</p>
          )}
        </div>
      </div>
    </div>
  )
}

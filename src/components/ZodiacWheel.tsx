import { motion } from 'framer-motion'
import { NatalChartResponse } from '../api/astrology'

const ZODIAC_SIGNS = [
  { name: 'Ariete', symbol: '♈' },
  { name: 'Toro', symbol: '♉' },
  { name: 'Gemelli', symbol: '♊' },
  { name: 'Cancro', symbol: '♋' },
  { name: 'Leone', symbol: '♌' },
  { name: 'Vergine', symbol: '♍' },
  { name: 'Bilancia', symbol: '♎' },
  { name: 'Scorpione', symbol: '♏' },
  { name: 'Sagittario', symbol: '♐' },
  { name: 'Capricorno', symbol: '♑' },
  { name: 'Acquario', symbol: '♒' },
  { name: 'Pesci', symbol: '♓' }
]

const PLANET_SYMBOLS: Record<string, string> = {
  'Sole': '☉',
  'Luna': '☽',
  'Mercurio': '☿',
  'Venere': '♀',
  'Marte': '♂',
  'Giove': '♃',
  'Saturno': '♄',
  'Urano': '♅',
  'Nettuno': '♆',
  'Plutone': '♇'
}

interface ZodiacWheelProps {
  chart: NatalChartResponse
}

export default function ZodiacWheel({ chart }: ZodiacWheelProps) {
  const size = 400
  const center = size / 2
  const innerRadius = 90
  const planetRadius = 135
  const outerRadius = 180

  // Funzione per trigonometria polare -> cartesiana
  // 0° lo consideriamo convenzionalmente "a destra" (angolo zero std) e ruoteremo tutto in CSS.
  const getCoordinates = (radius: number, degree: number) => {
    // I gradi vanno in senso antiorario nell'astrologia standard (lo zodiaco gira in senso antiorario).
    // In SVG l'asse Y scende verso il basso, quindi neghiamo l'angolo.
    const rad = (degree * Math.PI) / 180
    return {
      x: center + radius * Math.cos(rad),
      y: center - radius * Math.sin(rad)
    }
  }

  // Ruotiamo l'intera SVG in modo che l'Ascendente assoluto sia esattamente allineato a sinistra (180° visuale)
  // Se Asc è 0 (Ariete), deve essere ruotato a 180. => delta = 180 - Asc.
  const wheelRotation = 180 - chart.ascendente_totale

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto flex items-center justify-center">
      {/* Glow Sfondo */}
      <div className="absolute inset-0 bg-gold-500/10 blur-[60px] rounded-full pointer-events-none" />

      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full drop-shadow-2xl overflow-visible"
        initial={{ opacity: 0, rotate: wheelRotation - 45 }}
        animate={{ opacity: 1, rotate: wheelRotation }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <defs>
          <radialGradient id="wheel-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="rgba(20, 20, 24, 1)" />
            <stop offset="90%" stopColor="rgba(30, 30, 35, 1)" />
            <stop offset="100%" stopColor="rgba(212, 160, 23, 0.2)" />
          </radialGradient>
        </defs>

        {/* Disco Base */}
        <circle cx={center} cy={center} r={outerRadius} fill="url(#wheel-gradient)" 
                stroke="rgba(212, 160, 23, 0.4)" strokeWidth="1" />
        <circle cx={center} cy={center} r={planetRadius + 15} fill="none" 
                stroke="rgba(212, 160, 23, 0.15)" strokeWidth="1" />
        <circle cx={center} cy={center} r={innerRadius} fill="rgba(0,0,0,0.4)" 
                stroke="rgba(212, 160, 23, 0.3)" strokeWidth="1" />

        {/* I Settori (Segni Zodiacali) - Disegnati da 0 a 360 ogni 30° */}
        {ZODIAC_SIGNS.map((sign, index) => {
          const startDegree = index * 30
          const textDegree = startDegree + 15 // centro del segno
          
          // Linea separatrice dei segni
          const linePos = getCoordinates(outerRadius, startDegree)
          const lineInner = getCoordinates(planetRadius + 15, startDegree)
          
          // Posizione dell'icona
          const iconPos = getCoordinates(outerRadius - 22, textDegree)

          // Poiché giriamo la ruota interattivamente in CSS, le label testuali/simboli 
          // appariranno dritte se applico un contro-twist al text, o semplicemente le lascio ruotare assieme alla ruota.
          // Le teniamo ruotate assieme alla ruota in stile "rosone". (Ruotiamo la lettera per farla puntare al centro).
          // Angolo di base: -textDegree + 90 (per orientarle con il fondo verso il centro).
          const iconRotation = -textDegree + 90

          return (
            <g key={sign.name}>
              <line 
                x1={lineInner.x} y1={lineInner.y} 
                x2={linePos.x} y2={linePos.y} 
                stroke="rgba(212, 160, 23, 0.2)" strokeWidth="1" 
              />
              <text
                x={iconPos.x}
                y={iconPos.y}
                fill="rgba(255, 255, 255, 0.4)"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${iconRotation}, ${iconPos.x}, ${iconPos.y})`}
                className="select-none pointer-events-none font-serif"
              >
                {sign.symbol}
              </text>
            </g>
          )
        })}

        {/* Le Pianeti */}
        {chart.pianeti?.map((planet) => {
          if (!planet.lon_assoluta) return null
          
          // I pianeti li mettiamo nel raggio "planetRadius"
          const p = getCoordinates(planetRadius - 15, planet.lon_assoluta)

          // Per evitare che i testi siano ruotati e illeggibili a causa della rotazione globale CSS,
          // diamo al glifo del pianeta una rotazione fissa OPPOSTA alla ruota.
          const antiRotation = -wheelRotation

          return (
            <g key={planet.nome} className="group cursor-pointer transition-transform hover:scale-110" transform={`translate(${p.x}, ${p.y})`}>
              {/* Linea verso il centro */}
              <line x1="0" y1="0" x2={center - p.x} y2={center - p.y} stroke="rgba(212, 160, 23, 0.1)" strokeWidth="0.5" />
              
              {/* Cerchietto Glow */}
              <circle cx="0" cy="0" r="10" fill="rgba(212, 160, 23, 0.1)" className="group-hover:fill-gold-500/30" />
              <circle cx="0" cy="0" r="4" fill="#D4A017" />
              
              <text
                x="0"
                y="-14"
                fill="#fff"
                fontSize="12"
                textAnchor="middle"
                transform={`rotate(${antiRotation}, 0, 0)`}
                className="opacity-0 group-hover:opacity-100 transition-opacity font-serif drop-shadow-lg pointer-events-none"
              >
                {planet.nome} ({planet.gradi}°)
              </text>

              {/* Simbolo Pianeta Base */}
              <text
                x="12"
                y="12"
                fill="rgba(212, 160, 23, 0.8)"
                fontSize="14"
                textAnchor="middle"
                transform={`rotate(${antiRotation}, 12, 12)`}
                className="group-hover:fill-gold-400 drop-shadow-md select-none"
              >
                {PLANET_SYMBOLS[planet.nome] || ''}
              </text>
            </g>
          )
        })}

        {/* L'Orizzonte (Ascendente, che matematicamente dopo la rotazione globale della SVG pointerà esattamente a Sinistra / 180° Visuali) */}
        {/* Disegniamo la linea di orizzonte esattamente sull'angolo dell'Ascendente assoluto. */}
        {(() => {
          const asc = getCoordinates(outerRadius, chart.ascendente_totale)
          const dsc = getCoordinates(outerRadius, (chart.ascendente_totale + 180) % 360)
          
          return (
            <g>
              {/* Orizzonte Passante per il centro (Asse AC-DC) */}
              <line x1={asc.x} y1={asc.y} x2={dsc.x} y2={dsc.y} stroke="rgba(212, 160, 23, 0.7)" strokeWidth="1.5" strokeDasharray="4 4" />
              
              {/* Punta Ascendente (Freccia Direzionale sulla circonferenza interna) */}
              <circle cx={asc.x} cy={asc.y} r="3" fill="#D4A017" />
            </g>
          )
        })()}

      </motion.svg>
      
      {/* Contenuto Fisso Centrale (Non Replicabile nel Layer Ruotante, quindi sta fuori overposto) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-gold-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-semibold">T. Natale</p>
          <p className="text-white font-serif text-3xl mb-0 leading-none">{chart.segno}</p>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mt-1">{chart.grado_nel_segno.toFixed(1)}° ASC</p>
        </div>
      </div>
    </div>
  )
}

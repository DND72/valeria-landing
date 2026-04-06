import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ZodiacWheel from '../components/ZodiacWheel'
import AspectGrid from '../components/AspectGrid'
import { type PlanetData } from '../utils/astrologyUtils'
import { useCircadianTheme } from '../hooks/useCircadianTheme'
import { useSunTimes } from '../hooks/useSunTimes'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const BODY_INFO: Record<string, { glyph: string; color: string }> = {
  'Sole':                { glyph: '☉', color: '#FFD700' },
  'Luna':                { glyph: '☽', color: '#C8E0FF' },
  'Mercurio':            { glyph: '☿', color: '#CCCCCC' },
  'Venere':              { glyph: '♀', color: '#FFB3C6' },
  'Marte':               { glyph: '♂', color: '#FF6060' },
  'Giove':               { glyph: '♃', color: '#FFA050' },
  'Saturno':             { glyph: '♄', color: '#C8B89A' },
  'Urano':               { glyph: '♅', color: '#70D0D0' },
  'Nettuno':             { glyph: '♆', color: '#8080F0' },
  'Plutone':             { glyph: '♇', color: '#B090C0' },
  'Chirone':             { glyph: '⚷', color: '#D08060' },
  'Cerere':              { glyph: '⚳', color: '#80C080' },
  'Pallade':             { glyph: '⚴', color: '#A090D0' },
  'Giunone':             { glyph: '⚵', color: '#E0A080' },
  'Vesta':               { glyph: '⚶', color: '#D0C060' },
  'Nodo Nord':           { glyph: '☊', color: '#FFD700' },
  'Nodo Sud':            { glyph: '☋', color: '#C0A030' },
  'Lilith':              { glyph: '⚸', color: '#C060A0' },
  'Vertex':              { glyph: 'Vx', color: '#70D0C0' },
  'Parte della Fortuna': { glyph: '⊗', color: '#FFE080' },
}

const CATEGORIES = [
  { key: 'veloce',    label: 'Pianeti Veloci' },
  { key: 'lento',     label: 'Pianeti Lenti'  },
  { key: 'asteroide', label: 'Asteroidi'       },
  { key: 'punto',     label: 'Punti Speciali'  },
]

const ASPECT_LEGEND = [
  { label: 'Trigono (120°)',    color: '#3B82F6', desc: 'Armonia Suprema',    dash: false },
  { label: 'Sestile (60°)',     color: '#4ADE80', desc: 'Opportunità',         dash: true  },
  { label: 'Quadrato (90°)',    color: '#F87171', desc: 'Tensione Evolutiva',  dash: false },
  { label: 'Opposizione (180°)',color: '#A855F7', desc: 'Polarità/Confronto', dash: false },
  { label: 'Congiunzione (0°)', color: '#FFFFFF', desc: 'Unione di Forze',    dash: false },
]

interface Eclipse {
  tipo: 'Solare' | 'Lunare'
  sottotipo: string
  emoji: string
  data: string
  visibilità: string
  gmt_inizio: string
  gmt_fine: string
  durata: string
}

interface MoonData {
  fase: string
  icona: string
  illuminazione: number
  angolo: number
  segno: string
  elemento: string
}

interface MonthlyPhase {
  fase: string
  icona: string
  data_full: string
  ora_gmt: string
  segno: string
  elemento: string
  is_passata?: boolean
}

interface SkyData {
  timestamp: string
  pianeti: PlanetData[]
  eclissi?: Eclipse[]
  luna?: MoonData
  fasi_mensili?: MonthlyPhase[]
}

// ── Circadian Indicator Badge ────────────────────────────────────────────────
function CircadianBadge({ label, emoji, color }: { label: string; emoji: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold border"
      style={{
        background: `${color}18`,
        borderColor: `${color}40`,
        color,
      }}
    >
      <span className="text-base leading-none">{emoji}</span>
      {label}
    </motion.div>
  )
}

export default function CurrentSkyPage() {
  const [sky, setSky]         = useState<SkyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [now, setNow]         = useState(new Date())
  const [activeTab, setActiveTab] = useState('veloce')

  // ── Circadian Theme ────────────────────────────────────────────────────────
  const theme    = useCircadianTheme()
  const sunTimes = useSunTimes()

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fetchSky = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/api/astrology/current-sky`)
        if (!res.ok) throw new Error('Errore di connessione al motore astronomico')
        setSky(await res.json())
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSky()
    const iv = setInterval(fetchSky, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const filteredPlanets = sky?.pianeti.filter((p: PlanetData) => p.categoria === activeTab) ?? []

  // planet glow shadow intensity tied to circadian period
  const glowAlpha = theme.glowIntensity

  return (
    <div className="min-h-screen relative overflow-x-hidden">

      {/* ── Circadian Background layers (stacking: -30 → -20 → -15 → -10) ── */}

      {/* Layer 1: Base colour */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -30,
          backgroundColor: theme.bgBase,
          transition: 'background-color 4s ease-in-out',
        }}
      />
      {/* Layer 2: Main hemisphere aurora */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -25,
          background: theme.bgGradient,
          transition: 'background 4s ease-in-out',
        }}
      />
      {/* Layer 3: Top accent glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -20,
          background: theme.topGlow,
          transition: 'background 4s ease-in-out',
        }}
      />
      {/* Layer 4: Bottom ambient blob */}
      <div
        className="fixed pointer-events-none blur-[120px] rounded-full"
        style={{
          zIndex: -20,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: theme.bottomGlowColor,
          transition: 'background 4s ease-in-out',
        }}
      />
      {/* Layer 5: Star-field — dimmer di giorno, brillante di notte */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -15,
          opacity: 0.15 + glowAlpha * 0.50,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          mask: 'radial-gradient(ellipse 110% 110% at 50% 50%, black 20%, transparent 100%)',
          transition: 'opacity 4s ease-in-out',
        }}
      />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6"
        >
          <div className="text-center md:text-left space-y-3">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <p
                className="text-[10px] sm:text-xs font-semibold tracking-[0.35em] uppercase"
                style={{ color: theme.headerAccent, transition: 'color 4s ease-in-out' }}
              >
                Planetarium Real-Time
              </p>
              <CircadianBadge label={theme.label} emoji={theme.emoji} color={theme.headerAccent} />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white tracking-tight">
              Il Cielo di <span className="gold-text italic">Adesso</span>
            </h1>
          </div>

          {/* Clock Widget */}
          <div
            className="border border-white/10 rounded-2xl px-8 py-4 backdrop-blur-md text-center min-w-[240px]"
            style={{
              background: theme.clockBg,
              transition: 'background 4s ease-in-out',
            }}
          >
            <div className="font-mono text-4xl text-white tracking-[0.2em]" style={{ textShadow: 'none' }}>{timeStr}</div>
            <div className="text-white/40 text-xs sm:text-sm capitalize mt-1 tracking-widest" style={{ textShadow: 'none' }}>{dateStr}</div>

            {/* Sunrise / Sunset */}
            {sunTimes && (
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">🌅</span>
                  <span className="font-mono text-sm text-white/80" style={{ textShadow: 'none' }}>{sunTimes.sunrise}</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">🌇</span>
                  <span className="font-mono text-sm text-white/80" style={{ textShadow: 'none' }}>{sunTimes.sunset}</span>
                </div>
                {/* Indicatore sorgente posizione */}
                <div
                  className="ml-1 w-1.5 h-1.5 rounded-full"
                  title={sunTimes.usingGeolocation ? 'Posizione rilevata automaticamente' : 'Posizione di default: Roma'}
                  style={{
                    background: sunTimes.usingGeolocation ? '#4ade80' : 'rgba(255,255,255,0.25)',
                    boxShadow: sunTimes.usingGeolocation ? '0 0 6px #4ade80' : 'none',
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Loading ─────────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center py-40 gap-4">
            <div
              className="w-16 h-16 border-2 border-t-current rounded-full animate-spin"
              style={{ borderColor: `${theme.headerAccent}33`, borderTopColor: theme.headerAccent }}
            />
            <p className="text-white/30 text-sm tracking-widest font-light">Sintonizzazione corpi celesti...</p>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="flex flex-col items-center py-40 gap-4">
            <p className="text-red-400 text-sm tracking-widest">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-gold px-6 py-2 text-xs">Riprova</button>
          </div>
        )}

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        {sky && !loading && (
          <div className="grid xl:grid-cols-[1fr_400px] gap-12 items-start">

            {/* ── Colonna Ruota & Legenda ── */}
            <div className="flex flex-col items-center space-y-12">

              {/* Zodiac Wheel — glow wrapper */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="w-full max-w-[860px] relative"
              >
                {/* Dynamic outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none blur-[60px]"
                  style={{
                    background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${theme.headerAccent}${Math.round(glowAlpha * 60).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                    transition: 'background 4s ease-in-out',
                  }}
                />
                <ZodiacWheel planets={sky.pianeti} />
              </motion.div>

              {/* Aspect Legend */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-3xl p-8 backdrop-blur-sm w-full max-w-[800px] border"
                style={{
                  background: theme.cardGradient,
                  borderColor: theme.cardBorder,
                  transition: 'background 4s ease-in-out, border-color 4s ease-in-out',
                }}
              >
                <h3 className="text-white/40 text-[10px] uppercase tracking-[0.3em] mb-6 text-center">Legenda Aspetti Planetari</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {ASPECT_LEGEND.map(asp => (
                    <div key={asp.label} className="flex flex-col items-center text-center">
                      <div className="h-0.5 w-12 mb-3 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                        style={{ background: asp.color, borderStyle: asp.dash ? 'dashed' : 'solid', borderTopWidth: asp.dash ? '2px' : '0' }} />
                      <span className="text-white/80 text-[11px] font-medium mb-1">{asp.label}</span>
                      <span className="text-white/30 text-[9px] font-light leading-none">{asp.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Eclipses Panel */}
              {sky.eclissi && sky.eclissi.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-3xl overflow-hidden backdrop-blur-md w-full max-w-[800px] border"
                  style={{
                    background: theme.cardGradient,
                    borderColor: theme.cardBorder,
                    transition: 'background 4s ease-in-out, border-color 4s ease-in-out',
                  }}
                >
                  <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <h4 className="text-white/50 text-[10px] uppercase tracking-[0.25em] font-medium text-center">
                      🌒 Prossimi Eventi Celestiali
                    </h4>
                  </div>
                  <div className="divide-y divide-white/5 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {sky.eclissi.map((e, i) => (
                      <div key={i} className="flex items-center gap-6 px-8 py-5 hover:bg-white/[0.04] transition-colors group">
                        <span className="text-3xl flex-shrink-0 transition-transform group-hover:scale-110">{e.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-base font-semibold flex items-center gap-3">
                            {e.tipo} {e.sottotipo}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-normal ${e.tipo === 'Solare' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-400'}`}>
                              {e.data}
                            </span>
                          </p>
                          <p className="text-white/40 text-xs mt-1.5 italic group-hover:text-white/60 transition-colors">
                            📍 {e.visibilità}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 border-l border-white/5 pl-6 min-w-[100px]">
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[9px] uppercase tracking-tighter text-white/20">GMT Start</p>
                              <p className="text-xs font-mono text-white/70">{e.gmt_inizio || '--:--'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] uppercase tracking-tighter text-white/20">GMT End</p>
                              <p className="text-xs font-mono text-white/70">{e.gmt_fine || '--:--'}</p>
                            </div>
                          </div>
                          <div className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-gold-500/60 flex items-center gap-1.5">
                            <span className="text-[8px] opacity-50">⏱</span> {e.durata || '--'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >

              {/* Moon Widget */}
              <div
                className="rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group shadow-2xl border"
                style={{
                  background: theme.cardGradient,
                  borderColor: theme.cardBorder,
                  transition: 'background 4s ease-in-out, border-color 4s ease-in-out',
                }}
              >
                {sky.luna ? (
                  <>
                    <div
                      className="absolute -top-10 -right-10 w-32 h-32 blur-3xl rounded-full"
                      style={{
                        background: `${theme.headerAccent}${Math.round(glowAlpha * 40).toString(16).padStart(2, '0')}`,
                        transition: 'background 4s ease-in-out',
                      }}
                    />
                    <div className="flex items-center gap-6 relative z-10">
                      <span
                        className="text-5xl select-none"
                        style={{
                          filter: `drop-shadow(0 0 ${8 + glowAlpha * 14}px rgba(255,255,255,${0.2 + glowAlpha * 0.3}))`,
                          transition: 'filter 4s ease-in-out',
                        }}
                      >
                        {sky.luna.icona}
                      </span>
                      <div className="flex-1">
                        <p className="text-white/40 text-[11px] uppercase tracking-[0.3em] font-medium mb-2">Fase Lunare Corrente</p>
                        <h3 className="text-white text-2xl font-serif font-bold tracking-wide flex items-center gap-3">
                          {sky.luna.fase}
                          <span className="text-sm font-normal text-white/30 tracking-normal">
                            in {sky.luna.segno} • {Math.floor(sky.luna.angolo / 30 * 30 % 30)}°
                          </span>
                        </h3>
                        <div className="flex items-center gap-3 mt-2 mb-4">
                          <span className={`text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${
                            sky.luna.elemento === 'Fuoco' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                            sky.luna.elemento === 'Terra' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                            sky.luna.elemento === 'Aria'  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400' :
                            sky.luna.elemento === 'Acqua' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : ''
                          }`}>
                            {sky.luna.elemento}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${sky.luna.illuminazione}%` }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-white/60"
                            />
                          </div>
                          <span className="text-white/60 text-xs font-mono whitespace-nowrap">{sky.luna.illuminazione}% illum.</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-white/5 rounded-full" />
                    <div>
                      <p className="text-white/20 text-[10px] uppercase tracking-widest">Sincronizzazione Luna...</p>
                      <div className="h-4 w-32 bg-white/5 rounded mt-2" />
                    </div>
                  </div>
                )}
              </div>

              {/* Lunar Phase Calendar */}
              {sky.fasi_mensili && sky.fasi_mensili.length > 0 && (
                <div
                  className="rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl border"
                  style={{
                    background: 'rgba(0,0,0,0.50)',
                    borderColor: theme.cardBorder,
                    transition: 'border-color 4s ease-in-out',
                  }}
                >
                  <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                    <h4 className="text-white/50 text-[11px] uppercase tracking-[0.25em] font-medium text-center">
                      📅 Prossime Fasi Lunari
                    </h4>
                  </div>
                  <div className="divide-y divide-white/5">
                    {sky.fasi_mensili.map((ph, i) => (
                      <div
                        key={i}
                        className={`px-6 py-4 hover:bg-white/[0.03] transition-all group flex items-center justify-between gap-4 ${ph.is_passata ? 'opacity-40 grayscale-[0.5]' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl group-hover:scale-110 transition-transform inline-block relative">
                            {ph.icona}
                            {ph.is_passata && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-white/20 text-white px-1 rounded uppercase font-bold tracking-tighter">OK</span>
                            )}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white/90 text-sm font-semibold leading-tight">{ph.fase}</p>
                              {ph.is_passata && <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Recente</span>}
                            </div>
                            <p className="font-mono text-white/30 text-[10px] mt-1 uppercase tracking-wider">{ph.data_full} • {ph.ora_gmt} GMT</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white/40 text-[10px] italic mb-1">{ph.segno}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-widest border ${
                            ph.elemento === 'Fuoco' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                            ph.elemento === 'Terra' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                            ph.elemento === 'Aria'  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400' :
                            'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          }`}>{ph.elemento}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Tabs */}
              <div
                className="flex rounded-2xl p-1.5 border border-white/10"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {CATEGORIES.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setActiveTab(c.key)}
                    className="flex-1 py-2 text-[11px] uppercase tracking-widest rounded-xl transition-all"
                    style={activeTab === c.key ? {
                      background: `${theme.headerAccent}25`,
                      color: theme.headerAccent,
                      border: `1px solid ${theme.headerAccent}50`,
                      boxShadow: `0 0 16px ${theme.headerAccent}20`,
                      transition: 'all 4s ease-in-out',
                    } : { color: 'rgba(255,255,255,0.40)' }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Planet List */}
              <div
                className="rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl border"
                style={{
                  background: 'rgba(0,0,0,0.60)',
                  borderColor: theme.cardBorder,
                  transition: 'border-color 4s ease-in-out',
                }}
              >
                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {filteredPlanets.map((p: PlanetData) => {
                    const info = BODY_INFO[p.nome]
                    return (
                      <div key={p.nome} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                        <span
                          className="text-3xl w-10 text-center"
                          style={{
                            color: info?.color || '#fff',
                            filter: `drop-shadow(0 0 ${4 + glowAlpha * 10}px ${info?.color || '#fff'}${Math.round(glowAlpha * 200).toString(16).padStart(2, '0')})`,
                            transition: 'filter 4s ease-in-out',
                          }}
                        >
                          {info?.glyph || '●'}
                        </span>
                        <div className="flex-1">
                          <p className="text-white/90 text-sm font-semibold">{p.nome}</p>
                          <p className="text-white/40 text-[11px] uppercase tracking-widest mt-0.5">Eclittica Geocentrica</p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-white text-lg leading-none">{p.segno}</p>
                          <p className="text-gold-500/50 text-[11px] font-mono mt-1">{p.gradi.toFixed(2)}°</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Aspect Grid */}
              <div
                className="rounded-3xl p-6 backdrop-blur-md border"
                style={{
                  background: theme.cardGradient,
                  borderColor: theme.cardBorder,
                  transition: 'background 4s ease-in-out, border-color 4s ease-in-out',
                }}
              >
                <h4 className="text-white/40 text-[10px] uppercase tracking-[0.25em] mb-6 font-medium">Relazioni Planetarie (Griglia)</h4>
                <AspectGrid planets={sky.pianeti} />
              </div>

              {/* Quote */}
              <div
                className="rounded-3xl p-6 leading-relaxed border"
                style={{
                  background: theme.cardGradient,
                  borderColor: theme.cardBorder,
                  transition: 'background 4s ease-in-out, border-color 4s ease-in-out',
                }}
              >
                <p className="text-white/30 text-xs italic">
                  "Le posizioni planetarie riflettono le energie cosmiche collettive in questo istante. Ogni aspetto nella griglia e nella ruota indica una tensione o un'armonia speciale tra due archetipi."
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <Link
                  to="/tema-natale"
                  className="py-4 text-center uppercase tracking-[0.2em] text-xs font-bold rounded-2xl shadow-xl transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${theme.headerAccent}CC, ${theme.headerAccent})`,
                    color: '#0A0510',
                    boxShadow: `0 0 30px ${theme.headerAccent}33`,
                    transition: 'background 4s ease-in-out, box-shadow 4s ease-in-out',
                    textShadow: 'none',
                  }}
                >
                  Scopri il Tuo Cielo Natale →
                </Link>
                <Link
                  to="/i-miei-temi"
                  className="border border-white/10 text-white/50 hover:text-white transition-colors py-4 text-center text-xs uppercase tracking-[0.2em] rounded-2xl backdrop-blur-md"
                  style={{ textShadow: 'none' }}
                >
                  Tema Natale Avanzato
                </Link>
              </div>

            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

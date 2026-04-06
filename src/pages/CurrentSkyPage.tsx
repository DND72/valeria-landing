import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import ZodiacWheel, { PlanetData } from '../components/ZodiacWheel'

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

interface SkyData {
  timestamp: string
  pianeti: PlanetData[]
}

export default function CurrentSkyPage() {
  const [sky, setSky] = useState<SkyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [now, setNow]       = useState(new Date())
  const [activeTab, setActiveTab] = useState('veloce')

  // Orologio live al secondo
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Fetch effemeridi ogni 5 minuti
  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/api/astrology/current-sky`)
        if (!res.ok) throw new Error('Errore nel recupero dei dati astrologici')
        setSky(await res.json())
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetch_()
    const iv = setInterval(fetch_, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const filteredPlanets = sky?.pianeti.filter(p => p.categoria === activeTab) ?? []

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* ── Sfondo Galattico ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 5%, rgba(22,8,55,0.98) 0%, rgba(6,3,16,1) 60%)' }} />
        {/* Stelle CSS puntiformi */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 80px 10px, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 140px 70px, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 200px 40px, rgba(255,255,255,0.2), transparent)',
          backgroundSize: '250px 120px',
        }} />
        {/* Nebule */}
        <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] bg-purple-900/12 blur-[180px] rounded-full" />
        <div className="absolute top-40 right-1/5  w-[500px] h-[500px] bg-indigo-950/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-blue-950/12  blur-[160px] rounded-full" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-20">

        {/* ── Header compatto ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-gold-500 text-[10px] font-semibold tracking-[0.28em] uppercase mb-1">
              Swiss Ephemeris Engine · Planetario in Tempo Reale
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-white">
              Il Cielo di <span className="gold-text italic">Adesso</span>
            </h1>
          </div>

          {/* Orologio */}
          <div className="text-right">
            <div className="font-mono text-3xl md:text-4xl text-white tracking-widest">{timeStr}</div>
            <div className="text-white/35 text-xs capitalize mt-0.5">{dateStr}</div>
          </div>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-40">
            <div className="w-16 h-16 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
            <p className="text-white/30 text-sm tracking-widest">Calcolo effemeridi in corso...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="text-center py-40">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-gold px-6 py-2 text-sm">Riprova</button>
          </div>
        )}

        {/* ── Layout Planetario ── */}
        {sky && !loading && (
          <div className="grid xl:grid-cols-[1fr_340px] gap-8 items-start">

            {/* ── RUOTA GRANDE ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <ZodiacWheel
                planets={sky.pianeti}
                className="w-full max-w-[760px]"
              />
              <p className="mt-4 text-white/20 text-[10px] tracking-[0.25em] uppercase text-center">
                Posizioni aggiornate ogni 5 min · {sky.timestamp.replace('T', ' ').replace(':00Z', ' UTC')}
              </p>
            </motion.div>

            {/* ── PANNELLO DATI ── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="space-y-4 xl:sticky xl:top-24"
            >
              {/* Tab categories */}
              <div className="flex gap-1 bg-black/40 rounded-xl p-1 border border-white/8">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveTab(cat.key)}
                    className={`flex-1 text-[10px] uppercase tracking-wider py-1.5 rounded-lg transition-all ${
                      activeTab === cat.key
                        ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Lista pianeti filtrata */}
              <div className="bg-black/50 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {filteredPlanets.length === 0 ? (
                      <p className="text-white/30 text-sm text-center py-8">Nessun dato disponibile</p>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {filteredPlanets.map(p => {
                          const info = BODY_INFO[p.nome]
                          return (
                            <div key={p.nome} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.025] transition-colors">
                              <span className="text-2xl w-8 text-center flex-shrink-0"
                                style={{ color: info?.color || '#fff' }}>
                                {info?.glyph || '●'}
                              </span>
                              <span className="flex-1 text-white/80 text-sm font-medium">{p.nome}</span>
                              <div className="text-right flex-shrink-0">
                                <span className="font-serif text-white text-sm">{p.segno}</span>
                                <span className="text-white/40 text-xs ml-2">{p.gradi.toFixed(1)}°</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Glossario */}
              <div className="bg-black/25 border border-white/5 rounded-2xl p-5 text-sm text-white/40 leading-relaxed">
                <p className="text-gold-400/70 text-[10px] uppercase tracking-widest mb-2">✦ Nota</p>
                {activeTab === 'veloce' && 'I pianeti veloci cambiano segno frequentemente: la Luna ogni 2-3 giorni, il Sole ogni 30 giorni.'}
                {activeTab === 'lento'  && 'Giove impiega 12 anni, Saturno 29, Urano 84, Nettuno 165 e Plutone fino a 248 anni per completare lo Zodiaco.'}
                {activeTab === 'asteroide' && 'I quattro asteroidi principali (Cerere, Pallade, Giunone, Vesta) e Chirone portano energie più sottili e specifiche nella carta natale.'}
                {activeTab === 'punto' && 'I Nodi Lunari, Lilith, il Vertex e la Parte della Fortuna sono punti matematici simbolici fondamentali nell'astrologia evolutiva e karmica.'}
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 rounded-2xl p-6 text-center">
                <p className="font-serif text-lg text-white mb-2">
                  Il Cielo al momento della <em>tua</em> nascita
                </p>
                <p className="text-white/40 text-xs mb-5 leading-relaxed">
                  Scopri dove erano tutti questi corpi celesti nel tuo cielo natale e cosa significano per te.
                </p>
                <div className="flex flex-col gap-2">
                  <Link to="/tema-natale" className="btn-gold text-sm py-2.5 text-center uppercase tracking-wider">
                    Calcola l'Ascendente (Gratis) →
                  </Link>
                  <Link to="/i-miei-temi" className="border border-white/15 text-white/60 hover:text-white transition-colors text-sm py-2.5 rounded-lg text-center">
                    Tema Natale Completo
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

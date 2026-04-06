import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ZodiacWheel, { PlanetData } from '../components/ZodiacWheel'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const PLANET_COLORS: Record<string, string> = {
  'Sole': '#FFD700', 'Luna': '#C0D8F0', 'Mercurio': '#CCC',
  'Venere': '#FFB3C6', 'Marte': '#FF6060', 'Giove': '#FFA050',
  'Saturno': '#C8B89A', 'Urano': '#70D0D0', 'Nettuno': '#8080F0', 'Plutone': '#B090C0'
}
const PLANET_SYMBOLS: Record<string, string> = {
  'Sole': '☉', 'Luna': '☽', 'Mercurio': '☿', 'Venere': '♀',
  'Marte': '♂', 'Giove': '♃', 'Saturno': '♄', 'Urano': '♅',
  'Nettuno': '♆', 'Plutone': '♇'
}

interface SkyData {
  timestamp: string
  pianeti: PlanetData[]
}

export default function CurrentSkyPage() {
  const [sky, setSky] = useState<SkyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())

  // Orologio live
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Fetch posizioni ogni 5 minuti
  useEffect(() => {
    const fetchSky = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/api/astrology/current-sky`)
        if (!res.ok) throw new Error('Errore nel recupero dei dati')
        const data = await res.json()
        setSky(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSky()
    const interval = setInterval(fetchSky, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Sfondo Galattico */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 10%, rgba(25,10,55,0.95) 0%, rgba(6,4,14,1) 65%)' }} />
        {/* Stelle CSS */}
        <div className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: [
              'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
              'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '80px 80px, 40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        />
        {/* Nebule colorate */}
        <div className="absolute top-0 left-1/4  w-[500px] h-[500px] bg-purple-900/15 blur-[150px] rounded-full" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-indigo-900/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-blue-950/15 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-gold-500 text-[10px] font-semibold tracking-[0.3em] uppercase mb-3">
            Swiss Ephemeris Engine · Posizioni in Tempo Reale
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Il Cielo di <span className="gold-text italic">Adesso</span>
          </h1>

          {/* Orologio live */}
          <div className="inline-flex flex-col items-center gap-1 bg-black/40 border border-white/10 rounded-2xl px-8 py-3 mt-2">
            <span className="font-mono text-3xl text-white tracking-widest">{timeStr}</span>
            <span className="text-white/40 text-xs capitalize">{dateStr}</span>
          </div>
        </motion.div>

        {/* Body principale */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="w-12 h-12 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
            <p className="text-white/40 text-sm">Calcolo effemeridi in corso...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-24">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-gold px-6 py-2 text-sm">
              Riprova
            </button>
          </div>
        )}

        {sky && !loading && (
          <div className="grid lg:grid-cols-[1fr,380px] gap-10 items-start">
            {/* ── Colonna Sinistra: Ruota ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <ZodiacWheel
                planets={sky.pianeti}
                size={480}
              />
              <p className="mt-4 text-white/25 text-[10px] tracking-widest uppercase text-center">
                Le posizioni si aggiornano automaticamente ogni 5 minuti
              </p>
            </motion.div>

            {/* ── Colonna Destra: Tabella pianeti + CTA ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="space-y-4"
            >
              {/* Lista pianeti */}
              <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="px-5 py-3 border-b border-white/10">
                  <h2 className="font-serif text-lg text-white">Posizioni Planetarie</h2>
                  <p className="text-white/35 text-xs">Eclittica geocentrica · {sky.timestamp}</p>
                </div>
                <div className="divide-y divide-white/5">
                  {sky.pianeti.map(p => (
                    <div key={p.nome} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.03] transition-colors">
                      <span className="text-xl w-7 text-center flex-shrink-0"
                        style={{ color: PLANET_COLORS[p.nome] || '#fff' }}>
                        {PLANET_SYMBOLS[p.nome] || '●'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-white/80 text-sm font-medium">{p.nome}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-white text-sm font-serif">{p.segno}</span>
                        <span className="text-white/40 text-xs ml-1.5">{p.gradi.toFixed(1)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glossario rapido */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-5 text-sm text-white/50 leading-relaxed">
                <p className="text-gold-400/80 text-xs uppercase tracking-widest mb-2">✦ Lo sapevi?</p>
                Ogni pianeta transita attraverso i 12 segni dello Zodiaco con velocità diverse: la <span className="text-white/70">Luna</span> completa un giro in 28 giorni, il <span className="text-white/70">Sole</span> in 365, mentre <span className="text-white/70">Plutone</span> impiega fino a 248 anni per percorrere l'intero Zodiaco.
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 rounded-2xl p-6 text-center">
                <p className="text-gold-400 text-sm font-medium mb-2">
                  Vuoi la Mappa del <em>tuo</em> Cielo di Nascita?
                </p>
                <p className="text-white/40 text-xs mb-5 leading-relaxed">
                  Calcola gratuitamente il tuo Ascendente, oppure sblocca il Tema Natale evolutivo completo con l'interpretazione olistica di Valeria.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/tema-natale"
                    className="btn-gold px-5 py-2.5 text-sm uppercase tracking-wider text-center">
                    Calcola l'Ascendente →
                  </Link>
                  <Link to="/i-miei-temi"
                    className="border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors px-5 py-2.5 text-sm rounded-lg text-center">
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

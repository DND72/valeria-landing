import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAstrologyApi, type NatalChartResponse } from '../api/astrology'
import ZodiacWheel from '../components/ZodiacWheel'
import { useCircadianTheme } from '../hooks/useCircadianTheme'

const PLANET_COLOR: Record<string, string> = {
  'Sole': 'text-amber-400',
  'Luna': 'text-blue-200',
  'Mercurio': 'text-yellow-300',
  'Venere': 'text-pink-300',
  'Marte': 'text-red-400',
  'Giove': 'text-orange-300',
  'Saturno': 'text-stone-300',
  'Urano': 'text-cyan-300',
  'Nettuno': 'text-indigo-300',
  'Plutone': 'text-purple-300'
}

const PLANET_SYMBOLS: Record<string, string> = {
  'Sole': '☉', 'Luna': '☽', 'Mercurio': '☿', 'Venere': '♀',
  'Marte': '♂', 'Giove': '♃', 'Saturno': '♄', 'Urano': '♅',
  'Nettuno': '♆', 'Plutone': '♇'
}

function ResultPanel({ data }: { data: NatalChartResponse }) {
  const theme = useCircadianTheme()
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Ruota Principale */}
      <div className="flex flex-col items-center mb-12 relative">
        {/* Aloni Galattici attorno alla ruota */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-full">
          <div className="w-[340px] h-[340px] rounded-full bg-indigo-950/40 blur-[60px]" />
        </div>
        <ZodiacWheel
                planets={data.pianeti || []}
                ascLon={data.ascendente_totale}
                ascSign={data.segno}
                ascDeg={data.grado_nel_segno}
                theme={theme}
              />
        <p className="mt-4 text-white/30 text-[11px] tracking-widest uppercase">
          Swiss Ephemeris Engine · Placidus
        </p>
      </div>

      {/* Scheda Ascendente */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="rounded-2xl border border-gold-500/30 bg-black/40 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-3xl rounded-full" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400/70 mb-3">✦ Segno Ascendente</p>
          <p className="font-serif text-5xl text-white mb-2">{data.segno}</p>
          <p className="text-gold-400 text-xl font-bold">{data.grado_nel_segno.toFixed(2)}°</p>
          <p className="text-white/40 text-xs mt-3">
            In {data.citta} il {data.ora_utc}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 flex flex-col justify-between">
          <p className="text-white/60 text-sm leading-relaxed italic">
            "L'Ascendente è il segno dello Zodiaco che sorgeva all'est esatto del tuo orizzonte locale nel momento della tua nascita. Rappresenta la tua prima impressione sul mondo: il tuo corpo, la tua maschera, l'energia con cui entri in ogni nuova situazione."
          </p>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/30 text-[11px]">
              Calcolo trigonometrico basato su GMST (Greenwich Mean Sidereal Time) e LST locale.
            </p>
          </div>
        </div>
      </div>

      {/* Griglia Pianeti */}
      {data.pianeti && data.pianeti.length > 0 && (
        <div className="mb-10">
          <h3 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400">☉</span> Le Posizioni Planetarie
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {data.pianeti.map(p => (
              <div
                key={p.nome}
                className="group bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-xl p-3 text-center cursor-default"
              >
                <p className={`text-2xl mb-1 ${PLANET_COLOR[p.nome] || 'text-white'}`}>
                  {PLANET_SYMBOLS[p.nome] || '✦'}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{p.nome}</p>
                <p className="font-serif text-base text-white leading-tight">{p.segno}</p>
                <p className="text-[10px] text-white/30 mt-1">{p.gradi.toFixed(1)}°</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Upgrade: invita all'iscrizione */}
      <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/[0.07] to-transparent p-8 text-center">
        <span className="text-2xl mb-4 block">✦</span>
        <h3 className="font-serif text-2xl text-white mb-3">
          Vai ancora più in profondità con il <span className="gold-text">Tema Natale</span>
        </h3>
        <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
          Iscriviti gratuitamente per salvare i tuoi calcoli e richiedere l'**Analisi Evolutiva Completa** (30 crediti). 
          Riceverai un'interpretazione profonda di tutti i pianeti, case e aspetti, curata dalla visione olistica di Valeria.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/sign-up"
            className="inline-block btn-gold px-8 py-3 text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(212,160,23,0.25)] hover:shadow-[0_0_40px_rgba(212,160,23,0.4)] transition-shadow"
          >
            Crea Account Gratis →
          </Link>
          <Link
            to="/dashboard"
            className="inline-block border border-white/15 text-white/60 hover:text-white px-8 py-3 rounded-xl text-sm transition-colors"
          >
            Hai già un account?
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function NatalChartPage() {
  const { calculateFreeChart } = useAstrologyApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<NatalChartResponse | null>(null)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [city, setCity] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await calculateFreeChart({ birthDate: date, birthTime: time.slice(0, 5), city: city.trim() })
      setResult(res)
      setTimeout(() => window.scrollBy({ top: 400, behavior: 'smooth' }), 200)
    } catch (err: any) {
      setError(err.message || 'Errore di connessione al motore astrologico')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Sfondo Galattico */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30,14,60,0.9) 0%, rgba(8,8,16,1) 70%)' }} />
        <div className="absolute inset-0 opacity-60" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
          mask: 'radial-gradient(ellipse 100% 100% at 50% 50%, black 30%, transparent 100%)'
        }} />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-60 right-1/4 w-64 h-64 bg-indigo-900/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-blue-950/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <p className="text-gold-500 text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              Astrologia di Precisione · Swiss Ephemeris
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-5 leading-tight">
              Calcola il tuo<br />
              <span className="gold-text italic">Ascendente</span>
            </h1>
            <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
              Inserisci i tuoi dati di nascita. In pochi secondi ottieni la mappa del tuo cielo natale calcolata astronomicamente con precisione sub-arcosecondo.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 mb-16 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% -20%, rgba(212,160,23,0.12), transparent 70%)' }} />
            
            <form onSubmit={handleSubmit} className="relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium block">Data di Nascita</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500/60 focus:bg-gold-500/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium block">Ora Esatta</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500/60 focus:bg-gold-500/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium block">Città di Nascita</label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Roma"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-gold-500/60 focus:bg-gold-500/5 transition-all"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <p className="text-white/30 text-[11px] max-w-xs">
                  L'orario è fondamentale per il calcolo preciso dell'Ascendente. Usa il certificato di nascita.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3.5 rounded-xl bg-gradient-to-r from-gold-700 via-gold-500 to-gold-400 text-dark-900 font-bold uppercase tracking-wider text-sm transition-all hover:shadow-[0_0_30px_rgba(212,160,23,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-900" />
                      Calcolo Effemeridi...
                    </>
                  ) : (
                    <> Genera la Ruota Zodiacale </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Risultato con Ruota */}
          <AnimatePresence>
            {result && <ResultPanel data={result} />}
          </AnimatePresence>
        </div>
    </div>
  )
}

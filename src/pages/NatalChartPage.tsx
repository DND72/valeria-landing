import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useAstrologyApi, type NatalChartResponse } from '../api/astrology'
import ZodiacWheel from '../components/ZodiacWheel'
import { useCircadianTheme } from '../hooks/useCircadianTheme'
import { SIGN_MEANINGS, HOUSE_MEANINGS } from '../constants/astrologyMeanings'

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

function ResultPanel({ data, isLoggedIn }: { data: NatalChartResponse; isLoggedIn: boolean }) {
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
                planets={isLoggedIn ? (data.pianeti || []) : []}
                houses={isLoggedIn ? (data.case || []) : []}
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

      {/* ── SEZIONE PREMIUM: Solo per utenti loggati ── */}
      {isLoggedIn ? (
        <>
          {/* Analisi Dinamica */}
          <div className="mb-12 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <span className="text-6xl italic font-serif">Valeria</span>
            </div>
            <h3 className="font-serif text-2xl text-white mb-6 flex items-center gap-3">
              <span className="text-gold-400">✨</span> Analisi Dinamica
            </h3>
            <div className="space-y-8 relative z-10">
              {/* Ascendente */}
              <div className="flex gap-5">
                <div className="w-12 h-12 shrink-0 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xl">🏹</div>
                <div>
                  <h4 className="text-gold-400 font-bold text-sm uppercase tracking-widest mb-1">Ascendente in {data.segno}</h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {SIGN_MEANINGS[data.segno]?.description || "L'energia con cui ti presenti al mondo."}
                  </p>
                </div>
              </div>
              {/* Sole */}
              {(() => {
                const sole = data.pianeti?.find(p => p.nome === 'Sole')
                if (!sole) return null
                return (
                  <div className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">☀️</div>
                    <div>
                      <h4 className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-1">Sole in {sole.segno}</h4>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {SIGN_MEANINGS[sole.segno]?.description || "Il nucleo della tua identità e volontà."}
                      </p>
                    </div>
                  </div>
                )
              })()}
              {/* Luna */}
              {(() => {
                const luna = data.pianeti?.find(p => p.nome === 'Luna')
                if (!luna) return null
                return (
                  <div className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-xl">🌙</div>
                    <div>
                      <h4 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-1">Luna in {luna.segno}</h4>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {SIGN_MEANINGS[luna.segno]?.description || "Il tuo mondo emotivo e i tuoi bisogni profondi."}
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Griglia Pianeti */}
          {data.pianeti && data.pianeti.length > 0 && (
            <div className="mb-14">
              <h3 className="font-serif text-xl text-white mb-6 flex items-center gap-3">
                <span className="text-gold-400">☉</span> Posizioni Planetarie
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {data.pianeti.map(p => (
                  <div key={p.nome} className="group bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-2xl p-4 text-center cursor-default shadow-lg">
                    <p className={`text-3xl mb-2 ${PLANET_COLOR[p.nome] || 'text-white'}`}>{PLANET_SYMBOLS[p.nome] || '✦'}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 font-bold">{p.nome}</p>
                    <p className="font-serif text-lg text-white leading-tight mb-1">{p.segno}</p>
                    <p className="text-[10px] text-white/30 font-mono">{p.gradi.toFixed(1)}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cuspidi delle Case */}
          {data.case && data.case.length > 0 && (
            <div className="mb-14">
              <h3 className="font-serif text-xl text-white mb-6 flex items-center gap-3">
                <span className="text-indigo-400">🏠</span> Cuspidi delle Case
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {data.case.map(c => (
                  <div key={c.numero} className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center group hover:bg-white/[0.05] transition-colors relative">
                    <p className="text-[10px] text-white/30 uppercase tracking-tighter mb-1">Casa {c.numero}</p>
                    <p className="text-white font-serif text-sm font-bold">{c.segno}</p>
                    <p className="text-[9px] text-indigo-400/60 font-mono mt-1">{c.gradi.toFixed(1)}°</p>
                    <div className="hidden group-hover:block absolute z-50 bg-black/90 border border-indigo-500/30 p-3 rounded-lg text-[10px] text-white/80 w-48 mt-2 -translate-x-1/4 backdrop-blur-md">
                       <p className="font-bold text-indigo-400 mb-1">{HOUSE_MEANINGS[c.numero]?.keyword}</p>
                       {HOUSE_MEANINGS[c.numero]?.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Visualizzazione per Ospiti: Spoiler oscurato */
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/40 to-dark-900 z-10 pointer-events-none" />
          <div className="opacity-20 blur-sm pointer-events-none grayscale">
             <div className="h-40 bg-white/5 rounded-3xl mb-6" />
             <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
             </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="text-center p-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl max-w-sm">
                <p className="text-gold-400 text-sm font-bold uppercase tracking-widest mb-2">✦ Contenuto Riservato</p>
                <h4 className="text-white font-serif text-xl mb-3">Sblocca il tuo Cielo Natale</h4>
                <p className="text-white/50 text-xs mb-4">Iscriviti per vedere la posizione di tutti i pianeti, le case e l'analisi dinamica gratuita del tuo oroscopo.</p>
                <Link to="/registrati" className="inline-block btn-gold px-6 py-2 text-xs uppercase tracking-tighter">Registrati Ora →</Link>
             </div>
          </div>
        </div>
      )}

      {/* CTA Upgrade */}
      <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/[0.07] to-transparent p-8 text-center">
        <span className="text-2xl mb-4 block">✦</span>
        {isLoggedIn ? (
          <>
            <h3 className="font-serif text-2xl text-white mb-3">
              Richiedi l'Analisi <span className="gold-text italic">Evolutiva Completa</span>
            </h3>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Ricevi un'interpretazione olistica e profonda di tutti i tuoi pianeti, case e aspetti, 
              curata personalmente dalla saggezza di Valeria. Il prossimo passo verso la tua consapevolezza.
            </p>
            <Link
              to="/i-miei-temi"
              className="inline-block btn-gold px-10 py-3.5 text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(212,160,23,0.25)]"
            >
              Richiedi Interpretazione (30 crediti) →
            </Link>
          </>
        ) : (
          <>
            <h3 className="font-serif text-2xl text-white mb-3">
              Sblocca il tuo <span className="gold-text italic">Piano Astrale</span> completo
            </h3>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Iscriviti gratuitamente per salvare questo calcolo, vedere la posizione di tutti i tuoi pianeti 
              e richiedere l'analisi evolutiva curata da Valeria.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/registrati"
                className="inline-block btn-gold px-8 py-3 text-sm uppercase tracking-wider"
              >
                Crea Account Gratis →
              </Link>
              <Link
                to="/accedi"
                className="inline-block border border-white/15 text-white/60 hover:text-white px-8 py-3 rounded-xl text-sm"
              >
                Accedi al tuo Diario
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default function NatalChartPage() {
  const { calculateFreeChart } = useAstrologyApi()
  const { user } = useUser()
  const isLoggedIn = !!user
  
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
            {result && <ResultPanel data={result} isLoggedIn={isLoggedIn} />}
          </AnimatePresence>
        </div>
    </div>
  )
}

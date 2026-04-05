import { useState } from 'react'
import { motion } from 'framer-motion'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { useAstrologyApi, type NatalChartResponse } from '../api/astrology'

// Modale/Box per mostrare il risultato
function AstrologicalResult({ result }: { result: NatalChartResponse }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-8 p-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
        <svg className="w-32 h-32 text-gold-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="1" />
          <path d="M12 2v20M2 12h20" strokeWidth="0.5" />
          <path d="M4.9 4.9l14.2 14.2M4.9 19.1L19.1 4.9" strokeWidth="0.5" />
          <circle cx="12" cy="12" r="4" strokeWidth="1" />
        </svg>
      </div>

      <h3 className="font-serif text-2xl text-gold-400 mb-2 font-semibold">Tema Natale e Ascendente</h3>
      <p className="text-white/60 text-sm mb-6 pb-4 border-b border-white/10">
        Calcolato sulle coordinate di {result.citta} ({result.ora_utc})
      </p>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4 border-l-2 border-gold-500/50 pl-4 py-1">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Segno Ascendente</p>
              <p className="text-3xl font-serif text-white">{result.segno}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l-2 border-white/20 pl-4 py-1">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Grado Esatto</p>
              <p className="text-lg text-white/80">{result.grado_nel_segno.toFixed(2)}°</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white/[0.03] rounded-lg p-5 border border-white/5">
          <p className="text-sm text-white/70 italic leading-relaxed text-justify">
            "L'Ascendente rappresenta la maschera che indossiamo nel mondo, il modo in cui ci presentiamo
            agli altri e l'energia con cui affrontiamo le nuove situazioni. Un Ascendente in {result.segno} 
            suggerisce una determinata spinta vitale che colora tutta la tua carta natale."
          </p>
        </div>
      </div>

      {result.pianeti && result.pianeti.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="font-serif text-lg text-gold-400 mb-4">Effemeridi: Le Posizioni Planetarie</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {result.pianeti.map(p => (
              <div key={p.nome} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gold-500/80 mb-1">{p.nome}</p>
                <p className="font-serif text-lg text-white font-semibold leading-tight">{p.segno}</p>
                <p className="text-xs text-white/40 mt-1">{p.gradi.toFixed(2)}°</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.case && result.case.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="font-serif text-lg text-emerald-400 mb-4">I Dodici Palcoscenici: Le Case Astrologiche</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {result.case.map(c => (
              <div key={c.numero} className="bg-white/[0.02] border border-emerald-500/20 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-emerald-400/80 mb-1">Casa {c.numero}</p>
                <p className="font-serif text-lg text-white font-semibold leading-tight">{c.segno}</p>
                <p className="text-xs text-white/40 mt-1">{c.gradi.toFixed(2)}°</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function NatalChartPage() {
  const { calculateFreeChart } = useAstrologyApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<NatalChartResponse | null>(null)

  // Campi form
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [city, setCity] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await calculateFreeChart({
        birthDate: date,
        birthTime: time,
        city: city.trim()
      })
      setResult(res)
    } catch (err: any) {
      setError(err.message || 'Errore di connessione al motore astrologico')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-16 px-6 relative max-w-4xl mx-auto">
      <SignedOut>
        <RedirectToSignIn afterSignInUrl="/tema-natale" />
      </SignedOut>
      
      <SignedIn>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <p className="text-gold-500 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Astrologia di Precisione
          </p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
            Calcola il tuo <span className="gold-text italic">Tema Natale</span>
          </h1>
          <p className="text-white/50 text-base max-w-2xl mx-auto">
            Inserisci i tuoi dati di nascita esatti. Il nostro motore astrologico utilizzerà 
            strumenti di altissima precisione (Geopy, Swiss Ephemeris algoritmiche) per darti una risposta accurata.
          </p>
        </motion.div>

        <div className="bg-[#141418] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Radial glow background */}
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(circle at 50% -20%, rgba(212,160,23,0.15), transparent 70%)' }} />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/50 font-medium ml-1">Data di nascita</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/50 font-medium ml-1">Ora esatta</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                />
                <p className="text-[10px] text-white/30 ml-1">Formato 24h (es. 14:30). L'orario esatto è fondamentale.</p>
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs uppercase tracking-widest text-white/50 font-medium ml-1">Città di nascita</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Roma, Milano, Napoli"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-gold-600 to-gold-400 text-dark-500 font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Calcolo Efelmeridi in corso...' : 'Calcola Ascendente'}
              </button>
            </div>
          </form>

          {result && <AstrologicalResult result={result} />}
        </div>
      </SignedIn>
    </div>
  )
}

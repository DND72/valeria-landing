import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { useAstrologyApi, type SavedNatalChart, type NatalChartResponse } from '../api/astrology'
import { Link } from 'react-router-dom'
import ZodiacWheel from '../components/ZodiacWheel'
import { useCircadianTheme } from '../hooks/useCircadianTheme'

function ChartDisplay({ chart, interpretation }: { chart: NatalChartResponse, interpretation: string }) {
  const theme = useCircadianTheme()
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

      <div className="mb-10 w-full flex justify-center">
        <ZodiacWheel
          planets={chart.pianeti || []}
          ascLon={chart.ascendente_totale}
          ascSign={chart.segno}
          ascDeg={chart.grado_nel_segno}
          theme={theme}
        />
      </div>

      <div className="mb-10 p-4 border border-white/5 bg-white/[0.02] rounded-2xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4 text-center">Significato degli Aspetti (Linee)</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] text-white/70">Trigono (Armonia)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)] border-t border-dashed" />
            <span className="text-[10px] text-white/70">Sestile (Opportunità)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-red-500 shadow-[0_0_5px_rgba(248,113,113,0.5)]" />
            <span className="text-[10px] text-white/70">Quadrato (Sfida)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
            <span className="text-[10px] text-white/70">Opposizione (Polarità)</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="font-serif text-2xl text-gold-400 font-semibold">Tema Natale e Ascendente</h3>
          <p className="text-white/60 text-sm">
            Calcolato per {chart.citta} ({chart.ora_utc})
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4 border-l-2 border-gold-500/50 pl-4 py-1">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Segno Ascendente</p>
              <p className="text-3xl font-serif text-white">{chart.segno}</p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4 border-l-2 border-white/20 pl-4 py-1">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">Grado Esatto</p>
              <p className="text-lg text-white/80">{chart.grado_nel_segno.toFixed(2)}°</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10">
        <h4 className="font-serif text-xl text-gold-500 mb-4">L'Interpretazione di Valeria</h4>
        <div className="prose prose-invert prose-gold max-w-none text-white/80 leading-relaxed space-y-4 whitespace-pre-wrap">
          {interpretation}
        </div>
      </div>
    </motion.div>
  )
}

export default function PaidNatalCharts() {
  const { generatePaidChart, getMyCharts } = useAstrologyApi()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  
  const [myCharts, setMyCharts] = useState<SavedNatalChart[]>([])
  const [viewingChart, setViewingChart] = useState<SavedNatalChart | null>(null)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    fetchCharts()
  }, [])

  const fetchCharts = async () => {
    try {
      const charts = await getMyCharts()
      setMyCharts(charts)
    } catch (e) {
      console.error(e)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setViewingChart(null)

    try {
      const res = await generatePaidChart({
        birthDate: date,
        birthTime: time,
        city: city.trim(),
        type: 'advanced'
      })
      await fetchCharts()
      setViewingChart({
        id: 'new',
        type: 'advanced',
        birthDate: date,
        birthTime: time,
        city,
        chartData: res,
        interpretation: res.interpretation,
        createdAt: new Date().toISOString()
      })
      window.scrollTo({ top: 500, behavior: 'smooth' })
    } catch (err: any) {
      setError(err.message || 'Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-24 px-6 relative max-w-5xl mx-auto">
      <SignedOut>
        <RedirectToSignIn afterSignInUrl="/i-miei-temi" />
      </SignedOut>
      
      <SignedIn>
        <div className="mb-4">
          <Link to="/dashboard" className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-2">
            ← Torna al Diario
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <p className="text-gold-500 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Analisi Evolutiva
          </p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
            Interpretazione <span className="gold-text italic">Evolutiva</span>
          </h1>
          <p className="text-white/50 text-base max-w-2xl mx-auto mb-4">
            Mentre il calcolo della mappa è gratuito, qui puoi richiedere l'analisi profonda di Valeria: un viaggio spirituale tra i tuoi pianeti e le tue sfide d'anima.
          </p>
          <div className="flex items-center justify-center gap-6">
             <Link to="/tema-natale" className="text-sm underline text-emerald-400/80 hover:text-emerald-400">
               Versione gratuita (Solo Ascendente)
             </Link>
             <Link to="/wallet" className="text-sm border border-gold-500/30 px-3 py-1 rounded-full text-gold-400 hover:bg-gold-500/10">
               Ricarica Crediti
             </Link>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-[1fr,300px] gap-8">
          <div className="space-y-8">
            <div className="bg-[#141418] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/50 font-medium ml-1">Data</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/50 font-medium ml-1">Ora Esatta</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-white/50 font-medium ml-1">Città</label>
                    <input
                      type="text"
                      required
                      placeholder="Es. Roma"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center mb-6">
                  <h4 className="font-serif text-xl font-bold text-white mb-2">Analisi Evolutiva Completa</h4>
                  <p className="text-white/60 text-sm mb-4 leading-relaxed">
                    Interpretazione di tutti i Pianeti, Case Astrologiche e principali Aspetti nel tuo Tema Natale. 
                    Un'analisi olistica focalizzata sul tuo potenziale e sulle sfide evolutive.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-emerald-400 font-bold text-2xl">30 CR</span>
                    <span className="text-white/20 text-xs uppercase tracking-widest">(Crediti)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-gold-600 to-gold-400 text-dark-500 font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Lettura in corso...' : `Richiedi Analisi Evolutiva (30 CR)`}
                  </button>
                </div>
              </form>
            </div>

            {viewingChart && (
              <ChartDisplay chart={viewingChart.chartData} interpretation={viewingChart.interpretation} />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">I Miei Temi</h3>
            
            {fetchLoading ? (
               <div className="animate-pulse flex flex-col gap-3">
                 <div className="h-16 bg-white/5 rounded-lg border border-white/10" />
               </div>
            ) : myCharts.length === 0 ? (
               <p className="text-sm text-white/40 italic">Nessun tema salvato.</p>
            ) : (
               <div className="flex flex-col gap-3">
                 {myCharts.map(c => (
                   <button
                     key={c.id}
                     onClick={() => {
                        setViewingChart(c)
                        window.scrollTo({ top: 500, behavior: 'smooth' })
                     }}
                     className={`text-left p-4 rounded-lg border transition-all ${
                       viewingChart?.id === c.id ? 'bg-white/5 border-gold-500/50' : 'bg-[#141418] border-white/10'
                     }`}
                   >
                     <p className="text-white font-medium text-sm capitalize">{c.city}</p>
                     <p className="text-[10px] text-white/50">{c.birthDate}</p>
                   </button>
                 ))}
               </div>
            )}

            {/* 🔥 Prossimamente Flag */}
            <div className="mt-8 p-6 rounded-2xl border border-gold-500/20 bg-black/40 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                </span>
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-gold-500">Evoluzione</p>
              </div>
              <h4 className="font-serif text-lg text-white mb-4">Oltre il Tema</h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-lg">🧬</div>
                  <div>
                    <p className="text-[11px] font-bold text-white/90">Bi-Wheel</p>
                    <p className="text-[9px] text-white/40 leading-relaxed">Il respiro del cielo sulla tua impronta natale.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-lg">✨</div>
                  <div>
                    <p className="text-[11px] font-bold text-white/90">La Mentore Silente</p>
                    <p className="text-[9px] text-white/40 leading-relaxed">Un dialogo profondo per navigare le sfide del presente.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-lg">🗺️</div>
                  <div>
                    <p className="text-[11px] font-bold text-white/90">Astro-Cartografia</p>
                    <p className="text-[9px] text-white/40 leading-relaxed">Trova nel mondo il tuo luogo sacro.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  )
}

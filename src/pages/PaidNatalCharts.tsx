import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { useAstrologyApi, type SavedNatalChart, type NatalChartResponse } from '../api/astrology'
import { Link } from 'react-router-dom'
import ZodiacWheel from '../components/ZodiacWheel'

function ChartDisplay({ chart, interpretation }: { chart: NatalChartResponse, interpretation: string }) {
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
        />
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

      {chart.pianeti && chart.pianeti.length > 0 && (
        <div className="mb-8 pt-6 border-t border-white/10">
          <h4 className="font-serif text-lg text-gold-400 mb-4">Effemeridi: Le Posizioni Planetarie</h4>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {chart.pianeti.map(p => (
              <div key={p.nome} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gold-500/80 mb-1">{p.nome}</p>
                <p className="font-serif text-lg text-white font-semibold leading-tight">{p.segno}</p>
                <p className="text-xs text-white/40 mt-1">{p.gradi.toFixed(2)}°</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {chart.case && chart.case.length > 0 && (
        <div className="mb-8 pt-6 border-t border-white/10">
          <h4 className="font-serif text-lg text-emerald-400 mb-4">I Dodici Palcoscenici: Le Case Astrologiche</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {chart.case.map(c => (
              <div key={c.numero} className="bg-white/[0.02] border border-emerald-500/20 rounded-lg p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-emerald-400/80 mb-1">Casa {c.numero}</p>
                <p className="font-serif text-lg text-white font-semibold leading-tight">{c.segno}</p>
                <p className="text-xs text-white/40 mt-1">{c.gradi.toFixed(2)}°</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
  const [error, setError] = useState<string | null>(null)
  
  const [myCharts, setMyCharts] = useState<SavedNatalChart[]>([])
  const [viewingChart, setViewingChart] = useState<SavedNatalChart | null>(null)

  // Form Fields
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState<'basic' | 'advanced'>('basic')

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
        type
      })
      // Refetch the charts history to include the new one
      await fetchCharts()
      
      // We manually construct viewingChart using the response
      setViewingChart({
        id: 'new',
        type,
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
            Genera un <span className="gold-text italic">Tema Natale</span>
          </h1>
          <p className="text-white/50 text-base max-w-2xl mx-auto mb-4">
            Inserisci i tuoi dati di nascita esatti. Lo scaleremo dai tuoi Crediti e riceverai un'analisi astrologica completa salvata qui nel tuo Diario.
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
          {/* Colonna di Sinistra: Form e Risultato Attuale */}
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

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${type === 'basic' ? 'border-gold-500/50 bg-gold-500/10' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" value="basic" checked={type === 'basic'} onChange={() => setType('basic')} className="hidden" />
                    <h4 className="font-serif text-lg font-semibold text-white mb-1">Tema Base</h4>
                    <p className="text-xs text-white/50 mb-2">Sole, Luna, Ascendente</p>
                    <span className="text-gold-400 font-bold">15 CR</span>
                  </label>
                  
                  <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${type === 'advanced' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" value="advanced" checked={type === 'advanced'} onChange={() => setType('advanced')} className="hidden" />
                    <h4 className="font-serif text-lg font-semibold text-white mb-1">Evolutivo</h4>
                    <p className="text-xs text-white/50 mb-2">Tutti i Pianeti e Case</p>
                    <span className="text-emerald-400 font-bold">30 CR</span>
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-200 text-sm mb-2">{error}</p>
                    {error.includes('funds') && (
                       <Link to="/wallet" className="text-xs btn-gold px-4 py-1.5 inline-block">Vai al Wallet</Link>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-gold-600 to-gold-400 text-dark-500 font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-900" />
                        Lettura Astrologica in corso... (10s)
                      </>
                    ) : (
                      `Calcola e Salva (${type === 'basic' ? '15 CR' : '30 CR'})`
                    )}
                  </button>
                </div>
              </form>
            </div>

            {viewingChart && (
              <ChartDisplay chart={viewingChart.chartData} interpretation={viewingChart.interpretation} />
            )}
          </div>

          {/* Colonna di Destra: Sidebar dei Temi Salvati */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">I Miei Temi Salvati</h3>
            
            {fetchLoading ? (
               <div className="animate-pulse flex flex-col gap-3">
                 <div className="h-20 bg-white/5 rounded-lg border border-white/10" />
                 <div className="h-20 bg-white/5 rounded-lg border border-white/10" />
               </div>
            ) : myCharts.length === 0 ? (
               <p className="text-sm text-white/40 italic">Nessun tema natale salvato ancora. Generane uno per iniziare a esplorare l'astrologia.</p>
            ) : (
               <div className="flex flex-col gap-3">
                 {myCharts.map(c => (
                   <button
                     key={c.id}
                     onClick={() => {
                        setError(null)
                        setViewingChart(c)
                        window.scrollTo({ top: 500, behavior: 'smooth' })
                     }}
                     className={`text-left p-4 rounded-lg border transition-all ${
                       viewingChart?.id === c.id ? 'bg-white/5 border-gold-500/50' : 'bg-[#141418] border-white/10 hover:border-white/30'
                     }`}
                   >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white font-medium text-sm capitalize">{c.city}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${c.type === 'advanced' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gold-500/20 text-gold-400'}`}>
                          {c.type}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">{c.birthDate} - {c.chartData.segno}</p>
                   </button>
                 ))}
               </div>
            )}
          </div>
        </div>
      </SignedIn>
    </div>
  )
}

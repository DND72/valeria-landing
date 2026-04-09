import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { useAstrologyApi, type SavedNatalChart, type NatalChartResponse } from '../api/astrology'
import { Link } from 'react-router-dom'
import ZodiacWheel from '../components/ZodiacWheel'
import { useCircadianTheme } from '../hooks/useCircadianTheme'
import { HOUSE_MEANINGS } from '../constants/astrologyMeanings'
import ClientLayout from '../components/dashboard/ClientLayout'

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
        <div className="w-full max-w-4xl max-h-[85vh]">
          <ZodiacWheel
            planets={chart.pianeti || []}
            ascLon={chart.ascendente_totale}
            ascSign={chart.segno}
            ascDeg={chart.grado_nel_segno}
            theme={theme}
          />
        </div>
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

      {chart.pianeti && chart.pianeti.length > 0 && (
        <div className="mb-14">
          <h3 className="font-serif text-xl text-white mb-6 flex items-center gap-3">
            <span className="text-gold-400">☉</span> Posizioni Planetarie
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {chart.pianeti.map((p: any) => (
              <div key={p.nome} className="group bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-2xl p-4 text-center cursor-default shadow-lg">
                <p className={`text-3xl mb-2 ${PLANET_COLOR[p.nome] || 'text-white'}`}>{PLANET_SYMBOLS[p.nome] || '✦'}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 font-bold">{p.nome}</p>
                <p className="font-serif text-lg text-white leading-tight mb-0.5">{p.segno}</p>
                <p className="text-[10px] text-gold-400/90 font-bold uppercase tracking-tighter">Casa {p.casa}</p>
                <p className="text-[10px] text-white/30 font-mono mt-1">{p.gradi.toFixed(1)}°</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {chart.case && chart.case.length > 0 && (
        <div className="mb-14">
          <h3 className="font-serif text-xl text-white mb-6 flex items-center gap-3">
            <span className="text-indigo-400">🏠</span> Cuspidi delle Case
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {chart.case.map((c: any) => (
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

      <div className="pt-8 border-t border-white/10">
        <h4 className="font-serif text-3xl text-gold-500 mb-8 text-center uppercase tracking-widest">L'Interpretazione di Valeria</h4>
        <div className="prose prose-invert prose-gold max-w-none text-white/80 leading-relaxed space-y-4">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="font-serif text-3xl text-gold-400 mt-12 mb-6 border-b border-gold-500/20 pb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="font-serif text-2xl text-gold-500 mt-10 mb-4" {...props} />,
              h3: ({node, ...props}) => <h3 className="font-serif text-xl text-cyan-400 mt-8 mb-3" {...props} />,
              strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
              p: ({node, ...props}) => <p className="mb-6 text-lg tracking-wide text-white/80 leading-relaxed text-justify" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-3" {...props} />,
              li: ({node, ...props}) => <li className="text-white/80 text-lg" {...props} />,
            }}
          >
            {interpretation}
          </ReactMarkdown>
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
  const [gender, setGender] = useState<'M'|'F'|''>('')

  const hasAdvanced = myCharts.some(c => c.type === 'advanced')

  useEffect(() => {
    fetchCharts()
    import('../api/me').then(m => m.useMeApi().getProfile().then(p => {
      if (p) {
        if (p.gender) setGender(p.gender)
        if (p.birthDate) {
           setDate(p.birthDate)
           if (p.birthTime) setTime(p.birthTime)
           if (p.birthCity) setCity(p.birthCity)
        }
      }
    }))
  }, [])

  const fetchCharts = async () => {
    try {
      const charts = await getMyCharts()
      setMyCharts(charts)
      // Auto-load advanced chart if exists
      const adv = charts.find(c => c.type === 'advanced')
      if (adv) setViewingChart(adv)
    } catch (e) {
      console.error(e)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hasAdvanced) return
    setLoading(true)
    setError(null)
    setViewingChart(null)

    try {
      const res = await generatePaidChart({
        birthDate: date,
        birthTime: time,
        city: city.trim(),
        gender: gender as 'M'|'F',
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
      window.setTimeout(() => {
        document.getElementById('chart-display')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    } catch (err: any) {
      setError(err.message || 'Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ClientLayout title="Mappe Astrali" subtitle="Interpretazione Evolutiva">
      <SignedOut>
        <RedirectToSignIn afterSignInUrl="/area-personale/i-miei-temi" />
      </SignedOut>
      
      <SignedIn>
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-white/50 text-base max-w-2xl mx-auto mb-6">
              Mentre il calcolo della mappa è gratuito, qui puoi richiedere l'analisi profonda di Valeria: un viaggio spirituale tra i tuoi pianeti e le tue sfide d'anima.
            </p>
            <div className="flex items-center justify-center gap-6">
               <Link to="/area-personale/tema-natale" className="text-sm underline text-emerald-400/80 hover:text-emerald-400">
                 Mappa Gratuita
               </Link>
               <Link to="/area-personale/wallet" className="text-sm border border-gold-500/30 px-3 py-1 rounded-full text-gold-400 hover:bg-gold-500/10">
                 Ricarica Crediti
               </Link>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-[1fr,300px] gap-8">
            <div className="space-y-8">
              {!hasAdvanced && (
                <div className="bg-[#141418] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    <div className="flex items-center gap-2 text-gold-500/80 text-[10px] uppercase tracking-widest mb-2 bg-gold-400/5 p-3 rounded-xl border border-gold-400/10">
                       <span className="text-sm">🔒</span>
                       I tuoi dati sono sincronizzati con il profilo e non modificabili per precisione astrale.
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium ml-1">Data</label>
                        <input
                          type="date"
                          required
                          disabled={true}
                          value={date}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-sm text-white opacity-50 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium ml-1">Ora Esatta</label>
                        <input
                          type="time"
                          required
                          disabled={true}
                          value={time}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-sm text-white opacity-50 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-medium ml-1">Città</label>
                        <input
                          type="text"
                          required
                          disabled={true}
                          placeholder="Es. Roma"
                          value={city}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-sm text-white opacity-50 cursor-not-allowed"
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
              )}

              {hasAdvanced && (
                <div className="mb-10">
                   <div className="p-6 mystical-card border-emerald-500/30 bg-emerald-500/5 text-center">
                      <h3 className="text-emerald-400 font-serif text-xl mb-2">✦ La tua Analisi Evolutiva è pronta</h3>
                      <p className="text-white/60 text-sm mb-4">I tuoi dati di nascita sono cristallizzati. Se hai bisogno di modificarli, contatta l'assistenza di Valeria.</p>
                      <button 
                        onClick={() => {
                          const adv = myCharts.find(c => c.type === 'advanced')
                          if (adv) {
                            setViewingChart(adv)
                            window.scrollTo({ top: 1000, behavior: 'smooth' })
                          }
                        }}
                        className="btn-gold px-8 py-2.5 text-sm"
                      >
                        Leggi la mia Analisi Completa
                      </button>
                   </div>
                </div>
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
                          window.scrollTo({ top: 1000, behavior: 'smooth' })
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
            </div>
          </div>

          {viewingChart && (
            <div className="mt-12 w-full pt-8" id="chart-display">
              <ChartDisplay chart={viewingChart.chartData} interpretation={viewingChart.interpretation} />
            </div>
          )}

          {/* 🔥 Funzioni Attive */}
          <div className="mt-20 p-8 rounded-2xl border border-gold-500/20 bg-gold-900/5 relative overflow-hidden group w-full">
            <div className="flex items-center gap-2 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-emerald-400">Strumenti Attivi</p>
            </div>
            <h4 className="font-serif text-2xl text-white mb-8">Oltre il Tema</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link to="/area-personale" className="flex gap-4 group/item cursor-pointer">
                <div className="text-3xl filter grayscale group-hover/item:grayscale-0 transition-all">🧬</div>
                <div>
                  <p className="text-lg font-bold text-gold-400 group-hover/item:text-gold-300">Bi-Wheel <span className="text-[9px] bg-gold-500/20 px-1 rounded ml-1">Live</span></p>
                  <p className="text-sm text-white/40 leading-relaxed mt-1">Il respiro del cielo sulla tua impronta natale.</p>
                </div>
              </Link>
              <Link to="/area-personale" className="flex gap-4 group/item cursor-pointer">
                <div className="text-3xl filter grayscale group-hover/item:grayscale-0 transition-all">✨</div>
                <div>
                  <p className="text-lg font-bold text-gold-400 group-hover/item:text-gold-300">La Mentore Silente</p>
                  <p className="text-sm text-white/40 leading-relaxed mt-1">Un dialogo profondo per navigare le sfide del presente.</p>
                </div>
              </Link>
              <div className="flex gap-4 opacity-40">
                <div className="text-3xl">🗺️</div>
                <div>
                  <p className="text-lg font-bold text-white/90">Astro-Cartografia</p>
                  <p className="text-sm text-white/40 leading-relaxed mt-1">Trova nel mondo il tuo luogo sacro.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </ClientLayout>
  )
}

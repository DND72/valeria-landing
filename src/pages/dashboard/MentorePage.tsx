import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import ClientLayout from '../../components/dashboard/ClientLayout'
import WeeklyForecast from '../../components/WeeklyForecast'
import { useAstrologyApi } from '../../api/astrology'

export default function MentorePage() {
  const { user } = useUser()
  const { getLatestHoroscope, generatePaidHoroscope, getMyCharts } = useAstrologyApi()

  const [latestHoroscope, setLatestHoroscope] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [wakingUp, setWakingUp] = useState(false)
  const [hasNatalChart, setHasNatalChart] = useState<boolean | null>(null)
  const [chartType, setChartType] = useState<'basic' | 'advanced'>('basic')

  const loadData = useCallback(async () => {
    try {
      const charts = await getMyCharts()
      if (charts && charts.length > 0) {
        setHasNatalChart(true)
        setChartType(charts[0].type as any)
      } else {
        setHasNatalChart(false)
      }
      
      const res = await getLatestHoroscope()
      setLatestHoroscope(res?.forecast || null)
    } catch (err) {
      console.error("[Oracolo Load]", err)
    } finally {
      setLoading(false)
    }
  }, [getLatestHoroscope, getMyCharts])

  useEffect(() => {
    if (!user) return
    void loadData()
  }, [user, loadData])

  const handleGenerate = async () => {
    if (!hasNatalChart) {
      alert("L'Oracolo deve prima conoscere il tuo Tema Natale per personalizzare l'oroscopo. Generane uno nella sezione dedicata.")
      return
    }
    setWakingUp(true)
    try {
      await generatePaidHoroscope()
      await loadData()
    } catch (err: any) {
      if (err.message === 'insufficient_funds') {
        alert(`Saldo insufficiente. L'Oroscopo per te costa ${chartType === 'advanced' ? '8' : '5'} CR.`)
      } else {
        alert(err.message || "Errore durante l'interrogazione dell'Oracolo")
      }
    } finally {
      setWakingUp(false)
    }
  }

  if (loading) {
    return (
      <ClientLayout title="L'Oracolo Astrale" subtitle="Nonsolotarocchi Algorithm">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
          <p className="text-white/40 text-sm mt-4 uppercase tracking-widest">Consultando le effemeridi...</p>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout title="L'Oracolo Astrale" subtitle="Il Luna Park del tuo Destino">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Oracolo */}
        <div className="mystical-card p-8 md:p-12 bg-gradient-to-br from-purple-900/20 via-indigo-900/10 to-transparent border-purple-500/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 text-7xl opacity-5 pointer-events-none font-serif group-hover:scale-110 transition-transform duration-1000">ORACULO</div>
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-amber-400 p-1 shadow-[0_0_40px_rgba(147,51,234,0.3)] shrink-0">
                 <div className="w-full h-full rounded-full bg-dark-500 flex items-center justify-center text-5xl">🔮</div>
              </div>
              <div className="text-center md:text-left">
                <span className="text-gold-400 text-xs uppercase tracking-[0.4em] font-bold mb-2 block">Benvenuto al Luna Park Astrale</span>
                <h2 className="text-4xl font-serif text-white mb-4">L'Algoritmo di Nonsolotarocchi</h2>
                <p className="text-white/60 leading-relaxed max-w-2xl">
                  Qui la scienza delle effemeridi incontra la potenza del calcolo. L'Oracolo analizza istantaneamente i tuoi transiti per offrirti verità cristalline, senza interferenze umane.
                </p>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Slot: Oroscopo Settimanale */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-xl font-serif text-white flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-gold-400" />
               Il tuo Verdetto Settimanale
            </h3>

            {!latestHoroscope || latestHoroscope.status !== 'ready' ? (
              <div className="mystical-card p-10 border-gold-500/20 bg-gold-500/5 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
                <div className="mb-6 text-4xl">🎟️</div>
                <h4 className="text-2xl font-serif text-white mb-4">Interroga l'Oracolo</h4>
                <p className="text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
                  Ottieni la tua guida settimanale iper-personalizzata incrociando i transiti attuali con la tua mappa natale.
                </p>
                
                {!hasNatalChart ? (
                   <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                      <p className="text-red-400 text-sm italic">
                        "Non posso leggerti se non so chi sei. Genera prima il tuo Tema Natale."
                      </p>
                      <Link to="/area-personale/tema-natale" className="btn-gold mt-4 inline-block text-xs">Genera Tema Natale (Free)</Link>
                   </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={handleGenerate}
                      disabled={wakingUp}
                      className="mystical-button px-12 py-3 bg-gold-500 text-dark-500 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {wakingUp ? 'Calcolo Astrale...' : `Attiva Oroscopo (${chartType === 'advanced' ? '8' : '5'} CR)`}
                    </button>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Risultato istantaneo by Algorithm</p>
                  </div>
                )}
              </div>
            ) : (
              <WeeklyForecast 
                content={latestHoroscope.forecast_text}
                luckyDays={latestHoroscope.lucky_days}
                energyLevel={latestHoroscope.energy_level}
              />
            )}
          </div>

          {/* Side Slots: Altri Servizi */}
          <div className="space-y-6">
             <h3 className="text-xl font-serif text-white flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-purple-400" />
               Altre Attrazioni
            </h3>

            {/* Maree del Cuore */}
            <Link to="/maree-del-cuore" className="block group">
               <div className="mystical-card p-6 border-pink-500/20 bg-pink-500/5 group-hover:border-pink-500/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🌊</span>
                     <span className="text-[10px] py-1 px-2 rounded-full bg-pink-500/20 text-pink-300 font-bold uppercase">10 CR</span>
                  </div>
                  <h4 className="text-lg font-serif text-white mb-2">Maree del Cuore</h4>
                  <p className="text-white/40 text-xs leading-relaxed">
                     L'evoluzione sentimentale del tuo mese in base ai transiti di coppia.
                  </p>
               </div>
            </Link>

            {/* Libro dell'Amore */}
            <Link to="/affinita-di-coppia" className="block group">
               <div className="mystical-card p-6 border-gold-500/20 bg-gold-500/5 group-hover:border-gold-500/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">📖</span>
                     <span className="text-[10px] py-1 px-2 rounded-full bg-gold-500/20 text-gold-300 font-bold uppercase">30 CR</span>
                  </div>
                  <h4 className="text-lg font-serif text-white mb-2">Libro dell'Amore</h4>
                  <p className="text-white/40 text-xs leading-relaxed">
                     Sinastria completa: il destino karmico e fisico tra te e il partner.
                  </p>
               </div>
            </Link>

            {/* Tema Natale */}
            <Link to="/area-personale/tema-natale" className="block group">
               <div className="mystical-card p-6 border-indigo-500/20 bg-indigo-500/5 group-hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🌌</span>
                     <span className="text-[10px] py-1 px-2 rounded-full bg-indigo-500/20 text-indigo-300 font-bold uppercase">FREE / 20 CR</span>
                  </div>
                  <h4 className="text-lg font-serif text-white mb-2">Tema Natale</h4>
                  <p className="text-white/40 text-xs leading-relaxed">
                     La mappa del tuo spirito al momento del primo respiro.
                  </p>
               </div>
            </Link>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/5 text-center">
               <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 leading-relaxed">
                  L'Astrologia di Nonsolotarocchi è un'elaborazione matematica puramente algoritmica.
               </p>
               <Link to="/area-personale/i-miei-consulti" className="text-[10px] text-gold-400/80 hover:text-gold-300 uppercase tracking-widest font-bold border-b border-gold-500/20 pb-1">
                  Vuoi l'intuizione di Valeria? →
               </Link>
            </div>

          </div>
        </div>
      </div>
    </ClientLayout>
  )
}


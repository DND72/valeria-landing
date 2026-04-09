import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import ClientLayout from '../../components/dashboard/ClientLayout'
import BiWheel from '../../components/BiWheel'
import { useAstrologyApi, type SavedNatalChart } from '../../api/astrology'
import { useCircadianTheme } from '../../hooks/useCircadianTheme'
import { calculateTransits } from '../../utils/astrologyUtils'

export default function BiWheelPage() {
  const { user } = useUser()
  const { getMyCharts, getCurrentSky } = useAstrologyApi()
  const theme = useCircadianTheme()

  const [myCharts, setMyCharts] = useState<SavedNatalChart[] | null>(null)
  const [currentSky, setCurrentSky] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try { 
        const [charts, sky] = await Promise.all([
          getMyCharts(),
          getCurrentSky()
        ])
        setMyCharts(charts)
        setCurrentSky(sky)
      } catch (err) { 
        console.error("[BiWheel Page Load]", err)
      } finally { 
        setLoading(false) 
      }
    }
    void load()
  }, [user, getMyCharts, getCurrentSky])

  if (loading) {
    return (
      <ClientLayout title="Bi-Wheel" subtitle="Transiti in Tempo Reale">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
          <p className="text-white/40 text-sm mt-4 uppercase tracking-widest">Sintonizzazione Astrale...</p>
        </div>
      </ClientLayout>
    )
  }

  const hasChart = myCharts && myCharts.length > 0
  const chart = hasChart ? myCharts[0] : null

  return (
    <ClientLayout title="Bi-Wheel" subtitle="La tua Impronta nel Flusso Cosmico">
      <div className="max-w-5xl mx-auto">
        {!hasChart ? (
          <div className="mystical-card border-amber-500/30 bg-amber-500/5 text-center p-12">
            <h3 className="text-amber-400 font-serif text-2xl mb-4">Mappa Astrale mancante</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">Per utilizzare la Bi-Wheel è necessario aver calcolato il proprio Tema Natale almeno una volta.</p>
            <a href="/area-personale/tema-natale" className="btn-gold px-8 py-3 uppercase tracking-widest text-xs">Calcola ora</a>
          </div>
        ) : !currentSky ? (
          <div className="text-center text-red-400 p-8">Errore nel caricamento del cielo attuale.</div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mystical-card flex flex-col items-center justify-center py-16 px-6 shadow-[0_0_80px_rgba(212,160,23,0.1)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gold-500/5 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between w-full mb-12 gap-6 bg-black/40 p-6 rounded-2xl border border-white/5">
              <div className="text-center md:text-left">
                <h3 className="font-serif text-3xl text-white uppercase tracking-widest mb-2 italic">Visione Immersiva</h3>
                <p className="text-xs text-gold-400 font-sans font-bold uppercase tracking-[0.3em]">Impronta Natale vs Transiti di Oggi</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Status Motore</p>
                    <p className="text-xs text-emerald-400 font-bold">CALCOLO DINAMICO ATTIVO</p>
                 </div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              </div>
            </div>

            <div className="w-full max-w-4xl transform hover:scale-[1.01] transition-transform duration-700">
              <BiWheel 
                natalPlanets={chart!.chartData.pianeti || []}
                transitPlanets={currentSky.pianeti || []}
                transitAspects={calculateTransits(chart!.chartData.pianeti || [], currentSky.pianeti || [])}
                ascLon={chart!.chartData.ascendente_totale}
                theme={theme}
              />
            </div>

            <div className="mt-16 grid md:grid-cols-2 gap-10 w-full">
               <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                  <h4 className="font-serif text-lg text-gold-400 mb-4 flex items-center gap-2">
                     <span>⭕</span> Cerchio Interno
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed italic">
                    Rappresenta la tua "promessa" natale: la posizione immota dei pianeti nel istante esatto in cui hai emesso il primo respiro.
                  </p>
               </div>
               <div className="p-6 rounded-2xl bg-gold-500/[0.03] border border-gold-500/20 shadow-[inset_0_0_20px_rgba(212,160,23,0.05)]">
                  <h4 className="font-serif text-lg text-emerald-400 mb-4 flex items-center gap-2">
                     <span>💫</span> Cerchio Esterno
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed italic">
                    Sono i pianeti nel loro movimento ciclico attuale. Osserva come "toccano" la tua struttura, attivando opportunità e sfide.
                  </p>
               </div>
            </div>

            <div className="mt-12 text-center max-w-2xl px-4 border-t border-white/5 pt-10">
              <p className="text-sm text-white/40 leading-relaxed">
                Le linee che vedi nell'anello centrale indicano gli <strong>aspetti attivi</strong>. 
                In <span className="text-blue-400">blu</span> e <span className="text-emerald-400">verde</span> le energie che fluiscono senza attrito, 
                in <span className="text-red-400">rosso</span> le forze che richiedono integrazione e lavoro interiore.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </ClientLayout>
  )
}

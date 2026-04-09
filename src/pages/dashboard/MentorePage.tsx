import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import ClientLayout from '../../components/dashboard/ClientLayout'
import WeeklyForecast from '../../components/WeeklyForecast'
import { useAstrologyApi } from '../../api/astrology'

export default function MentorePage() {
  const { user } = useUser()
  const { getLatestHoroscope } = useAstrologyApi()

  const [latestHoroscope, setLatestHoroscope] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try { 
        const res = await getLatestHoroscope()
        // Prioritizziamo l'oroscopo personalizzato se presente
        setLatestHoroscope(res?.forecast || null)
      } catch (err) { 
        console.error("[Mentore Page Load]", err)
      } finally { 
        setLoading(false) 
      }
    }
    void load()
  }, [user, getLatestHoroscope])

  if (loading) {
    return (
      <ClientLayout title="La Mentore Silente" subtitle="Guida Settimanale">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
          <p className="text-white/40 text-sm mt-4 uppercase tracking-widest">In ascolto delle stelle...</p>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout title="La Mentore Silente" subtitle="Il Dialogo tra il tuo Cielo e il Presente">
      <div className="max-w-5xl mx-auto">
        {!latestHoroscope ? (
          <div className="mystical-card border-gold-500/20 bg-gold-900/5 p-12 text-center">
            <h3 className="text-gold-400 font-serif text-2xl mb-4">La Mentore sta meditando</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
               Non abbiamo ancora un oroscopo attivo per te. Assicurati di aver generato il tuo Tema Natale o attendi il rilascio della prossima guida settimanale.
            </p>
            <a href="/area-personale/tema-natale" className="btn-gold px-8 py-3 uppercase tracking-widest text-xs">Torna al Tema Natale</a>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="mystical-card p-10 bg-gradient-to-br from-indigo-900/20 to-transparent border-indigo-500/20 relative overflow-hidden mb-12">
               <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 pointer-events-none italic font-serif">Valeria</div>
               <div className="relative z-10">
                  <span className="text-gold-400 text-sm uppercase tracking-[0.3em] font-bold mb-4 block">✦ Messaggio per la tua Anima</span>
                  <h2 className="text-3xl font-serif text-white mb-6">Guida Settimanale Personalizzata</h2>
                  <p className="text-white/70 leading-relaxed text-lg max-w-3xl italic">
                    "Ogni settimana le stelle tessono una nuova trama. La Mentore Silente è qui per aiutarti a leggere tra le righe del cielo, trasformando i transiti in passi consapevoli verso la tua evoluzione."
                  </p>
               </div>
            </div>

            {latestHoroscope.status === 'pending_staff' ? (
              <div className="mystical-card border-gold-500/30 bg-gold-400/5 p-12 text-center animate-in fade-in zoom-in duration-700">
                 <div className="w-20 h-20 rounded-full border border-gold-400/30 flex items-center justify-center mx-auto mb-8">
                    <span className="text-4xl animate-spin-slow">✍️</span>
                 </div>
                 <h3 className="font-serif text-3xl text-white mb-4 italic">Valeria sta scrivendo per te...</h3>
                 <p className="text-white/60 mb-8 max-w-lg mx-auto leading-relaxed">
                   La tua Mentore Silente è entrata nella fase di scrittura. Valeria sta analizzando i tuoi transiti personali per questa settimana per offrirti una guida unica e profonda.
                 </p>
                 <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/60 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                    <span className="text-xs uppercase tracking-[0.2em] text-gold-200">Rilascio stimato: ~24 Ore</span>
                 </div>
              </div>
            ) : (
              <WeeklyForecast 
                content={latestHoroscope.forecast_text}
                luckyDays={latestHoroscope.lucky_days}
                energyLevel={latestHoroscope.energy_level}
              />
            )}

            <div className="mt-12 p-8 rounded-2xl border border-white/5 bg-black/40 text-center">
               <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Vuoi approfondire un transito specifico?</p>
               <a href="/area-personale/i-miei-consulti" className="text-sm text-gold-400 hover:text-gold-300 underline decoration-gold-500/30 underline-offset-8">
                  Prenota una sessione privata con Valeria →
               </a>
            </div>
          </motion.div>
        )}
      </div>
    </ClientLayout>
  )
}

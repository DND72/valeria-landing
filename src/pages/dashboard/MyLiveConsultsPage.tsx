import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { apiJson } from '../../lib/api'
import ClientLayout from '../../components/dashboard/ClientLayout'

interface MyConsult {
  id: string
  status: string
  start_at: string
  consult_kind: string
  meeting_join_url: string | null
}

export default function MyLiveConsultsPage() {
  const { getToken } = useAuth()
  const [liveConsults, setLiveConsults] = useState<MyConsult[]>([])
  const [loading, setLoading] = useState(true)

  const loadLive = useCallback(async () => {
    try {
      const res = await apiJson<{ consults: MyConsult[] }>(getToken, '/api/me/consults')
      const all = res.consults || []
      
      const now = new Date()
      // Mostriamo consulti che iniziano tra 30 min o sono già waiting/in_progress
      const filtered = all.filter(c => {
         if (c.status === 'cancelled' || c.status === 'done') return false
         if (c.status === 'client_waiting' || c.status === 'in_progress') return true
         if (!c.start_at) return false
         const start = new Date(c.start_at).getTime()
         const diffMin = (start - now.getTime()) / (1000 * 60)
         return diffMin <= 30 && diffMin > -60 // Inizia tra 30 min o iniziato da meno di 1 ora
      }).sort((a,b) => new Date(a.start_at || 0).getTime() - new Date(b.start_at || 0).getTime())
      
      setLiveConsults(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void loadLive()
    const timer = setInterval(loadLive, 15000)
    return () => clearInterval(timer)
  }, [loadLive])

  const handleCancel = async (id: string) => {
    if (!window.confirm("Sei sicura di voler annullare questa richiesta? I crediti ti verranno rimborsati subito.")) return
    try {
      await apiJson(getToken, `/api/me/consults/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action: 'cancel' })
      })
      void loadLive()
    } catch (err: any) {
      alert(err.message || "Errore durante l'annullamento")
    }
  }

  return (
    <ClientLayout title="Consulti Live ⚡" subtitle="I tuoi appuntamenti in diretta">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-gold-500/5 border border-gold-500/20 rounded-[32px] p-8 text-center relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Ponte di Connessione Real-Time</h2>
              <p className="text-white/50 text-sm max-w-lg mx-auto">
                 Qui trovi i link per accedere alle tue sessioni di oggi. Che sia una Chat, Zoom o Meet, 
                 il tuo spazio sacro è a un solo clic di distanza.
              </p>
           </div>
           {/* Decorative blurred orbit */}
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        </div>

        {loading && liveConsults.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/30 text-xs">Sincronizzazione orizzonti...</p>
          </div>
        ) : liveConsults.length === 0 ? (
          <div className="mystical-card py-20 text-center border-dashed border-white/10">
            <span className="text-4xl mb-4 block">🕯️</span>
            <p className="text-white/40 text-sm italic">Nessun consulto live rilevato al momento.</p>
            <Link to="/area-personale" className="text-gold-500 text-xs font-bold uppercase tracking-widest mt-6 inline-block hover:underline">
               Prenota un consulto ora →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {liveConsults.map((c) => {
                const isWaiting = c.status === 'client_waiting'
                const isChat = c.consult_kind?.includes('chat') || c.consult_kind === 'flash'
                const isNow = isWaiting || c.status === 'in_progress'

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`mystical-card p-6 border-2 transition-all ${isNow ? 'border-gold-500/40 bg-gold-500/[0.03] shadow-[0_0_40px_rgba(212,160,23,0.1)]' : 'border-white/5'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${isNow ? 'bg-gold-500 text-dark-500' : 'bg-white/5 text-white/30'}`}>
                            <span className="text-2xl">{isChat ? '💬' : '📹'}</span>
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="text-lg font-bold text-white uppercase tracking-tight">{isChat ? 'Live Chat Chat' : 'Consulto Video'}</h3>
                               {isNow && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                            </div>
                            <p className="text-white/40 text-sm mb-2 uppercase tracking-widest text-[10px] font-bold">
                               { (c.consult_kind || 'consulto').replace('_', ' ') }
                            </p>
                            <div className="flex items-center gap-3 text-xs font-mono text-gold-500/70">
                               <span>🕒 {new Date(c.start_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                               {isNow && <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-black tracking-tighter uppercase border border-emerald-500/20">È il tuo turno!</span>}
                            </div>
                         </div>
                      </div>

                        <div className="flex shrink-0">
                          {isChat ? (
                            <Link 
                              to={`/sessione/${c.id}`}
                              className="btn-gold px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_0_20px_rgba(212,160,23,0.2)]"
                            >
                              ENTRA NELLA CHAT
                            </Link>
                          ) : (
                            <Link 
                              to={`/video-session/${c.id}`}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                            >
                              ENTRA IN VIDEO
                            </Link>
                          )}
                        </div>
                    </div>
                    {(isNow || c.status === 'scheduled') && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                         <button 
                           onClick={() => handleCancel(c.id)}
                           className="text-[9px] text-white/20 hover:text-red-400/60 uppercase tracking-widest font-bold transition-colors"
                         >
                           {isNow ? 'Interrompi / Annulla ✕' : 'Annulla Prenotazione ✕'}
                         </button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        <div className="pt-10 border-t border-white/5">
           <h4 className="text-white/20 text-xs uppercase tracking-[0.3em] font-bold text-center mb-6">Come orientarti</h4>
           <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Chat Flash', desc: 'Entra subito, scrivi le tue domande e ricevi risposte in tempo reale.' },
                { title: 'Zoom / Meet', desc: 'Se hai prenotato un consulto video, il link apparirà qui 15 minuti prima.' },
                { title: 'Rispetto', desc: 'Ogni minuto è sacro. Assicurati che la tua connessione sia stabile.' }
              ].map(info => (
                <div key={info.title} className="text-center p-4">
                   <p className="text-gold-500/80 font-serif text-sm font-bold mb-2">{info.title}</p>
                   <p className="text-white/30 text-[11px] leading-relaxed">{info.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </ClientLayout>
  )
}

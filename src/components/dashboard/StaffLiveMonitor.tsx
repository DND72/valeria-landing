import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { apiJson } from '../../lib/api'

interface Consult {
  id: string
  status: string
  start_at: string
  invitee_name: string | null
  invitee_email: string | null
  consult_kind: string
  meeting_join_url: string | null
  status_billing?: string
}

export default function StaffLiveMonitor() {
  const { getToken } = useAuth()
  const [liveConsults, setLiveConsults] = useState<Consult[]>([])
  const [loading, setLoading] = useState(true)
  const [alarmActive, setAlarmActive] = useState(false)
  
  const alarmAudio = useRef<HTMLAudioElement | null>(null)
  
  useEffect(() => {
     alarmAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1232/1232-preview.mp3')
  }, [])

  const loadLive = useCallback(async () => {
    try {
      const res = await apiJson<{ consults: Consult[] }>(getToken, '/api/staff/consults')
      const all = res.consults || []
      
      const now = new Date()
      // Definiamo "oggi" come la data locale YYYY-MM-DD
      const localToday = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
      
      const filtered = all.filter(c => {
         const s = (c.status || '').toLowerCase()
         if (s === 'cancelled' || s === 'done' || c.status_billing === 'billed') return false
         
         // Se è in attesa o in corso, mostralo SEMPRE
         if (s === 'client_waiting' || s === 'in_progress') return true
         
         const isToday = c.start_at?.startsWith(localToday)
         return isToday
      }).sort((a,b) => {
         if (a.status === 'client_waiting' && b.status !== 'client_waiting') return -1
         if (b.status === 'client_waiting' && a.status !== 'client_waiting') return 1
         return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      })
      
      
      const hasWaiting = filtered.some(c => c.status === 'client_waiting')
      setAlarmActive(hasWaiting)
      
      setLiveConsults(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    if (alarmActive && alarmAudio.current) {
       alarmAudio.current.loop = true
       void alarmAudio.current.play().catch(() => {})
    } else if (alarmAudio.current) {
       alarmAudio.current.pause()
       alarmAudio.current.currentTime = 0
    }
    return () => alarmAudio.current?.pause()
  }, [alarmActive])

  useEffect(() => {
     void loadLive()
     const timer = setInterval(loadLive, 5000) // Polling più rapido per non perdere chiamate
     return () => clearInterval(timer)
  }, [loadLive])

  const handleSaveLink = async (id: string, link: string) => {
    try {
      await apiJson(getToken, `/api/staff/consults/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ meeting_link: link || null }),
      })
      void loadLive()
    } catch {
      alert('Errore nel salvataggio link')
    }
  }

  const handleReject = async (id: string) => {
    if (!window.confirm("Confermi di voler rifiutare/annullare questo consulto? I crediti verranno rimborsati interamente al cliente.")) return
    try {
      await apiJson(getToken, `/api/staff/consults/${id}/reject`, { method: 'POST' })
      void loadLive()
    } catch {
      alert('Errore durante l\'annullamento')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Monitor Live 📡</h2>
          <p className="text-white/45 text-sm">Gestioni consulti in diretta, chat e videochiamate odierne.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${alarmActive ? 'bg-red-500 animate-pulse border-2 border-white' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
           <span className={`w-2 h-2 rounded-full ${alarmActive ? 'bg-white' : 'bg-emerald-500 animate-ping'}`} />
           <span className={`text-[10px] uppercase font-black tracking-widest ${alarmActive ? 'text-white' : 'text-emerald-400'}`}>
              {alarmActive ? '🔔 ALLARME CHIAMATA' : 'Monitor Attivo'}
           </span>
        </div>
      </div>

      {loading && liveConsults.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/30 text-sm">Sincronizzazione frequenze...</p>
        </div>
      ) : liveConsults.length === 0 ? (
        <div className="mystical-card py-20 text-center border-dashed border-white/10">
          <p className="text-white/30 text-sm italic">Nessun consulto attivo o programmato per ora.</p>
          <p className="text-[10px] text-white/20 uppercase mt-2 tracking-widest">Resta online per ricevere chiamate flash</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {liveConsults.map((c) => {
            const isWaiting = c.status === 'client_waiting'
            const isChat = c.consult_kind?.includes('chat') || c.consult_kind === 'flash'
            
            return (
              <motion.div 
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mystical-card p-6 border-2 transition-all ${isWaiting ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/5'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isWaiting ? 'bg-emerald-500 text-dark-500' : 'bg-white/5 text-white/40'}`}>
                       <span className="text-2xl">{isChat ? '💬' : '🎥'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{c.invitee_name || 'Anima in Cammino'}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isWaiting ? 'bg-emerald-500 text-dark-500' : 'bg-white/10 text-white/40'}`}>
                           {isWaiting ? 'IN ATTESA ORA' : c.status}
                        </span>
                      </div>
                      <p className="text-white/40 text-sm mb-2">{c.invitee_email || 'Richiesta immediata'}</p>
                      <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-gold-500/60">
                         <span>🕒 {new Date(c.start_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                         <span>✨ {(c.consult_kind || 'consulto').toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isChat ? (
                      <div className="flex flex-col gap-3">
                        <Link 
                          to={`/sessione/${c.id}`}
                          className={`px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] transition-all text-sm ${isWaiting ? 'bg-emerald-500 text-dark-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-gold-500 text-dark-500'}`}
                        >
                          ENTRA IN CHAT
                        </Link>
                        <button 
                           onClick={() => handleReject(c.id)}
                           className="text-[10px] text-center text-red-400/60 hover:text-red-400 font-bold uppercase tracking-widest"
                         >
                           Annulla Consulto ✕
                         </button>
                         {c.status === 'in_progress' && (
                            <button 
                               onClick={async () => {
                                  if (window.confirm("Vuoi terminare e incassare ora?")) {
                                     try {
                                        await apiJson(getToken, `/api/staff/consults/${c.id}/claim`, { method: 'POST' })
                                        void loadLive()
                                     } catch (e: any) { alert(e.message || "Errore") }
                                  }
                               }}
                               className="text-[10px] text-center bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded hover:bg-red-500/20 transition-all font-black uppercase tracking-widest mt-1"
                            >
                               Termina e Incassa 💰
                            </button>
                         )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                         {c.meeting_join_url ? (
                           <div className="flex flex-col gap-2">
                             <a 
                               href={c.meeting_join_url} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold text-sm text-center transition-all shadow-lg"
                             >
                                AVVIA VIDEOCHIAMATA
                             </a>
                             <button
                               onClick={() => {
                                 const link = window.prompt("Modifica link Zoom/Meet:", c.meeting_join_url || '')
                                 if (link !== null) void handleSaveLink(c.id, link.trim())
                               }}
                               className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest font-bold"
                             >
                                Modifica Link ✎
                             </button>
                             {c.status === 'in_progress' && (
                                <button 
                                   onClick={async () => {
                                      if (window.confirm("Vuoi terminare e incassare ora?")) {
                                         try {
                                            await apiJson(getToken, `/api/staff/consults/${c.id}/claim`, { method: 'POST' })
                                            void loadLive()
                                         } catch (e: any) { alert(e.message || "Errore") }
                                      }
                                   }}
                                   className="text-[10px] text-center bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded hover:bg-red-500/20 transition-all font-black uppercase tracking-widest mt-1"
                                >
                                   Termina e Incassa 💰
                                </button>
                             )}
                           </div>
                         ) : (
                           <button 
                             onClick={() => {
                               const link = window.prompt("Inserisci link Zoom/Meet per il cliente:")
                               if (link) void handleSaveLink(c.id, link.trim())
                             }}
                             className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all border border-white/10"
                           >
                              + AGGIUNGI LINK VIDEO
                           </button>
                         )}
                         <button 
                           onClick={() => handleReject(c.id)}
                           className="text-[10px] text-red-400/60 hover:text-red-400 font-bold uppercase tracking-widest mt-2"
                         >
                           Rifiuta / Annulla ✕
                         </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

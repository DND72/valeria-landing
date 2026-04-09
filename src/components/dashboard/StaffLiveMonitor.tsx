import { useState, useEffect, useCallback } from 'react'
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
  service_kind: string
  meeting_join_url: string | null
}

export default function StaffLiveMonitor() {
  const { getToken } = useAuth()
  const [liveConsults, setLiveConsults] = useState<Consult[]>([])
  const [loading, setLoading] = useState(true)

  const loadLive = useCallback(async () => {
    try {
      const all = await apiJson<Consult[]>(getToken, '/api/staff/consults')
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      
      const filtered = all.filter(c => {
         const isWaiting = c.status === 'client_waiting' || c.status === 'in_progress'
         const isToday = c.start_at?.startsWith(today)
         return isWaiting || isToday
      }).sort((a,b) => {
         if (a.status === 'client_waiting') return -1
         if (b.status === 'client_waiting') return 1
         return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      })
      
      setLiveConsults(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void loadLive()
    const timer = setInterval(loadLive, 10000)
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Monitor Live 📡</h2>
          <p className="text-white/45 text-sm">Gestioni consulti in diretta, chat e videochiamate odierne.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
           <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">Monitor Attivo</span>
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
            const isChat = c.service_kind?.startsWith('chat_') || c.service_kind === 'flash'
            
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
                         <span>✨ {(c.service_kind || 'consulto').toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isChat ? (
                      <Link 
                        to={`/sessione/${c.id}`}
                        className={`px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] transition-all text-sm ${isWaiting ? 'bg-emerald-500 text-dark-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-gold-500 text-dark-500'}`}
                      >
                        ENTRA IN CHAT
                      </Link>
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

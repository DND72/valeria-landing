import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import { apiJson } from '../lib/api'

interface Message {
  id: string
  role: 'valeria' | 'client'
  text: string
  file_url?: string
  timestamp: Date
}

export default function LiveSessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()
  const isStaff = user?.publicMetadata?.role === 'staff'
  
  const [isAccepted, setIsAccepted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [seconds, setSeconds] = useState(0)
  const [isEnding, setIsEnding] = useState(false)
  const [otherIsTyping, setOtherIsTyping] = useState(false)
  const [waitSeconds, setWaitSeconds] = useState(300)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Suoni
  const audioRefs = useRef({
    send: new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'),
    receive: new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')
  })

  // Timer Sessione (quando accettata)
  useEffect(() => {
    if (!isAccepted || !sessionInfo?.actual_start_at) return
    const startAt = new Date(sessionInfo.actual_start_at).getTime()
    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.floor((now - startAt) / 1000)
      setSeconds(diff > 0 ? diff : 0)
    }, 1000)
    return () => clearInterval(interval)
  }, [isAccepted, sessionInfo?.actual_start_at])

  // Scroll automatico
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Segnale di Entrata Cliente
  useEffect(() => {
     if (isStaff || !id) return
     void apiJson(getToken, `/api/booking/session/${id}/enter`, { method: 'POST' }).catch(() => {})
  }, [id, isStaff, getToken])

  // POLLING MESSAGGI E STATUS
  useEffect(() => {
    if (!id) return
    const fetchMessages = async () => {
       try {
          const res = await apiJson<{ 
             messages: any[], 
             typing?: { staff: boolean, client: boolean },
             sessionInfo?: any 
          }>(getToken, `/api/booking/session/${id}/messages`)

          if (res.messages) {
             const newMsgs = res.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
             if (newMsgs.length > messages.length) {
                if (newMsgs[newMsgs.length-1].role !== (isStaff ? 'valeria' : 'client')) {
                    void audioRefs.current.receive.play().catch(() => {})
                }
             }
             setMessages(newMsgs)
          }
          if (res.typing) {
             setOtherIsTyping(isStaff ? res.typing.client : res.typing.staff)
          }
          if (res.sessionInfo) {
             setSessionInfo(res.sessionInfo)
             if (res.sessionInfo.status === 'in_progress') {
                setIsAccepted(true)
             }
             if (res.sessionInfo.status === 'done' || res.sessionInfo.status === 'cancelled') {
                if (!isEnding) {
                   alert("Il consulto è terminato.")
                   navigate(isStaff ? '/control-room' : '/area-personale')
                }
             }
          }
       } catch (err) { console.error('[chat poll]', err) }
    }
    void fetchMessages()
    const poll = setInterval(fetchMessages, 3000)
    return () => clearInterval(poll)
  }, [id, messages.length, isStaff, getToken, navigate, isEnding])

  // CountDown Attesa Cliente
  useEffect(() => {
    if (isAccepted || !sessionInfo || isStaff) return
    const interval = setInterval(() => {
      const start = new Date(sessionInfo.created_at || Date.now()).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - start) / 1000)
      const remaining = Math.max(0, 300 - elapsed)
      setWaitSeconds(remaining)
    }, 1000)
    return () => clearInterval(interval)
  }, [isAccepted, sessionInfo, isStaff])

  // Typing signal
  useEffect(() => {
     if (!inputText.trim() || !id) return
     void apiJson(getToken, `/api/booking/session/${id}/typing`, {
        method: 'POST',
        body: JSON.stringify({ role: isStaff ? 'valeria' : 'client' })
     }).catch(() => {})
  }, [inputText, id, isStaff, getToken])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !id) return
    const text = inputText
    setInputText('')
    try {
       void audioRefs.current.send.play().catch(() => {})
       const role = isStaff ? 'valeria' : 'client'
       await apiJson(getToken, `/api/booking/session/${id}/messages`, {
          method: 'POST',
          body: JSON.stringify({ text, role })
       })
       // Ottimistico
       setMessages(prev => [...prev, { id: 'temp-'+Date.now(), role, text, timestamp: new Date() }])
    } catch (err) {
       alert("Errore nell'invio.")
    }
  }

  const handleAcceptSession = async () => {
    try {
      await apiJson(getToken, `/api/booking/session/${id}/accept`, { method: 'POST' })
      setIsAccepted(true)
    } catch {
      alert("Errore accettazione.")
    }
  }

  const handleClaimSession = async () => {
    if (!window.confirm("Sei sicura di voler terminare il consulto e incassare i crediti?")) return
    setIsEnding(true)
    try {
      const actualMinutes = Math.floor(seconds / 60)
      await apiJson(getToken, `/api/staff/consults/${id}/claim`, { 
        method: 'POST',
        body: JSON.stringify({ actualDurationMinutes: actualMinutes })
      })
      navigate('/control-room')
    } catch (e: any) {
      alert(e.message || "Errore incasso.")
      setIsEnding(false)
    }
  }

  const handleManualExit = () => {
    if (isAccepted) {
      if (!window.confirm("Il consulto è in corso. Vuoi davvero uscire? (Il tempo continuerà a scorrere)")) return
    }
    navigate(isStaff ? '/control-room' : '/area-personale')
  }

  const currentTotalCost = sessionInfo ? Math.floor((seconds / 60) * (sessionInfo.cost_credits / (sessionInfo.expected_duration || 30))) : 0

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#050810] flex flex-col z-[10000] overflow-hidden text-white font-sans selection:bg-gold-500/30">
      {/* Sfondo Immersivo */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
         <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-violet-900/20 to-transparent" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse" />
      </div>

      {/* HEADER: Floating Glass Header */}
      <header className="relative z-50 h-20 shrink-0 px-6 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-2xl">
         <div className="flex items-center gap-4">
            <div className="relative">
               <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 p-0.5 overflow-hidden">
                  <img src="/valeria-avatar.jpg" alt="V" className="w-full h-full rounded-full object-cover" />
               </div>
               <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
            </div>
            <div>
               <h1 className="text-sm font-serif font-black tracking-widest uppercase text-white">Valeria Di Pace</h1>
               <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAccepted ? 'bg-emerald-500 animate-pulse' : 'bg-gold-500'}`} />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                     {isAccepted ? 'Consulto in Corso' : 'Ponte di Connessione'}
                  </span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            {isAccepted && (
               <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                  <span className="text-gold-400 font-mono font-black text-sm">
                     {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                  </span>
                  <div className="h-4 w-px bg-white/10" />
                  <span className="text-[10px] text-white/40 uppercase font-black">
                     {currentTotalCost} / {sessionInfo?.cost_credits || 0} CR
                  </span>
               </div>
            )}

            {!isAccepted && isStaff && (
               <button 
                  onClick={handleAcceptSession}
                  className="bg-emerald-500 hover:bg-emerald-400 text-dark-900 px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
               >
                  Accetta Consulto
               </button>
            )}

            {isAccepted && isStaff && (
               <button 
                  onClick={handleClaimSession}
                  className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg font-bold uppercase text-[9px] tracking-widest transition-all border border-red-500/30 active:scale-95"
               >
                  Termina Chat
               </button>
            )}

            <button 
               onClick={handleManualExit}
               className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
               title="Esci dalla stanza"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
         </div>
      </header>

      {/* MAIN: Chat Area */}
      <main className="relative z-10 flex-1 flex flex-col min-h-0">
         {/* Overlay Attesa Cliente */}
         {!isAccepted && !isStaff && (
            <div className="absolute inset-0 z-40 bg-[#050810]/80 backdrop-blur-3xl flex items-center justify-center p-6 text-center">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-md"
               >
                  <div className="w-24 h-24 mx-auto mb-8 relative">
                     <div className="absolute inset-0 border-4 border-gold-500/10 rounded-full animate-ping" />
                     <div className="absolute inset-0 border-4 border-gold-500/20 rounded-full animate-pulse" />
                     <div className="absolute inset-4 rounded-full bg-gold-500/10 flex items-center justify-center text-4xl">🧘</div>
                  </div>
                  <h2 className="text-3xl font-serif font-black text-white mb-4 italic tracking-tight">Valeria sta arrivando...</h2>
                  <p className="text-white/60 text-sm mb-8 leading-relaxed font-light">
                     Il tempo per il tuo consulto inizierà a scalare solo quando lei accetterà la conversazione. <br/>
                     Mettiti comoda e prepara il tuo cuore.
                  </p>
                  <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 uppercase font-black text-[10px] tracking-[0.2em] text-gold-500/80">
                     <span>Frequenza in attesa</span>
                     <div className="w-1 h-1 bg-gold-500 rounded-full animate-ping" />
                     <span>{waitSeconds}s</span>
                  </div>
               </motion.div>
            </div>
         )}

         {/* Liste Messaggi */}
         <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 scroll-smooth custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8">
               <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                     <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.role === 'valeria' ? 'justify-start' : 'justify-end'}`}
                     >
                        <div className={`group relative max-w-[85%] md:max-w-[70%] ${
                           msg.role === 'valeria' 
                              ? 'bg-gradient-to-br from-violet-900/40 to-dark-900 rounded-2xl rounded-tl-none border border-violet-500/20' 
                              : 'bg-gradient-to-br from-gold-900/20 to-black border border-gold-500/10 rounded-2xl rounded-tr-none'
                        } p-5 shadow-2xl`}>
                           {msg.role === 'valeria' && (
                              <p className="text-[8px] uppercase font-black tracking-widest text-violet-400 mb-2">Valeria</p>
                           )}
                           <p className="text-sm md:text-base leading-relaxed text-white/90 whitespace-pre-wrap">{msg.text}</p>
                           
                           {msg.file_url && (
                              <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                                 <img src={msg.file_url} alt="Attached" className="max-w-full h-auto" />
                              </div>
                           )}

                           <p className="text-[9px] text-white/30 mt-3 flex items-center gap-2 justify-end">
                              {msg.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                              {msg.role !== 'valeria' && <span className="text-emerald-500">✓✓</span>}
                           </p>
                        </div>
                     </motion.div>
                  ))}

                  {otherIsTyping && (
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-start"
                     >
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex gap-1 items-center">
                           <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1 h-1 bg-white/40 rounded-full" />
                           <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1 h-1 bg-white/40 rounded-full" />
                           <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1 h-1 bg-white/40 rounded-full" />
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
               <div ref={scrollRef} />
            </div>
         </div>
      </main>

      {/* FOOTER: Chat Input Area */}
      <footer className="relative z-50 h-[100px] shrink-0 bg-black/80 backdrop-blur-3xl border-t border-white/5 px-6 flex items-center justify-center">
         <div className="max-w-4xl w-full">
            {(isAccepted || isStaff) ? (
               <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                  <div className="flex-1 relative flex items-center">
                     <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute left-3 w-8 h-8 flex items-center justify-center text-white/30 hover:text-gold-400 hover:bg-white/5 rounded-lg transition-all"
                     >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                           // TODO: Implement actual upload
                           const file = e.target.files?.[0]
                           if (file) alert("L'invio files sarà attivo tra pochi istanti.")
                        }}
                     />
                     <textarea 
                        rows={1}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              void handleSendMessage(e as any)
                           }
                        }}
                        placeholder="Inizia a scrivere la tua domanda..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-14 py-3 text-sm text-white placeholder:text-white/20 focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 outline-none transition-all resize-none max-h-32"
                     />
                     <button 
                        type="submit"
                        disabled={!inputText.trim()}
                        className="absolute right-3 w-10 h-10 flex items-center justify-center bg-gold-500 disabled:bg-white/5 text-dark-900 disabled:text-white/20 rounded-xl transition-all shadow-lg active:scale-95"
                     >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                     </button>
                  </div>
               </form>
            ) : (
               <div className="text-center font-black uppercase text-[10px] tracking-[0.3em] text-white/20 animate-pulse">
                  Attendi l'accettazione per scrivere nel canale
               </div>
            )}
            <p className="text-[9px] text-center text-white/20 uppercase tracking-[0.2em] mt-3">
               Canale Criptato Militare · Sessione in Tempo Reale
            </p>
         </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,160,23,0.3); }
         input[type="file"]::file-selector-button { display: none; }
      `}} />
    </div>
  )
}

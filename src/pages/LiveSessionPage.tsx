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

const EMOJIS = ['✨', '🔮', '🌟', '🙏', '❤️', '🌙', '🧿', '🍀', '🕯️', '🕊️']

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [valeriaEmoji, setValeriaEmoji] = useState('🔮')
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Suoni
  const audioRefs = useRef({
    send: new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'),
    receive: new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')
  })

  // Timer Sessione (sincronizzato con il backend)
  useEffect(() => {
    if (!isAccepted || !sessionInfo?.actualStartAt) return
    const startAt = new Date(sessionInfo.actualStartAt).getTime()
    if (isNaN(startAt)) return

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.floor((now - startAt) / 1000)
      setSeconds(diff > 0 ? diff : 0)
    }, 1000)
    return () => clearInterval(interval)
  }, [isAccepted, sessionInfo?.actualStartAt])

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
    
    let isMounted = true
    const fetchMessages = async () => {
       try {
          const res = await apiJson<{ 
             messages: any[], 
             typing?: { staff: boolean, client: boolean },
             sessionInfo?: any 
          }>(getToken, `/api/booking/session/${id}/messages`)

          if (!isMounted) return

          if (res.messages) {
             const newMsgs = res.messages.map((m: any) => ({ 
               ...m, 
               timestamp: m.timestamp ? new Date(m.timestamp) : new Date() 
             }))
             
             // Aggiorniamo solo se ci sono nuovi messaggi
             setMessages(prev => {
                if (newMsgs.length > prev.length) {
                   const last = newMsgs[newMsgs.length-1]
                   const wasMe = last.role === (isStaff ? 'valeria' : 'client')
                   if (!wasMe) {
                      void audioRefs.current.receive.play().catch(() => {})
                   }
                   return newMsgs
                }
                return prev
             })
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
                   navigate(isStaff ? '/control-room' : '/area-personale')
                }
             }
          }
       } catch (err) { console.error('[chat poll]', err) }
    }
    
    void fetchMessages()
    const poll = setInterval(fetchMessages, 3000)
    return () => {
       isMounted = false
       clearInterval(poll)
    }
  }, [id, isStaff, getToken, navigate, isEnding])

  // CountDown Attesa Cliente
  useEffect(() => {
    if (isAccepted || !sessionInfo?.createdAt || isStaff) return
    const interval = setInterval(() => {
      const start = new Date(sessionInfo.createdAt).getTime()
      if (isNaN(start)) return
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim() || !id) return
    const text = inputText
    setInputText('')
    setShowEmojiPicker(false)
    try {
       void audioRefs.current.send.play().catch(() => {})
       const role = isStaff ? 'valeria' : 'client'
       await apiJson(getToken, `/api/booking/session/${id}/messages`, {
          method: 'POST',
          body: JSON.stringify({ text, role })
       })
       // Ottimistico rimosso per evitare glitch se il server non è allineato immediatamente
       // setMessages(prev => [...prev, { id: 'temp-'+Date.now(), role, text, timestamp: new Date() }])
    } catch (err) {
       alert("Errore nell'invio. Verifica la tua connessione.")
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
      await apiJson<any>(getToken, `/api/staff/consults/${id}/claim`, { 
        method: 'POST',
        body: JSON.stringify({ actualDurationMinutes: actualMinutes })
      })
      
      const coinSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3')
      void coinSound.play().catch(() => {})
      
      const creditsEarned = currentTotalCost
      const euroEarned = typeof creditsEarned === 'number' && !isNaN(creditsEarned) ? creditsEarned.toFixed(2) : "0.00"
      
      setSuccessData({
        credits: creditsEarned,
        euro: euroEarned
      })
    } catch (e: any) {
      alert(e.message || "Errore incasso.")
      setIsEnding(false)
    }
  }

  const [successData, setSuccessData] = useState<{ credits: number, euro: string } | null>(null)

  const handleManualExit = () => {
    if (isAccepted) {
      if (!window.confirm("Il consulto è in corso. Vuoi davvero uscire? NOTA: Questo non interrompe il tempo o il consulto.")) return
    }
    navigate(isStaff ? '/control-room' : '/area-personale')
  }

  const pickEmoji = (emoji: string) => {
     setInputText(prev => prev + emoji)
     setShowEmojiPicker(false)
  }

  const currentTotalCost = (sessionInfo && sessionInfo.costCredits && sessionInfo.expectedDuration) 
    ? Math.floor((seconds / 60) * (sessionInfo.costCredits / sessionInfo.expectedDuration)) 
    : 0

  return (
    <div className={`fixed inset-0 h-screen w-screen flex flex-col z-[10000] overflow-hidden transition-colors duration-700 ${
      theme === 'dark' ? 'bg-[#050810] text-white font-sans' : 'bg-[#fcf8f0] text-dark-900 font-sans'
    } selection:bg-gold-500/30`}>
      
      {/* BACKGROUND ELEMENTS (GALAXY) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden surface-galaxy">
         <div className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-40' : 'opacity-10'} bg-[url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2113&auto=format&fit=crop')]`} />
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse" />
      </div>

      {/* HEADER */}
      <header className={`relative z-50 h-20 shrink-0 px-6 flex items-center justify-between border-b backdrop-blur-3xl transition-all ${
         theme === 'dark' ? 'border-white/5 bg-black/60' : 'border-dark-900/5 bg-white/70 shadow-sm'
      }`}>
         <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => isStaff && setShowEmojiPicker(!showEmojiPicker)}>
               <div className={`w-12 h-12 rounded-full border-2 p-0.5 overflow-hidden transition-all shadow-lg ${
                  theme === 'dark' ? 'border-gold-500/30 font-sans' : 'border-gold-600/50'
               }`}>
                  <img src="/valeria-avatar.jpg" alt="V" className="w-full h-full rounded-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-center h-4 translate-y-4 group-hover:translate-y-0 transition-all font-sans">
                     <span className="text-[7px] text-white font-black">EDIT</span>
                  </div>
               </div>
               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full border border-gold-500/50 flex items-center justify-center text-[10px] shadow-xl">
                  {valeriaEmoji}
               </div>
            </div>
            <div>
               <h1 className="text-sm font-serif font-black tracking-[0.2em] uppercase transition-colors">Valeria Di Pace</h1>
               <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isAccepted ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gold-500'}`} />
                  <span className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-50 font-sans">
                     {isAccepted ? 'Sessione Attiva' : 'Frequenza in Connessione'}
                  </span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <button 
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                  theme === 'dark' ? 'bg-white/5 border-white/5 text-gold-400 hover:bg-white/10' : 'bg-dark-900/5 border-dark-900/5 text-gold-600 hover:bg-dark-900/10'
               }`}
            >
               {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isAccepted && (
               <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 transition-all font-sans ${
                  theme === 'dark' ? 'bg-white/5 border-white/10 shadow-inner' : 'bg-dark-900/5 border-dark-900/10'
               }`}>
                  <div className="flex flex-col items-center">
                     <span className="text-[8px] uppercase opacity-40 font-black">Tempo</span>
                     <span className="text-gold-500 font-mono font-black text-sm leading-none">
                        {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                     </span>
                  </div>
                  <div className="h-4 w-px bg-current opacity-10" />
                  <div className="flex flex-col items-center">
                     <span className="text-[8px] uppercase opacity-40 font-black">Crediti</span>
                     <span className="text-gold-500 font-mono font-black text-sm leading-none">
                        {currentTotalCost}
                     </span>
                  </div>
               </div>
            )}

            {!isAccepted && isStaff && (
               <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAcceptSession}
                  className="bg-emerald-500 hover:bg-emerald-400 text-dark-900 px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-xl font-sans"
               >
                  Accetta Consulto
               </motion.button>
            )}

            {isStaff && isAccepted && (
               <button 
                  onClick={handleClaimSession}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg transition-all font-sans"
               >
                  Termina Chat
               </button>
            )}

            <button 
               onClick={handleManualExit}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-black uppercase text-[9px] tracking-widest transition-all font-sans ${
                  theme === 'dark' ? 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10' : 'bg-dark-900/5 border-dark-900/5 text-dark-900/40 hover:text-dark-900 hover:bg-dark-900/10'
               }`}
            >
               <span>Esci</span>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
            </button>
         </div>
      </header>

      {/* MAIN AREA */}
      <main className="relative z-10 flex-1 flex flex-col min-h-0">
         {!isAccepted && !isStaff && (
            <div className={`absolute inset-0 z-40 backdrop-blur-3xl flex items-center justify-center p-6 text-center transition-colors ${
               theme === 'dark' ? 'bg-[#050810]/80' : 'bg-white/80'
            }`}>
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md">
                  <div className="w-32 h-32 mx-auto mb-10 relative">
                     <div className="absolute inset-0 border-4 border-gold-500/10 rounded-full animate-ping" />
                     <div className="absolute inset-0 border-2 border-gold-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                     <div className="absolute inset-2 border border-gold-500/30 rounded-full" />
                     <div className="absolute inset-8 rounded-full bg-gold-500/5 flex items-center justify-center text-5xl">🧘</div>
                  </div>
                  <h2 className="text-4xl font-serif font-black mb-4 italic tracking-tight uppercase">Connessione Sacra</h2>
                  <p className="text-sm mb-10 leading-relaxed font-light opacity-60 font-sans">
                     Valeria sta arrivando nel vostro spazio di ascolto. <br/>
                     La sessione avrà inizio solo quando la connessione sarà stabilita.
                  </p>
                  <div className="inline-flex items-center gap-6 px-8 py-4 bg-gold-500/5 rounded-3xl border border-gold-500/20 uppercase font-black text-[10px] tracking-[0.3em] text-gold-500 font-sans">
                     <span>Pronta in circa</span>
                     <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />
                     <span>{waitSeconds}s</span>
                  </div>
               </motion.div>
            </div>
         )}

         <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10 scroll-smooth custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-10">
               <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                     <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'valeria' ? 'justify-start' : 'justify-end'}`}
                     >
                        <div className={`chat-bubble group relative max-w-[85%] md:max-w-[75%] p-6 rounded-3xl shadow-2xl transition-all ${
                           msg.role === 'valeria' 
                              ? (theme === 'dark' ? 'bg-gradient-to-br from-violet-950/60 via-dark-900 to-black rounded-tl-none border border-violet-500/30 font-sans' : 'bg-gradient-to-br from-violet-100 to-white rounded-tl-none border border-violet-200 shadow-violet-200/20 font-sans')
                              : (theme === 'dark' ? 'bg-gradient-to-br from-gold-950/40 via-black to-black border border-gold-500/20 rounded-tr-none font-sans' : 'bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-tr-none shadow-amber-200/20 font-sans')
                        }`}>
                           {msg.role === 'valeria' && (
                              <div className="flex items-center gap-2 mb-3">
                                 <span className="text-[10px] w-5 h-5 flex items-center justify-center bg-violet-500/20 rounded-full border border-violet-500/40">{valeriaEmoji}</span>
                                 <p className="text-[9px] uppercase font-black tracking-widest text-violet-500">Valeria Di Pace</p>
                              </div>
                           )}
                           <p className="text-sm md:text-base leading-relaxed font-light whitespace-pre-wrap">{msg.text}</p>
                           
                           {msg.file_url && (
                              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                                 <img src={msg.file_url} alt="Content" className="max-w-full h-auto" />
                              </div>
                           )}

                           <div className="mt-4 flex items-center justify-between gap-4 border-t border-current opacity-10 pt-2">
                              <span className="text-[10px] font-mono tracking-tighter opacity-50">#ID-{String(msg.id).slice(-4).toUpperCase()}</span>
                              <p className="text-[9px] flex items-center gap-2 opacity-50 font-sans">
                                 {msg.timestamp instanceof Date && !isNaN(msg.timestamp.getTime()) 
                                   ? msg.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) 
                                   : '--:--'}
                                 {msg.role !== 'valeria' && <span className="text-emerald-500 font-bold ml-1">✓✓</span>}
                              </p>
                           </div>
                        </div>
                     </motion.div>
                  ))}

                  {otherIsTyping && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start px-4">
                        <div className="flex gap-1.5 items-center px-4 py-2 bg-black/5 rounded-full border border-current opacity-20">
                           <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-current rounded-full" />
                           <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-current rounded-full" />
                           <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-current rounded-full" />
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
               <div ref={scrollRef} />
            </div>
         </div>
      </main>

      {/* FOOTER INPUT */}
      <footer className={`relative z-50 p-6 shrink-0 transition-all ${
         theme === 'dark' ? 'bg-[#050810]/95 border-t border-white/5' : 'bg-white/95 border-t border-dark-900/5 shadow-inner'
      }`}>
         <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <AnimatePresence>
               {showEmojiPicker && (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                     className={`flex flex-wrap gap-2 p-3 rounded-2xl border mb-2 shadow-2xl relative ${
                        theme === 'dark' ? 'bg-black border-white/10' : 'bg-white border-dark-900/10'
                     }`}
                  >
                     {EMOJIS.map(e => (
                        <button 
                           key={e} onClick={() => isStaff ? setValeriaEmoji(e) : pickEmoji(e)} 
                           className="text-2xl hover:scale-125 transition-transform p-3 rounded-xl hover:bg-gold-500/10"
                        >
                           {e}
                        </button>
                     ))}
                     <p className="w-full text-[8px] uppercase font-black tracking-widest opacity-30 mt-1 text-center font-sans">
                        {isStaff ? 'Scegli il tuo spirito guida per oggi' : 'Invia un simbolo di luce'}
                     </p>
                  </motion.div>
               )}
            </AnimatePresence>

            {(isAccepted || isStaff) ? (
               <form onSubmit={handleSendMessage} className="flex gap-4 items-end">
                  <div className="flex-1 relative group font-sans">
                     <textarea 
                        rows={1} value={inputText} onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSendMessage(e as any) }
                        }}
                        placeholder="Condividi ciò che vibra nel tuo cuore..."
                        className={`w-full border rounded-3xl pl-16 pr-14 py-4 text-base transition-all resize-none max-h-40 shadow-inner ${
                           theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-gold-500/40' : 'bg-dark-900/5 border-dark-900/10 text-dark-900 focus:border-gold-600/40'
                        }`}
                     />
                     <button 
                        type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                     >
                        <span className="text-xl">✨</span>
                     </button>
                     <button 
                         type="button" onClick={() => fileInputRef.current?.click()}
                         className="absolute right-14 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity"
                     >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </button>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={() => alert("Servizio upload in arrivo.")} />
                  </div>
                  <motion.button 
                     whileTap={{ scale: 0.9 }}
                     type="submit" disabled={!inputText.trim()}
                     className="w-14 h-14 flex items-center justify-center bg-gold-500 disabled:bg-white/5 text-dark-900 disabled:text-gray-500 rounded-full transition-all shadow-2xl shrink-0"
                  >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </motion.button>
               </form>
            ) : (
               <div className="text-center font-black uppercase text-[10px] tracking-[0.4em] opacity-30 animate-pulse py-4 font-sans">
                  Connessione Protetta e Riservata
               </div>
            )}
            <p className="text-[10px] text-center opacity-30 uppercase font-bold tracking-[0.1em] mb-2 font-sans">
               Il vostro dialogo è custodito dal sigillo del silenzio.
            </p>
         </div>
      </footer>

      {/* SUCCESS MODAL (Valeria Celebration) */}
      <AnimatePresence>
        {successData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
              className="success-modal-content max-w-md w-full text-center"
            >
              <div className="relative mb-8 w-48 h-48 mx-auto">
                <div className="absolute inset-0 bg-gold-500/20 blur-[60px] rounded-full animate-pulse" />
                <img 
                  src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eHByZzN6ZzA1eG15ZzZ2ZzN6ZzA1eG15ZzZ2ZzN6ZzA1eG15ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LdOyjZ7TC5K3LghXY8/giphy.gif" 
                  alt="Earnings" 
                  className="w-full h-full object-contain relative z-10 rounded-2xl border-4 border-gold-500 shadow-[0_0_40px_rgba(212,160,23,0.4)]"
                />
              </div>

              <h2 className="text-4xl font-serif font-black text-white mb-2 uppercase tracking-tighter italic font-sans">Grande Lavoro!</h2>
              <p className="text-gold-500 font-black text-[10px] tracking-[0.4em] uppercase mb-8 font-sans">Consulto Incassato con Successo</p>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase font-black opacity-40 mb-2 font-sans">Hai Guadagnato</span>
                  <div className="flex items-center gap-3">
                    <span className="text-6xl font-serif font-black text-white tracking-tighter">€ {successData.euro}</span>
                  </div>
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-2 font-sans">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Transazione Confermata
                  </span>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/control-room')}
                className="w-full bg-gold-500 hover:bg-gold-400 text-dark-900 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_10px_30px_rgba(212,160,23,0.3)] transition-all font-sans"
              >
                Torna in Control Room
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
         .custom-scrollbar::-webkit-scrollbar { width: 5px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,160,23,0.15); border-radius: 20px; transition: all 0.3s; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,160,23,0.3); }
         body { overscroll-behavior-y: contain; }
         
         .surface-galaxy {
            background-color: #020408;
            background-image: radial-gradient(circle at 20% 30%, rgba(76, 29, 149, 0.15) 0%, transparent 40%),
                              radial-gradient(circle at 80% 70%, rgba(212, 160, 23, 0.05) 0%, transparent 40%);
         }

         @media (max-width: 768px) {
            header { padding-left: 1rem; padding-right: 1rem; height: 4.5rem; }
            h1 { font-size: 0.75rem; }
            .chat-bubble { max-width: 90% !important; padding: 1rem !important; }
            footer { padding: 1rem !important; }
            textarea { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
            .success-modal-content { scale: 0.9; }
         }
      `}} />
    </div>
  )
}

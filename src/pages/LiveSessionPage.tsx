import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

interface Message {
  id: string
  role: 'valeria' | 'client'
  text: string
  timestamp: Date
}

export default function LiveSessionPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const isStaff = user?.publicMetadata?.role === 'staff'
  
  const [isAccepted, setIsAccepted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'valeria', text: 'Benvenuta nella tua stanza di consulto. Respira profondamente, sono qui per te.', timestamp: new Date() }
  ])
  const [inputText, setInputText] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [isEnding, setIsEnding] = useState(false)
  const [isValeriaTyping, setIsValeriaTyping] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Suoni (utilizziamo suoni delicati e cristallini)
  const audioRefs = useRef({
    send: new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'),
    receive: new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')
  })

  // Timer e calcolo crediti dinamico
  useEffect(() => {
    if (!isAccepted) return
    
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isValeriaTyping, isAccepted])

  // Scroll automatico all'ultimo messaggio
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulazione indicatore di scrittura e suono ricezione (solo per demo)
  useEffect(() => {
    if (!isAccepted) return
    const timeout = setTimeout(() => {
      setIsValeriaTyping(true)
      setTimeout(() => {
        setIsValeriaTyping(false)
        audioRefs.current.receive.play().catch(() => {})
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'valeria',
          text: 'Sto analizzando i transiti nel tuo cielo di oggi...',
          timestamp: new Date()
        }])
      }, 4000)
    }, 8000)
    return () => clearTimeout(timeout)
  }, [isAccepted])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    
    audioRefs.current.send.play().catch(() => {})
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'client',
      text: inputText,
      timestamp: new Date()
    }
    
    setMessages([...messages, newMessage])
    setInputText('')
  }

  const handleEndSession = async () => {
    if (!window.confirm("Sei sicuro di voler chiudere il consulto? Il tempo verrà fermato e i crediti saranno scalati definitivamente dal tuo Wallet.")) return
    
    setIsEnding(true)
    try {
      alert(`Sessione terminata. Durata: ${Math.floor(seconds/60)}m ${seconds%60}s.`)
      navigate('/dashboard')
    } catch (e) {
      console.error(e)
      setIsEnding(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0a1128] overflow-hidden flex flex-col z-[9999]">
      {/* Sfondo Astrale Animato */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />
      </div>

      {/* Header Sessione */}
      <header className="relative z-20 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-gold-500/30 p-0.5 shadow-[0_0_8px_rgba(212,160,23,0.2)]">
            <img src="/valeria-avatar.jpg" alt="Valeria" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <h1 className="text-white font-serif text-sm">Consulto Live</h1>
            <div className="flex items-center gap-2">
              <span className={`w-1 h-1 rounded-full ${isValeriaTyping ? 'bg-gold-500 animate-ping' : isAccepted ? 'bg-emerald-500' : 'bg-white/20'}`} />
              <span className="text-[9px] uppercase tracking-widest text-white/40">
                {isValeriaTyping ? 'Valeria scrive...' : isAccepted ? 'In corso' : 'In attesa di Valeria...'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isStaff && !isAccepted && (
            <button
              onClick={() => setIsAccepted(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-dark-500 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Accetta Consulto
            </button>
          )}

          {isAccepted && (
            <div className="text-right flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <span className="text-white/30 text-[9px] uppercase tracking-tighter">Tempo</span>
              <p className="text-gold-400 font-mono font-bold text-xs">
                {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
              </p>
            </div>
          )}

          <button 
            onClick={handleEndSession}
            disabled={isEnding}
            className="text-white/40 hover:text-red-400 text-[9px] uppercase tracking-widest px-2 py-1 transition-all"
          >
            {isEnding ? '...' : 'Esci'}
          </button>
        </div>
      </header>

      {/* Area Messaggi Chat */}
      <main className="flex-1 overflow-y-auto px-6 py-8 relative z-10 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'valeria' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-xl ${
                  msg.role === 'valeria' 
                    ? 'bg-gradient-to-br from-gold-900/40 to-dark-900 border border-gold-500/20 text-white/90' 
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-white/80'
                }`}>
                   {msg.role === 'valeria' && (
                     <p className="text-[9px] uppercase tracking-widest text-gold-500 font-bold mb-1">Valeria</p>
                   )}
                   <p className="text-sm leading-relaxed">{msg.text}</p>
                   <p className="text-[9px] text-white/20 mt-2 text-right">
                     {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                </div>
              </motion.div>
            ))}
            
            {isValeriaTyping && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gold-500/10 border border-gold-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                   <div className="flex gap-1">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                   </div>
                   <span className="text-[10px] text-gold-500/70 font-bold uppercase tracking-widest">Valeria scrive...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </main>

      {/* Input Chat */}
      <footer className="relative z-20 bg-black/60 backdrop-blur-xl border-t border-white/10 p-6">
        {!isAccepted && !isStaff ? (
          <div className="max-w-3xl mx-auto text-center py-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-gold-400 text-sm font-serif">In attesa che Valeria accetti la sessione...</p>
            <p className="text-white/30 text-[10px] mt-1">Il tempo e il costo partiranno solo dopo l'accettazione.</p>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Fai la tua domanda..."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-gold-500/50 outline-none transition-all pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button type="button" className="text-white/20 hover:text-gold-400 transition-colors">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                </button>
              </div>
            </div>
            <button 
              type="submit"
              className="btn-gold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(212,160,23,0.2)]"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        )}
        <p className="text-center text-[9px] text-white/20 uppercase tracking-[0.2em] mt-4">
          Sessione crittografata · {isValeriaTyping ? 'Sconto attivo' : 'Tariffa standard'}
        </p>
      </footer>
    </div>
  )
}

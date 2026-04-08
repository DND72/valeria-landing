import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface Message {
  id: string
  role: 'valeria' | 'client'
  text: string
  timestamp: Date
}

export default function LiveSessionPage() {
  const navigate = useNavigate()
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'valeria', text: 'Benvenuta nella tua stanza di consulto. Respira profondamente, sono qui per te.', timestamp: new Date() }
  ])
  const [inputText, setInputText] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [creditsSpent, setCreditsSpent] = useState(0)
  const [isEnding, setIsEnding] = useState(false)
  const [isValeriaTyping, setIsValeriaTyping] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Suoni (utilizziamo suoni delicati e cristallini)
  const sendSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
  const receiveSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')

  // Timer e calcolo crediti dinamico
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
      
      setCreditsSpent(prev => {
        // Tariffa base: 1.4 CR / 60s = 0.0233 al secondo
        // Se Valeria scrive: Sconto 50% -> 0.7 CR / 60s = 0.0116 al secondo
        const ratePerSecond = isValeriaTyping ? (0.7 / 60) : (1.4 / 60)
        return Number((prev + ratePerSecond).toFixed(4))
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isValeriaTyping])

  // Scroll automatico all'ultimo messaggio
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulazione indicatore di scrittura e suono ricezione (solo per demo)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsValeriaTyping(true)
      setTimeout(() => {
        setIsValeriaTyping(false)
        receiveSound.play().catch(() => {})
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'valeria',
          text: 'Sto analizzando i transiti nel tuo cielo di oggi...',
          timestamp: new Date()
        }])
      }, 4000)
    }, 8000)
    return () => clearTimeout(timeout)
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    
    sendSound.play().catch(() => {})
    
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
      alert(`Sessione terminata. Durata: ${Math.floor(seconds/60)}m ${seconds%60}s. Crediti utilizzati: ${creditsSpent.toFixed(2)}`)
      navigate('/dashboard')
    } catch (e) {
      console.error(e)
      setIsEnding(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0a1128] overflow-hidden flex flex-col">
      {/* Sfondo Astrale Animato */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />
      </div>

      {/* Header Statistiche Sessione */}
      <header className="relative z-20 bg-black/40 backdrop-blur-md border-b border-gold-500/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-gold-500/50 p-0.5 shadow-[0_0_10px_rgba(212,160,23,0.3)]">
            <img src="/valeria-avatar.jpg" alt="Valeria" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <h1 className="text-white font-serif text-lg leading-tight">Consulto Live</h1>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isValeriaTyping ? 'bg-gold-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className={`text-[10px] uppercase tracking-widest font-bold ${isValeriaTyping ? 'text-gold-400' : 'text-emerald-400/80'}`}>
                {isValeriaTyping ? 'Valeria sta scrivendo... (Sconto 50% attivo)' : 'Connessione sicura'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-white/40 text-[10px] uppercase tracking-widest leading-none mb-1">Tempo</p>
            <p className="text-gold-400 font-mono font-bold text-xl">
              {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] uppercase tracking-widest leading-none mb-1">Costo Accumulato</p>
            <p className="text-white font-mono font-bold text-xl">{creditsSpent.toFixed(2)} <span className="text-[10px] font-normal text-white/40">CR</span></p>
          </div>
          <button 
            onClick={handleEndSession}
            disabled={isEnding}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] uppercase tracking-tighter px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {isEnding ? 'Chiusura...' : 'Termina'}
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
        <p className="text-center text-[9px] text-white/20 uppercase tracking-[0.2em] mt-4">
          Sessione crittografata · {isValeriaTyping ? 'Sconto attivo' : 'Tariffa standard'}
        </p>
      </footer>
    </div>
  )
}

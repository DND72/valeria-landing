import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { apiJson } from '../lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export default function StaffLenormandMentor() {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Benvenuta, Valeria. Il tuo sapere sulle Carte Lenormand è al sicuro qui. In cosa posso aiutarti ad affinare la tua visione oggi?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await apiJson<{ response: string }>(getToken, '/api/staff/lenormand-mentor', {
        method: 'POST',
        body: JSON.stringify({ query: input })
      })
      
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: res.response }
      setMessages(prev => [...prev, botMsg])
    } catch (err: any) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: "Le frequenze sono disturbate. Assicurati di aver caricato il testo del seminario nel backend." }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🃏</span>
          <div>
            <h3 className="text-white font-serif font-bold text-lg leading-tight">Mentore Lenormand</h3>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Estensione della tua saggezza</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 text-[10px] uppercase font-bold tracking-tight">Privato</span>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-gold-600/15 border border-gold-600/30 text-gold-100 italic' 
                  : 'bg-white/[0.05] border border-white/10 text-white/80'
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] border border-white/10 p-4 rounded-2xl flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/[0.02] border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Chiedi al Mentore sul seminario..."
            className="w-full bg-dark-400 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 pr-12"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1.5 p-1.5 text-gold-500 hover:text-gold-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-3 text-center italic">
          Le risposte si basano esclusivamente sulle tue lezioni trascritte.
        </p>
      </div>
    </div>
  )
}

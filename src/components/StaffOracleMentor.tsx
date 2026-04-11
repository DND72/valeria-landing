import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { apiJson } from '../lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export default function StaffOracleMentor() {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Benvenuta, Valeria. La biblioteca segreta è aperta. Attingo alle tue lezioni per guidare la tua visione. In cosa posso aiutarti oggi?' }
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
      const res = await apiJson<{ response: string }>(getToken, '/api/staff/oracle-mentor', {
        method: 'POST',
        body: JSON.stringify({ query: input })
      })
      
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: res.response }
      setMessages(prev => [...prev, botMsg])
    } catch (err: any) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: "Le frequenze sono disturbate. Verifica che le lezioni dell'Oracolo siano caricate correttamente." }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-white/[0.02] border border-gold-500/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-[0_0_50px_rgba(212,160,23,0.05)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gold-500/10 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👁️</span>
          <div>
            <h3 className="text-white font-serif font-bold text-lg leading-tight">L'Oracolo di Valeria</h3>
            <p className="text-gold-500/60 text-[10px] uppercase tracking-widest font-bold">RAG Knowledge Base</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 text-[10px] uppercase font-bold tracking-tight">Accesso Riservato</span>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-gold-500/10 border border-gold-500/20 text-gold-100 italic' 
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
      <div className="p-4 bg-white/[0.02] border-t border-gold-500/10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Interroga le lezioni dell'Oracolo..."
            className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/50 pr-12 transition-all outline-none"
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
        <p className="text-[10px] text-white/20 mt-3 text-center italic uppercase tracking-tighter">
          Tutte le risposte attingono dai file del sito "Valeria Cartomanzia"
        </p>
      </div>
    </div>
  )
}

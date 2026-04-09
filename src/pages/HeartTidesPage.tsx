import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import ClientLayout from '../components/ClientLayout'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function HeartTidesPage() {
  const { user } = useUser()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  
  const [personA, setPersonA] = useState({
    name: user?.firstName || '',
    birthDate: '',
    birthTime: '',
    city: ''
  })
  
  const [personB, setPersonB] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    city: ''
  })

  useEffect(() => {
    fetchBalance()
    fetchHistory()
  }, [])

  const fetchBalance = async () => {
    try {
      const res = await axios.get('/api/wallet/balance')
      setBalance(res.data.balance)
    } catch (e) {}
  }

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/astrology/heart-tides/list')
      setHistory(res.data.list)
    } catch (e) {}
  }

  const handleCalculate = async () => {
    if (!personA.birthDate || !personB.birthDate || !personA.name || !personB.name) {
      toast.error("Inserisci almeno i nomi e le date di nascita")
      return
    }
    
    setLoading(true)
    try {
      const res = await axios.post('/api/astrology/heart-tides', { personA, personB })
      setResult(res.data)
      fetchBalance()
      fetchHistory()
      toast.success("Maree del Cuore rivelate!")
    } catch (e: any) {
      const err = e.response?.data?.error
      if (err === 'insufficient_funds') {
        toast.error("Saldo insufficiente. Ricarica il tuo wallet.")
      } else {
        toast.error("Errore nel calcolo delle maree")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ClientLayout title="Maree del Cuore">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header Emozionale */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-6xl text-white mb-6 italic"
          >
            Maree del Cuore
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Come cambiano le correnti tra due anime questo mese? 
            Un'analisi dinamica e delicata della vostra affinità basata sui transiti lunari e planetari.
          </motion.p>
        </div>

        {!result && !loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            {/* Input Subject A */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="mystical-card p-8 border-cyan-500/20 bg-cyan-500/5 shadow-xl shadow-cyan-900/10"
            >
               <h3 className="text-cyan-200 font-serif text-2xl mb-6 italic">Prima Anima</h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Nome</label>
                    <input 
                      type="text" 
                      value={personA.name}
                      onChange={e => setPersonA({...personA, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-cyan-500/50 outline-none transition-all"
                      placeholder="Esempio: Valeria"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Data di Nascita</label>
                    <input 
                      type="date" 
                      value={personA.birthDate}
                      onChange={e => setPersonA({...personA, birthDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Ora (opzionale)</label>
                      <input 
                        type="time" 
                        value={personA.birthTime}
                        onChange={e => setPersonA({...personA, birthTime: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Città</label>
                      <input 
                        type="text" 
                        value={personA.city}
                        onChange={e => setPersonA({...personA, city: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
                        placeholder="Città"
                      />
                    </div>
                  </div>
               </div>
            </motion.div>

            {/* Input Subject B */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="mystical-card p-8 border-purple-500/20 bg-purple-500/5 shadow-xl shadow-purple-900/10"
            >
               <h3 className="text-purple-200 font-serif text-2xl mb-6 italic">Seconda Anima</h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Nome</label>
                    <input 
                      type="text" 
                      value={personB.name}
                      onChange={e => setPersonB({...personB, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-purple-500/50 outline-none transition-all"
                      placeholder="Chi vuoi interrogare?"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Data di Nascita</label>
                    <input 
                      type="date" 
                      value={personB.birthDate}
                      onChange={e => setPersonB({...personB, birthDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Ora (opzionale)</label>
                      <input 
                        type="time" 
                        value={personB.birthTime}
                        onChange={e => setPersonB({...personB, birthTime: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Città</label>
                      <input 
                        type="text" 
                        value={personB.city}
                        onChange={e => setPersonB({...personB, city: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-all"
                        placeholder="Città"
                      />
                    </div>
                  </div>
               </div>
            </motion.div>

            <div className="md:col-span-2 text-center">
               <button
                 onClick={handleCalculate}
                 className="mystical-button bg-cyan-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
               >
                 Rileva le Maree Mensili (10 CR)
               </button>
               <p className="text-[10px] text-white/30 mt-4 italic uppercase tracking-widest">
                 Il tuo saldo: {balance} CR | Linguaggio inclusivo e delicato
               </p>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
             <div className="w-32 h-32 mx-auto relative mb-10">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-cyan-500/40 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🌊</div>
             </div>
             <h2 className="font-serif text-3xl text-white mb-4 italic text-glow-cyan">L'Algoritmo sta leggendo le correnti...</h2>
             <p className="text-white/40 text-sm max-w-md mx-auto">
               Sincronizzazione dei transiti planetari dei prossimi 30 giorni tra le anime di {personA.name} e {personB.name}.
             </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mystical-card border-cyan-500/30 bg-cyan-900/10 p-10 md:p-16 mb-20 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />
             
             <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-sm">
                <ReactMarkdown>{result.interpretation}</ReactMarkdown>
             </div>

             <div className="mt-16 pt-10 border-t border-white/10 flex flex-wrap gap-4 justify-center no-print">
               <button onClick={() => window.print()} className="btn-outline px-8 py-3 text-[10px] uppercase tracking-widest">
                 Scarica Report (PDF)
               </button>
               <button onClick={() => setResult(null)} className="btn-ghost px-8 py-3 text-[10px] uppercase tracking-widest">
                 Nuovo Calcolo
               </button>
             </div>
          </motion.div>
        )}

        {/* Storico Maree */}
        {history.length > 0 && (
          <div className="mt-20">
            <h3 className="font-serif text-2xl text-white/50 mb-8 border-b border-white/10 pb-4 italic">Le tue Maree passate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((h, i) => (
                <div 
                  key={i} 
                  onClick={() => setResult(h)}
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 cursor-pointer transition-all group"
                >
                  <div className="text-[10px] uppercase tracking-widest text-cyan-400 mb-2">
                    {new Date(h.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-white font-black uppercase text-xs mb-1 group-hover:text-cyan-200 transition-colors">
                    {h.person_a_data.name} & {h.person_b_data.name}
                  </div>
                  <div className="text-[10px] text-white/40 italic">Maree del Cuore</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  )
}

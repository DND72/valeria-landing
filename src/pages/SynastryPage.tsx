
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useAstrologyApi, type NatalChartRequest } from '../api/astrology'

export default function SynastryPage() {
  const { calculateSynastry } = useAstrologyApi()
  const { user } = useUser()
  const isLoggedIn = !!user

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  // Form States
  const [pA, setPA] = useState<NatalChartRequest>({ birthDate: '', birthTime: '', city: '', gender: 'M' })
  const [pB, setPB] = useState<NatalChartRequest>({ birthDate: '', birthTime: '', city: '', gender: 'F' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) return
    
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await calculateSynastry(pA, pB)
      setResult(res)
      setTimeout(() => window.scrollBy({ top: 500, behavior: 'smooth' }), 300)
    } catch (err: any) {
      setError(err.message || 'Errore durante il calcolo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative pb-20">
      {/* Sfondo Passionale (Rubino/Nero) */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(60,10,20,0.9) 0%, rgba(8,8,16,1) 80%)' }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-red-400 text-[10px] font-semibold tracking-[0.4em] uppercase mb-4">✦ Alchimia delle Anime</p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 italic">Sinastria di <span className="gold-text">Coppia</span></h1>
          <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed">
            Non è solo un incontro, è un intreccio di destini. Scopri come i vostri astri danzano insieme, dove le fiamme si alimentano e dove il karma vi mette alla prova.
          </p>
        </motion.div>

        {!result ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-black/40 backdrop-blur-xl border border-red-900/30 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900 px-6 py-2 rounded-full border border-red-500/50 text-[10px] uppercase tracking-[0.3em] font-bold text-white shadow-lg shadow-red-900/50">
               Configurazione Input
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                {/* Persona A */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-serif italic text-sm">A</div>
                     <h3 className="text-white font-serif text-xl">Persona A</h3>
                  </div>
                  <div className="space-y-4">
                    <input type="date" required value={pA.birthDate} onChange={e => setPA({...pA, birthDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 outline-none transition-all" />
                    <input type="time" required value={pA.birthTime} onChange={e => setPA({...pA, birthTime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 outline-none transition-all" />
                    <input type="text" placeholder="Città di nascita" required value={pA.city} onChange={e => setPA({...pA, city: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 outline-none transition-all" />
                    <select value={pA.gender} onChange={e => setPA({...pA, gender: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 outline-none transition-all">
                      <option value="M" className="bg-dark-900">Uomo</option>
                      <option value="F" className="bg-dark-900">Donna</option>
                    </select>
                  </div>
                </div>

                {/* Persona B */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif italic text-sm">B</div>
                     <h3 className="text-white font-serif text-xl">Persona B</h3>
                  </div>
                  <div className="space-y-4">
                    <input type="date" required value={pB.birthDate} onChange={e => setPB({...pB, birthDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all" />
                    <input type="time" required value={pB.birthTime} onChange={e => setPB({...pB, birthTime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all" />
                    <input type="text" placeholder="Città di nascita" required value={pB.city} onChange={e => setPB({...pB, city: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all" />
                    <select value={pB.gender} onChange={e => setPB({...pB, gender: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all">
                      <option value="F" className="bg-dark-900">Donna</option>
                      <option value="M" className="bg-dark-900">Uomo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-white/5">
                {isLoggedIn ? (
                  <button type="submit" disabled={loading} className="btn-gold px-12 py-4 rounded-2xl text-base uppercase tracking-widest font-black shadow-[0_0_50px_rgba(212,160,23,0.3)] hover:scale-105 transition-all">
                    {loading ? "Cruciverba Astrale..." : "Calcola Affinità Evolutiva (50 CR) →"}
                  </button>
                ) : (
                  <Link to="/registrati" className="btn-gold px-12 py-4 rounded-2xl text-base uppercase tracking-widest font-black">Registrati per Calcolare →</Link>
                )}
                {error && <p className="text-red-400 text-xs mt-6 font-bold uppercase tracking-widest animate-pulse">⚠️ {error}</p>}
                <p className="text-[10px] text-white/20 mt-6 uppercase tracking-[0.2em]">Analisi Monumentale · Circa 3000 Parole di Saggezza</p>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Visualizzazione Risultati */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <span className="text-8xl italic font-serif">Valeria</span>
               </div>
               
               <div className="flex flex-wrap items-center justify-between gap-6 mb-12 border-b border-white/10 pb-10">
                 <div className="text-center md:text-left">
                    <p className="text-[10px] uppercase tracking-widest text-red-400 mb-1">Dati Maschili / Femminili</p>
                    <p className="text-white font-serif text-2xl">{pA.city} ✦ {pB.city}</p>
                 </div>
                 <div className="flex items-center gap-4 bg-red-950/20 border border-red-500/20 px-6 py-3 rounded-full">
                    <span className="text-red-400 text-sm italic font-serif">Magnetismo di Coppia</span>
                    <div className="flex gap-1">
                       {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold-400" />)}
                    </div>
                 </div>
               </div>

               <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-sm">
                  <ReactMarkdown>{result.interpretation}</ReactMarkdown>
               </div>

               <div className="mt-16 pt-10 border-t border-white/10 text-center no-print">
                  <button onClick={() => window.print()} className="btn-outline px-8 py-3 text-xs uppercase tracking-[0.2em]">
                    Scarica Report di Coppia (PDF)
                  </button>
               </div>
            </motion.div>

            {/* Aspetti Chiave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.interAspects?.slice(0, 6).map((asp: any, idx: number) => (
                <div key={idx} className="bg-black/40 border border-white/5 p-6 rounded-3xl hover:border-red-500/30 transition-all">
                   <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl" style={{ color: asp.color }}>{asp.symbol}</span>
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{asp.type}</span>
                   </div>
                   <p className="text-white font-serif text-lg mb-1">{asp.p1} <span className="text-red-500/50">vs</span> {asp.p2}</p>
                   <p className="text-[10px] text-white/20 italic">Bolla di risonanza: {(asp.precision * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

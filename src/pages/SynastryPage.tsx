
import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useUser } from '@clerk/clerk-react'
import { useAstrologyApi } from '../api/astrology'
import ClientLayout from '../components/dashboard/ClientLayout'

export default function SynastryPage() {
  const { user } = useUser()
  const { calculateSynastry } = useAstrologyApi()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [showFullCTA, setShowFullCTA] = useState(false)

  const [personA, setPersonA] = useState({
    birthDate: '',
    birthTime: '',
    city: '',
    gender: 'F' as 'M' | 'F'
  })

  const [personB, setPersonB] = useState({
    birthDate: '',
    birthTime: '',
    city: '',
    gender: 'M' as 'M' | 'F'
  })

  const handleCalculate = async (isPremium: boolean = false) => {
    if (!personA.birthDate || !personA.city || !personB.birthDate || !personB.city) {
      alert("Per favore, inserisci tutti i dati per entrambe le anime.")
      return
    }

    setLoading(true)
    try {
      // Passiamo un flag speciale per l'analisi base gratuita se non è premium
      const res = await calculateSynastry(personA, personB, !isPremium)
      setResult(res)
      if (!isPremium) {
        setShowFullCTA(true)
      } else {
        setShowFullCTA(false)
      }
    } catch (err: any) {
      alert(err.message || "Errore durante il calcolo dell'affinità")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <ClientLayout title="Sinastria di Coppia" subtitle="Il Libro dell'Amore">
      <div className="max-w-4xl mx-auto">
        <div className="mystical-card border-red-500/20 bg-red-950/5 p-10 mb-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 pointer-events-none italic font-serif">Amore</div>
           <div className="relative z-10">
              <span className="text-gold-400 text-[10px] uppercase tracking-[0.4em] font-black mb-4 block">✦ IL PATTO DELLE STELLE</span>
              <h1 className="text-4xl font-serif text-white mb-6">Affinità Astrale: Il vostro Destino</h1>
              <p className="text-white/70 leading-relaxed italic text-lg max-w-2xl">
                "Due anime non si incontrano mai per caso. Valeria leggerà per voi il Libro dell'Amore per svelare l'alchimia segreta che lega i vostri temi natali."
              </p>
           </div>
        </div>

        {!result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* La Tua Anima */}
                <div className="mystical-card p-8 bg-black/40 border-white/5 space-y-6 relative">
                   <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <span className="text-xl">🕯️</span>
                   </div>
                   <h3 className="font-serif text-xl text-white italic">La Tua Anima</h3>
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Data di Nascita</label>
                         <input
                            type="date"
                            value={personA.birthDate}
                            onChange={(e) => setPersonA(prev => ({ ...prev, birthDate: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Ora di Nascita</label>
                         <input
                            type="time"
                            value={personA.birthTime}
                            onChange={(e) => setPersonA(prev => ({ ...prev, birthTime: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Città di Nascita</label>
                         <input
                            type="text"
                            placeholder="Es: Roma"
                            value={personA.city}
                            onChange={(e) => setPersonA(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Energia Prevalente</label>
                         <select 
                            value={personA.gender}
                            onChange={(e) => setPersonA(prev => ({ ...prev, gender: e.target.value as any }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                         >
                            <option value="M">Maschile</option>
                            <option value="F">Femminile</option>
                         </select>
                      </div>
                   </div>
                </div>

                {/* Persona B */}
                <div className="mystical-card p-8 bg-black/40 border-white/5 space-y-6 relative">
                   <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <span className="text-xl">🌟</span>
                   </div>
                   <h3 className="font-serif text-xl text-white italic">L'Anima del Partner</h3>
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Data di Nascita</label>
                         <input
                            type="date"
                            value={personB.birthDate}
                            onChange={(e) => setPersonB(prev => ({ ...prev, birthDate: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Ora di Nascita</label>
                         <input
                            type="time"
                            value={personB.birthTime}
                            onChange={(e) => setPersonB(prev => ({ ...prev, birthTime: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Città di Nascita</label>
                         <input
                            type="text"
                            placeholder="Es: Milano"
                            value={personB.city}
                            onChange={(e) => setPersonB(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Energia Prevalente</label>
                         <select 
                            value={personB.gender}
                            onChange={(e) => setPersonB(prev => ({ ...prev, gender: e.target.value as any }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all"
                         >
                            <option value="M">Maschile</option>
                            <option value="F">Femminile</option>
                         </select>
                      </div>
                   </div>
                </div>
             </div>

             <div className="mt-12 text-center flex flex-col items-center gap-6">
                <button
                  onClick={() => handleCalculate(false)}
                  disabled={loading}
                  className="mystical-button bg-white/10 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs border border-white/10 hover:bg-white/20 transition-all"
                >
                   {loading ? "In ascolto..." : "Calcola Alchimia Base (Gratis)"}
                </button>
                <div className="h-px w-20 bg-white/10" />
                <button
                  onClick={() => handleCalculate(true)}
                  disabled={loading}
                  className="mystical-button bg-gradient-to-r from-red-600 to-amber-600 text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_50px_rgba(220,38,38,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                   {loading ? "Intreccio Astrale..." : "Svela il Libro dell'Amore — 50 CR"}
                </button>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Un'analisi magistrale da 6000 parole approvata da Valeria</p>
             </div>
          </motion.div>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <motion.div
              layoutId="result-card"
              className="mystical-card p-12 bg-black/60 relative overflow-hidden print:p-0 print:border-none print:shadow-none"
            >
               <div className="absolute top-0 right-0 p-12 text-6xl opacity-10 pointer-events-none italic font-serif">Il Libro dell'Amore</div>
               
               <div className="flex flex-wrap items-center justify-between gap-6 mb-12 border-b border-white/10 pb-10">
                 <div className="text-center md:text-left">
                    <p className="text-[10px] uppercase tracking-widest text-red-400 mb-1">Dati Analizzati</p>
                    <p className="text-white font-serif text-2xl">{personA.city} ✦ {personB.city}</p>
                 </div>
                 <div className="flex items-center gap-4 bg-red-950/20 border border-red-500/20 px-6 py-3 rounded-full">
                    <span className="text-red-400 text-sm italic font-serif">Magnetismo di Coppia</span>
                    <div className="flex gap-1">
                       {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold-400" />)}
                    </div>
                 </div>
               </div>

               {result.status === 'pending_staff' ? (
                 <div className="text-center py-20">
                    <div className="w-24 h-24 rounded-full border border-red-500/30 flex items-center justify-center mx-auto mb-8 relative">
                       <span className="text-4xl animate-pulse">🕯️</span>
                       <div className="absolute inset-0 border-2 border-gold-500/20 rounded-full animate-spin-slow" />
                    </div>
                    <h2 className="font-serif text-3xl text-white mb-6 italic">Valeria sta intrecciando i vostri destini...</h2>
                    <p className="text-white/60 text-base max-w-xl mx-auto leading-relaxed mb-8">
                      Le vostre anime sono entrate nel Laboratorio Astrale. Valeria sta analizzando personalmente ogni aspetto del vostro legame per creare il vostro **Libro dell'Amore** da 6000 parole.
                    </p>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-900/20 rounded-full border border-red-500/30">
                       <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                       <span className="text-xs uppercase tracking-[0.2em] text-gold-200 font-bold">Responso pronto in circa 24 ore</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-10 italic">Riceverai una notifica sul tuo Diario non appena il patto segreto delle stelle sarà rivelato.</p>
                 </div>
               ) : (
                 <>
                   <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-sm mb-12">
                      <ReactMarkdown>{result.interpretation}</ReactMarkdown>
                   </div>

                   {showFullCTA && (
                      <div className="mystical-card border-gold-500/30 bg-gold-500/5 p-10 text-center">
                         <h3 className="font-serif text-2xl text-white mb-4">Vuoi sollevare il Velo completo?</h3>
                         <p className="text-white/60 mb-8 max-w-lg mx-auto">
                           Questa è solo l'alchimia di superficie. Il **Libro dell'Amore** svela i nodi karmici, le sfide evolutive e il futuro a lungo termine del vostro incontro.
                         </p>
                         <button 
                           onClick={() => handleCalculate(true)}
                           className="mystical-button bg-gold-500 text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-gold-500/20"
                         >
                            Richiedi il Libro dell'Amore (50 CR)
                         </button>
                      </div>
                   )}

                   <div className="mt-16 pt-10 border-t border-white/10 text-center no-print">
                      <button onClick={() => window.print()} className="btn-outline px-8 py-3 text-xs uppercase tracking-[0.2em]">
                        Scarica Report di Coppia (PDF)
                      </button>
                   </div>
                 </>
               )}
            </motion.div>
          </div>
        )}
      </div>
    </ClientLayout>
  )
}

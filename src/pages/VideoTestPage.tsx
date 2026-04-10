import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { apiJson } from '../lib/api'

export default function VideoTestPage() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTest = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiJson<{ videoLink: string }>(getToken, '/api/booking/video-test-token')
      setVideoUrl(res.videoLink)
    } catch (err: any) {
      console.error('[test room error]', err)
      setError(err.message || 'Errore tecnico nella creazione dello specchio.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTest()
  }, [getToken])

  return (
    <div className="fixed inset-0 bg-[#050810] text-white z-[99999] overflow-hidden flex flex-col font-sans">
      
      {/* 🔮 Mystical Overlays */}
      <div className="absolute inset-0 pointer-events-none z-20">
         <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-gold-500/10 rounded-tl-[40px] m-4" />
         <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-gold-500/10 rounded-tr-[40px] m-4" />
         <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-gold-500/10 rounded-bl-[40px] m-4" />
         <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-gold-500/10 rounded-br-[40px] m-4" />
         
         <div className="absolute inset-0 overflow-hidden opacity-10">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gold-400 rounded-full blur-[1px]"
                animate={{ y: [-20, 1000], opacity: [0, 1, 0] }}
                transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: i }}
                style={{ left: `${i * 20}%`, top: '-5%' }}
              />
            ))}
         </div>
      </div>

      <header className="relative z-30 h-20 shrink-0 px-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-2xl">
         <div className="flex items-center gap-5">
            <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-500/20 transition-all border border-white/5 group"
            >
                <span className="text-white/40 group-hover:text-white transition-colors">✕</span>
            </button>
            <div>
                <h1 className="text-sm font-serif font-black gold-text uppercase tracking-[0.2em] leading-none mb-1">Lo Specchio Sacro</h1>
                <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Area Test Setup & Privacy</p>
            </div>
         </div>
         <div className="hidden md:flex items-center gap-2 py-2 px-4 rounded-full bg-gold-500/5 border border-gold-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] text-gold-500/60 uppercase font-black tracking-widest">Protocollo Privato Attivo</span>
         </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col md:flex-row overflow-hidden">
         {/* Sidebar Advice */}
         <div className="w-full md:w-80 shrink-0 p-8 border-r border-white/5 bg-black/20 backdrop-blur-3xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
                <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5">
                    <span className="text-3xl mb-4 block">🎧</span>
                    <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-3">Qualità Audio</h3>
                    <p className="text-white/40 text-[10px] leading-relaxed">
                       Usa le cuffie per evitare l'effetto eco e rendere la sessione più intima e profonda.
                    </p>
                </div>
                
                <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5">
                    <span className="text-3xl mb-4 block">✨</span>
                    <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-3">Privacy & Sfondo</h3>
                    <p className="text-white/40 text-[10px] leading-relaxed">
                       Puoi sfocare lo sfondo o aggiungere un'immagine cliccando sulle icone della fotocamera nel pannello video.
                    </p>
                </div>
            </div>

            <div className="mt-10 p-4 border-t border-white/5 pt-8">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold text-center leading-relaxed italic">
                    Questa è una stanza di prova.<br/>I minuti non vengono scalati dal Wallet.
                </p>
            </div>
         </div>

         {/* Video area */}
         <div className="flex-1 bg-black relative flex items-center justify-center p-4 sm:p-12 overflow-hidden">
            {loading ? (
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin shadow-[0_0_20px_rgba(212,160,23,0.2)]" />
                    <p className="text-gold-500/40 text-[10px] uppercase tracking-[0.4em] font-black animate-pulse">Accordatura dello specchio...</p>
                </div>
            ) : error ? (
                <div className="max-w-xs w-full text-center bg-dark-500 p-8 rounded-[40px] border border-red-500/20 shadow-2xl">
                    <span className="text-4xl mb-6 block">🌑</span>
                    <h2 className="text-lg font-serif font-black text-white mb-2 uppercase italic tracking-tighter">Visione Oscurata</h2>
                    <p className="text-red-400 text-[10px] uppercase font-black tracking-widest mb-8 leading-relaxed italic px-4">
                        {error}
                    </p>
                    <button 
                        onClick={loadTest} 
                        className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl"
                    >
                        Riprova Invocazione
                    </button>
                </div>
            ) : (
                <div className="w-full h-full max-w-5xl aspect-video bg-zinc-900 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 relative">
                   <iframe
                        src={videoUrl!}
                        allow="camera; microphone; display-capture; autoplay; encrypted-media; fullscreen"
                        className="w-full h-full border-none"
                        title="Video Test Room"
                    />
                </div>
            )}
         </div>
      </main>
    </div>
  )
}

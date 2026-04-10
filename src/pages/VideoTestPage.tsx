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

  useEffect(() => {
    async function loadTest() {
      try {
        const res = await apiJson<{ videoLink: string }>(getToken, '/api/booking/video-test-token')
        setVideoUrl(res.videoLink)
      } catch (err: any) {
        setError(err.message || 'Errore nel caricamento del test video')
      } finally {
        setLoading(false)
      }
    }
    void loadTest()
  }, [getToken])

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] text-white flex flex-col overflow-hidden">
      
      {/* 🔮 Mystical Overlays */}
      <div className="absolute inset-0 pointer-events-none z-20">
         <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-gold-500/30 rounded-tl-[40px] m-4" />
         <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-gold-500/30 rounded-tr-[40px] m-4" />
         <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-gold-500/30 rounded-bl-[40px] m-4" />
         <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-gold-500/30 rounded-br-[40px] m-4" />
         
         <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gold-400 rounded-full blur-[1px]"
                animate={{
                  y: [-20, window.innerHeight + 20],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 15 + Math.random() * 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 5
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-5%'
                }}
              />
            ))}
         </div>
      </div>

      <header className="relative z-30 p-6 flex items-center justify-between border-b border-white/5 bg-dark-500/40 backdrop-blur-md">
         <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-500/20 transition-colors"
            >
                ✕
            </button>
            <div>
                <h1 className="text-xl font-serif font-bold gold-text">Lo Specchio Sacro</h1>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Area Test Setup & Privacy</p>
            </div>
         </div>
         <div className="hidden md:flex items-center gap-3 py-2 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-400 uppercase font-black tracking-tighter">Ibrido Online: Privato</span>
         </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col md:flex-row">
         {/* Sidebar Advice */}
         <div className="w-full md:w-80 p-8 border-r border-white/5 flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-gold-500/5 border border-gold-500/10">
                <span className="text-3xl mb-4 block">🎧</span>
                <h3 className="text-gold-500 font-bold text-sm mb-2">Qualità Audio</h3>
                <p className="text-white/40 text-xs leading-relaxed">
                   Usa le cuffie per evitare l'effetto eco e rendere la sessione più intima e profonda.
                </p>
            </div>
            
            <div className="p-6 rounded-3xl bg-gold-500/5 border border-gold-500/10">
                <span className="text-3xl mb-4 block">✨</span>
                <h3 className="text-gold-500 font-bold text-sm mb-2">Privacy & Sfondo</h3>
                <p className="text-white/40 text-xs leading-relaxed">
                   Puoi sfocare lo sfondo o aggiungere un'immagine cliccando sulle icone della fotocamera nel pannello video.
                </p>
            </div>

            <div className="mt-auto p-4 text-center">
                <p className="text-[10px] text-white/20 italic">
                    Questa è una stanza di prova.<br/>I minuti non vengono scalati dal Wallet.
                </p>
            </div>
         </div>

         {/* Video area */}
         <div className="flex-1 bg-black relative">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-4" />
                    <p className="text-gold-500/50 text-xs uppercase tracking-[0.3em] font-bold">Riflessione dello specchio...</p>
                </div>
            ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                    <span className="text-4xl mb-4">🌑</span>
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-gold px-8 py-2 text-xs">Riprova</button>
                </div>
            ) : (
                <iframe
                    src={videoUrl!}
                    allow="camera; microphone; display-capture; autoplay; encrypted-media; fullscreen"
                    className="w-full h-full border-none"
                    title="Video Test Room"
                />
            )}
         </div>
      </main>
    </div>
  )
}

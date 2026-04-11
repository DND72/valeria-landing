import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { apiJson } from '../lib/api'
import { Sparkles, ShieldCheck, RefreshCcw, X, AlertCircle, Sun, Moon, Compass } from 'lucide-react'

export default function VideoTestPage() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for effects
  const [activeVideoEffect, setActiveVideoEffect] = useState<'none' | 'blur' | 'cosmic' | 'study' | 'temple'>('none')
  const [astralProfile, setAstralProfile] = useState<any>(null)
  
  const callRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const loadAstralProfile = async () => {
    try {
      const res = await apiJson<any>(getToken, '/api/me/astral-profile')
      setAstralProfile(res)
    } catch (e) {
      console.error('Error loading astral profile', e)
    }
  }

  useEffect(() => {
    void loadTest()
    void loadAstralProfile()
  }, [getToken])

  // Initialize Daily when videoUrl is available
  useEffect(() => {
    if (!videoUrl || !containerRef.current || callRef.current) return

    const daily = (window as any).DailyIframe
    if (!daily) {
      console.error('Daily SDK not loaded')
      return
    }

    const frame = daily.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '1px solid rgba(212, 160, 23, 0.2)',
        borderRadius: '48px',
        backgroundColor: '#050810'
      },
      showLeaveButton: false,
      showFullscreenButton: true,
      appearanceConfig: {
        colors: {
            accent: '#D4A017', // Gold 
            accentText: '#000000',
            background: '#050810', // Deep Space
            backgroundAccent: '#0D111A',
            baseText: '#FFFFFF',
            border: '#1E2533',
            mainAreaBg: '#050810',
            mainAreaBgAccent: '#080C14',
            mainAreaText: '#FFFFFF',
            supportiveText: '#6C7A99',
        }
      }
    })

    callRef.current = frame

    // Join with forced clear settings to avoid defaults
    frame.join({ 
        url: videoUrl,
        inputSettings: {
            video: { processor: { type: 'none' } },
            audio: { processor: { type: 'none' } }
        }
    }).then(() => {
        console.log('Joined successfully');
        setActiveVideoEffect('none');
    }).catch((err: any) => {
        console.error('Join error:', err)
        setError('Impossibile accedere alla stanza video.')
    })

    // Listen for effect changes from within Daily UI to keep sidebar in sync
    frame.on('input-settings-updated', (ev: any) => {
        const videoProc = ev.inputSettings?.video?.processor?.type
        
        if (videoProc === 'none') setActiveVideoEffect('none')
        else if (videoProc === 'background-blur') setActiveVideoEffect('blur')
        else if (videoProc === 'background-image') {
            const src = ev.inputSettings?.video?.processor?.config?.source || ev.inputSettings?.video?.processor?.config?.url
            if (src?.includes('cosmic')) setActiveVideoEffect('cosmic')
            else if (src?.includes('study')) setActiveVideoEffect('study')
            else if (src?.includes('temple')) setActiveVideoEffect('temple')
        }
    })

    return () => {
      if (callRef.current) {
        callRef.current.destroy()
        callRef.current = null
      }
    }
  }, [videoUrl])

  useEffect(() => {
    return () => {
      if (callRef.current) {
        callRef.current.destroy()
      }
    }
  }, [])

  const applyVideoEffect = async (effect: 'none' | 'blur' | 'cosmic' | 'study' | 'temple') => {
    if (!callRef.current) return
    
    console.log(`[Daily] Applying effect: ${effect}`);
    
    // Optimistic update
    const prevEffect = activeVideoEffect
    setActiveVideoEffect(effect)

    try {
        let processor: any = { type: 'none' }
        
        if (effect === 'blur') {
            processor = { type: 'background-blur' }
        } else if (effect !== 'none') {
            // Utilizziamo un CDN pubblico (jsDelivr) collegato a GitHub per aggirare i problemi CORS 
            // che impediscono a Daily (in un iframe cross-origin) di leggere immagini dal dominio locale.
            const imgUrl = `https://cdn.jsdelivr.net/gh/DND72/valeria-landing@main/public/backgrounds/${effect}.png`
            console.log(`[Daily] Image URL (CDN): ${imgUrl}`);
            
            processor = { 
                type: 'background-image', 
                config: { 
                    source: imgUrl, // standard 2026/latest
                    url: imgUrl     // fallback for older builds
                } 
            }
        }

        await callRef.current.updateInputSettings({
            video: { processor }
        })
        console.log('[Daily] Input settings updated successfully');
    } catch (e) {
        console.error('[Daily] Video effect change failed', e)
        setActiveVideoEffect(prevEffect)
        
        // Tentativo di ri-sincronizzazione
        try {
            const settings = await callRef.current.getInputSettings()
            const videoProc = settings?.video?.processor?.type
            if (videoProc === 'background-blur') setActiveVideoEffect('blur')
            else if (videoProc === 'background-image') {
                 // Sincronizzazione dell'effetto specifico basata sull'URL
                 const currentSource = settings?.video?.processor?.config?.source || settings?.video?.processor?.config?.url
                 if (currentSource?.includes('cosmic')) setActiveVideoEffect('cosmic')
                 else if (currentSource?.includes('study')) setActiveVideoEffect('study')
                 else if (currentSource?.includes('temple')) setActiveVideoEffect('temple')
                 else setActiveVideoEffect('none')
            } else setActiveVideoEffect('none')
        } catch (syncErr) {
            console.error('[Daily] Re-sync failed', syncErr)
        }
    }
  }

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
                <X className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
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
         {/* Sidebar Controls */}
         <div className="w-full md:w-80 shrink-0 p-8 border-r border-white/5 bg-black/20 backdrop-blur-3xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
            {/* Effetti Video */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <h3 className="text-white font-bold text-[10px] uppercase tracking-widest pl-2 mb-4 opacity-50">Ambienti e Privacy</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => applyVideoEffect(activeVideoEffect === 'blur' ? 'none' : 'blur')}
                            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                                activeVideoEffect === 'blur' ? 'bg-gold-500/10 border-gold-500/40' : 'bg-white/5 border-white/5 hover:border-white/10'
                            }`}
                        >
                            <Sparkles className={`w-4 h-4 ${activeVideoEffect === 'blur' ? 'text-gold-500' : 'text-white/40'}`} />
                            <span className="text-[8px] uppercase font-bold tracking-widest">Sfocato</span>
                        </button>
                        
                        <button 
                            onClick={() => applyVideoEffect(activeVideoEffect === 'cosmic' ? 'none' : 'cosmic')}
                            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                                activeVideoEffect === 'cosmic' ? 'bg-gold-500/10 border-gold-500/40' : 'bg-white/5 border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-60" />
                            <span className="text-[8px] uppercase font-bold tracking-widest">Cosmo</span>
                        </button>

                        <button 
                            onClick={() => applyVideoEffect(activeVideoEffect === 'study' ? 'none' : 'study')}
                            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                                activeVideoEffect === 'study' ? 'bg-gold-500/10 border-gold-500/40' : 'bg-white/5 border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-800 to-orange-400 opacity-60" />
                            <span className="text-[8px] uppercase font-bold tracking-widest">Studio</span>
                        </button>

                        <button 
                            onClick={() => applyVideoEffect(activeVideoEffect === 'temple' ? 'none' : 'temple')}
                            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${
                                activeVideoEffect === 'temple' ? 'bg-gold-500/10 border-gold-500/40' : 'bg-white/5 border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-300 opacity-60" />
                            <span className="text-[8px] uppercase font-bold tracking-widest">Tempio</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">Connessione Protetta</h3>
                    </div>
                    <p className="text-white/30 text-[9px] leading-relaxed italic">
                       Lo specchio utilizza crittografia end-to-end. Nessuno può vedere o registrare questa prova.
                    </p>
                </div>

                {astralProfile && (
                    <div className="space-y-4 p-6 rounded-[32px] bg-gold-500/5 border border-gold-500/10">
                        <h3 className="text-gold-500 font-bold text-[10px] uppercase tracking-widest pl-1 opacity-50 mb-2">Impronta Astrale</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gold-500/10 text-gold-500">
                                    <Sun className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-[7px] text-white/30 uppercase font-black tracking-widest">Sole</p>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">{astralProfile.sole?.segno || '---'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gold-500/10 text-gold-500">
                                    <Moon className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-[7px] text-white/30 uppercase font-black tracking-widest">Luna</p>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">{astralProfile.luna?.segno || '---'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gold-500/10 text-gold-500">
                                    <Compass className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-[7px] text-white/30 uppercase font-black tracking-widest">Ascendente</p>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">{astralProfile.ascendente?.segno || '---'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-10 p-4 border-t border-white/5 pt-8">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold text-center leading-relaxed italic">
                    Questa è una stanza di prova.<br/>I minuti non vengono scalati dal Wallet.
                </p>
            </div>
         </div>

         {/* Video area */}
         <div className="flex-1 bg-black relative flex items-center justify-center p-4 sm:p-12 overflow-hidden">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="w-12 h-12 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin shadow-[0_0_20px_rgba(212,160,23,0.2)]" />
                        <p className="text-gold-500/40 text-[10px] uppercase tracking-[0.4em] font-black animate-pulse">Accordatura dello specchio...</p>
                    </motion.div>
                ) : error ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-xs w-full text-center bg-dark-500 p-10 rounded-[40px] border border-red-500/20 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
                        <h2 className="text-lg font-serif font-black text-white mb-2 uppercase italic tracking-tighter">Visione Oscurata</h2>
                        <p className="text-red-400 text-[10px] uppercase font-black tracking-widest mb-8 leading-relaxed italic px-4">
                            {error}
                        </p>
                        <button 
                            onClick={loadTest} 
                            className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            <RefreshCcw className="w-3 h-3" />
                            Riprova Invocazione
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full max-w-5xl aspect-video bg-zinc-900 rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-2 border-gold-500/30 relative"
                    >
                       <div ref={containerRef} className="w-full h-full" />
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      </main>
    </div>
  )
}

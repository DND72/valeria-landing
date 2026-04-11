import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import { apiJson } from '../lib/api'

export default function LiveVideoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  
  const isStaff = isLoaded && (
    user?.publicMetadata?.role === 'staff' || 
    user?.publicMetadata?.role === 'admin' || 
    user?.publicMetadata?.privileged === true
  )

  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [seconds, setSeconds] = useState(0)
  const [isEnding, setIsEnding] = useState(false)
  const [dailyRoomUrl, setDailyRoomUrl] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ credits: number, euro: string } | null>(null)
  const [attachments] = useState<any[]>([])

  // Staff Only States
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionText, setTranscriptionText] = useState<string[]>([])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!sessionInfo?.actualStartAt || sessionInfo?.status !== 'in_progress') return
    const startAt = new Date(sessionInfo.actualStartAt).getTime()
    if (isNaN(startAt)) return
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionInfo?.actualStartAt, sessionInfo?.status])

  useEffect(() => {
    if (!isLoaded || !id) return
    let isMounted = true
    const fetchSessionStatus = async () => {
       try {
          const res = await apiJson<{ sessionInfo?: any, videoLink?: string }>(getToken, `/api/booking/video-session/${id}`)
          if (!isMounted) return
          if (res.sessionInfo) {
             setSessionInfo(res.sessionInfo)
             if (res.sessionInfo.status === 'done' || res.sessionInfo.status === 'cancelled') {
                if (!isEnding) setIsEnding(true)
             }
          }
          if (res.videoLink && !dailyRoomUrl) setDailyRoomUrl(res.videoLink)
       } catch (err) { console.error('[video poll]', err) }
    }
    void fetchSessionStatus()
    const poll = setInterval(fetchSessionStatus, 5000)
    return () => { isMounted = false; clearInterval(poll) }
  }, [id, getToken, dailyRoomUrl, isEnding, isLoaded])

  const handleEndSession = async () => {
    if (!window.confirm(`Terminare il videoconsulto?`)) return
    setIsEnding(true)
    try {
      if (isStaff) {
         const res = await apiJson<any>(getToken, `/api/booking/session/${id}/abandon`, { method: 'POST' })
         const creditsEarned = res.billed ? (sessionInfo.costCredits || 0) : 0
         setSuccessData({ credits: creditsEarned, euro: (creditsEarned).toFixed(2) })
      } else {
         await apiJson(getToken, `/api/booking/session/${id}/abandon`, { method: 'POST' })
         navigate('/area-personale')
      }
    } catch (e: any) { alert(e.message || "Errore chiusura."); setIsEnding(false) }
  }

  const toggleRecording = () => {
     // Mock recording toggle for now
     setIsRecording(!isRecording)
     // alert(isRecording ? "Registrazione interrotta" : "Registrazione avviata")
  }

  const toggleTranscription = () => {
     setIsTranscribing(!isTranscribing)
     if (!isTranscribing) {
        setTranscriptionText(["[SISTEMA]: Trascrizione avviata...", "[VALERIA]: Benvenuta anima cara, sento un'energia positiva oggi..."])
     }
  }

  const currentTotalCost = (sessionInfo && sessionInfo.costCredits) ? Math.min(sessionInfo.costCredits, Math.ceil((seconds/60) * 1.0)) : 0
  const displayName = isStaff ? (sessionInfo?.inviteeName || 'Cliente') : 'Valeria Di Pace'

  if (!isLoaded) return <div className="fixed inset-0 bg-black flex items-center justify-center"><div className="w-10 h-10 border-t-2 border-gold-500 rounded-full animate-spin" /></div>

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] text-white flex flex-col overflow-hidden">
      
      {/* 🔮 Mystical Overlays */}
      <div className="absolute inset-0 pointer-events-none z-20">
         <div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-gold-500/20 rounded-tl-3xl m-4" />
         <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-gold-500/20 rounded-tr-3xl m-4" />
         <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-gold-500/20 rounded-bl-3xl m-4" />
         <div className="absolute bottom-0 right-0 w-24 h-24 border-b border-r border-gold-500/20 rounded-br-3xl m-4" />
         
         <div className="absolute inset-0 overflow-hidden opacity-10">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gold-400 rounded-full blur-[1px]"
                animate={{ y: [-20, 1000], opacity: [0, 1, 0] }}
                transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: i }}
                style={{ left: `${i * 10}%`, top: '-5%' }}
              />
            ))}
         </div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-80 h-full bg-dark-500/40 backdrop-blur-2xl border-r border-white/5 p-6 flex flex-col z-30">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 rounded-full border border-gold-500/30 overflow-hidden">
                <img src="/valeria-hero.jpg" alt="Avatar" className="w-full h-full object-cover" />
             </div>
             <div>
                <h2 className="text-sm font-serif font-black gold-text uppercase tracking-widest">{displayName}</h2>
                <div className="flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-[9px] uppercase font-bold text-white/40 tracking-tighter">Live Session</span>
                </div>
             </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-8">
             <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                <span className="text-[8px] uppercase text-white/30 block mb-1">Durata</span>
                <span className="font-mono font-bold text-lg">
                   {Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
                </span>
             </div>
             <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                <span className="text-[8px] uppercase text-white/30 block mb-1">{isStaff ? 'Incasso' : 'Costo CR'}</span>
                <span className="font-mono font-bold text-lg text-emerald-400">{currentTotalCost}</span>
             </div>
          </div>

          {/* Attachments Area */}
          <div className="flex-1 flex flex-col min-h-0">
             <h3 className="text-[10px] uppercase tracking-widest font-black text-white/40 mb-4 px-1">Elementi Condivisi</h3>
             <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {attachments.length === 0 ? (
                   <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
                      <p className="text-[9px] text-white/20 italic">Trascina qui foto o documenti</p>
                   </div>
                ) : (
                   attachments.map(at => (
                     <div key={at.id} className="bg-white/5 border border-white/5 rounded-xl p-2 group hover:border-gold-500/30 transition-all">
                        <div className="aspect-square bg-black rounded-lg overflow-hidden border border-white/5 mb-2">
                           <img src={at.url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between px-1">
                           <span className="text-[8px] uppercase font-black text-white/20">{at.filename}</span>
                           <button className="text-[8px] gold-text font-black uppercase">Vedi</button>
                        </div>
                     </div>
                   ))
                )}
             </div>
             <button className="mt-4 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] uppercase font-bold tracking-[0.2em] text-white/40 hover:text-white hover:border-gold-500 transition-all">
                + Invia File / Foto
             </button>
          </div>

          <button onClick={handleEndSession} className="mt-8 w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-lg shadow-red-500/20 transition-all">
             Concludi Sessione
          </button>

          {/* STAFF ONLY: Control Panel */}
          {isStaff && (
             <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest font-black text-gold-500 mb-2">Pannello Staff</h3>
                
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={toggleRecording}
                        className={`py-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${isRecording ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-white/5 border-white/5 text-white/40'}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
                        <span className="text-[8px] uppercase font-bold tracking-widest">{isRecording ? 'REC In Corso' : 'Registra'}</span>
                    </button>
                    
                    <button 
                        onClick={toggleTranscription}
                        className={`py-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${isTranscribing ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-white/5 text-white/40'}`}
                    >
                        <span className="text-xs">📝</span>
                        <span className="text-[8px] uppercase font-bold tracking-widest">Trascrizione AI</span>
                    </button>
                </div>

                {isTranscribing && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-black/40 border border-white/5 rounded-2xl p-4 max-h-40 overflow-y-auto custom-scrollbar"
                    >
                        <div className="space-y-2">
                             {transcriptionText.map((t, i) => (
                                 <p key={i} className="text-[9px] leading-relaxed text-white/60 italic border-l border-gold-500/30 pl-2">
                                     {t}
                                 </p>
                             ))}
                        </div>
                    </motion.div>
                )}
             </div>
          )}
        </div>

        {/* Video Main */}
        <div className="flex-1 bg-black relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
          {dailyRoomUrl ? (
            <div className="w-full h-full max-w-6xl aspect-video bg-zinc-900 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-2 border-gold-500/30 relative">
                <iframe 
                    ref={iframeRef} src={dailyRoomUrl}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="w-full h-full border-none" title="Video"
                />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <div className="w-10 h-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-4" />
               <p className="text-gold-500/40 text-[10px] uppercase font-black tracking-widest">Sintonizzazione Frequenze...</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {successData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6">
            <div className="max-w-xs w-full text-center p-8 bg-dark-500 border border-gold-500/20 rounded-[40px]">
              <h2 className="text-2xl font-serif font-black mb-1">Sessione Chiusa</h2>
              <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-8">Energia Scambiata Correttamente</p>
              <div className="bg-black/50 p-6 rounded-3xl border border-white/5 mb-8">
                 <span className="text-[8px] uppercase text-white/30 block mb-2">Crediti Maturati</span>
                 <span className="text-4xl font-serif font-black gold-text">{successData.credits}</span>
              </div>
              <button onClick={() => navigate(isStaff ? '/control-room' : '/area-personale')} className="w-full py-4 bg-gold-500 text-black rounded-2xl font-bold text-xs uppercase tracking-widest">Torna al Diario</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

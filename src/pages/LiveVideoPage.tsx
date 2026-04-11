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
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isInvokingOracle, setIsInvokingOracle] = useState(false)
  const [oracleInsight, setOracleInsight] = useState<string | null>(null)
  const [transcriptionText, setTranscriptionText] = useState<string[]>([])

  const MAJOR_ARCANA = [
    "Il Matto (0)", "Il Bagatto (1)", "La Papessa (2)", "L'Imperatrice (3)", "L'Imperatore (4)", "Il Papa (5)", 
    "Gli Amanti (6)", "Il Carro (7)", "La Giustizia (8)", "L'Eremita (9)", "La Ruota della Fortuna (10)", "La Forza (11)", 
    "L'Appeso (12)", "La Morte (13)", "La Temperanza (14)", "Il Diavolo (15)", "La Torre (16)", "La Stella (17)", 
    "La Luna (18)", "Il Sole (19)", "Il Giudizio (20)", "Il Mondo (21)"
  ]
  const [drawnCards, setDrawnCards] = useState<number[]>([])

  // Astral Data for Lower Thirds
  const [clientAstral, setClientAstral] = useState<any>(null)
  const valeriaAstral = { sole: 'Ariete', luna: 'Pesci', asc: 'Scorpione' }

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

  // Fetch Client Astral Data
  useEffect(() => {
    if (!id || !isLoaded) return
    const fetchAstral = async () => {
        try {
            // Tentativo di recuperare i dati astrali del cliente coinvolto nella sessione
            const res = await apiJson<any>(getToken, `/api/booking/session/${id}/astral-context`)
            if (res.astral) setClientAstral(res.astral)
        } catch (e) { console.warn('[astral fetch]', e) }
    }
    void fetchAstral()
  }, [id, getToken, isLoaded])

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
     if (!isTranscribing && transcriptionText.length === 0) {
        setTranscriptionText(["[SISTEMA]: Trascrizione avviata...", "[VALERIA]: Benvenuta anima cara, sento un'energia positiva oggi..."])
     }
  }

  const handleGenerateSummary = async () => {
     if (transcriptionText.length < 2 && drawnCards.length === 0) return alert("Nessun dato nella sessione (trascrizione o carte) per creare un riassunto.")
     setIsSummarizing(true)
     try {
        const manualCards = drawnCards.length > 0 ? `\n\nCARTE ESTRATTE SELEZIONATE MANUALMENTE DA VALERIA:\n${drawnCards.map(c => MAJOR_ARCANA[c]).join(', ')}` : ""
        const fullText = transcriptionText.join("\n") + manualCards

        await apiJson(getToken, `/api/staff/consults/${id}/summarize`, {
            method: 'POST',
            body: JSON.stringify({ 
                transcript: fullText, 
                clientName: sessionInfo?.inviteeName || 'Cliente' 
            })
        })
        alert("Riassunto generato e salvato nelle note del cliente!")
     } catch (e: any) {
        alert("Errore generazione riassunto: " + e.message)
     } finally {
        setIsSummarizing(false)
     }
  }

  const handleInvokeOracle = async () => {
     setIsInvokingOracle(true)
     try {
        const res = await apiJson<any>(getToken, `/api/staff/live-oracle`, {
            method: 'POST',
            body: JSON.stringify({ 
                transcript: transcriptionText.join("\n"),
                cards: drawnCards.map(c => MAJOR_ARCANA[c]),
                astral: clientAstral
            })
        })
        setOracleInsight(res.insight)
     } catch (e: any) {
        console.error("Oracle error:", e)
     } finally {
        setIsInvokingOracle(false)
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

          {/* Metrics Timer come nelle Chat */}
          <div className="flex bg-black/40 border border-gold-500/20 rounded-2xl p-4 mb-6 relative overflow-hidden items-center justify-between">
             <div className="absolute top-0 left-0 w-1 h-full bg-gold-500 animate-pulse" />
             <div>
                <span className="text-[8px] uppercase text-white/40 block mb-1 font-bold tracking-widest">Tempo Trascorso</span>
                <span className="font-mono font-black text-2xl gold-text tracking-tighter">
                   {Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
                </span>
             </div>
             <div className="text-right">
                <span className="text-[8px] uppercase text-white/40 block mb-1 font-bold tracking-widest">{isStaff ? 'Incasso' : 'Costo Attuale'}</span>
                <span className="font-mono font-bold text-xl text-emerald-400">{currentTotalCost} CR</span>
             </div>
          </div>

          {/* Widget Astrologico Cliente */}
          {clientAstral && (
             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 relative overflow-hidden group hover:border-gold-500/30 transition-all">
                {/* Background decorative wheel */}
                <div className="absolute right-[-20%] top-[-20%] w-32 h-32 border-4 border-gold-500/10 rounded-full flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform duration-700">
                    <div className="w-full h-px bg-gold-500/10 absolute rotate-0" />
                    <div className="w-full h-px bg-gold-500/10 absolute rotate-45" />
                    <div className="w-full h-px bg-gold-500/10 absolute rotate-90" />
                    <div className="w-full h-px bg-gold-500/10 absolute rotate-[135deg]" />
                    <div className="w-24 h-24 border-2 border-gold-500/10 rounded-full absolute" />
                </div>

                <h3 className="text-[9px] uppercase tracking-widest font-black text-gold-500 mb-4 opacity-80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" /> Mappa del Cielo (Fissa)
                </h3>
                
                <div className="grid grid-cols-2 gap-3 relative z-10">
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                        <span className="text-xs text-amber-400 block mb-1">☉ Sole</span>
                        <p className="text-[10px] font-bold uppercase tracking-wider">{clientAstral.sole}</p>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                        <span className="text-xs text-blue-300 block mb-1">☽ Luna</span>
                        <p className="text-[10px] font-bold uppercase tracking-wider">{clientAstral.luna}</p>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                        <span className="text-xs text-purple-400 block mb-1">🏹 Ascendente</span>
                        <p className="text-[10px] font-bold uppercase tracking-wider">{clientAstral.asc}</p>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest block mb-1 mt-0.5">Fase Lunare</span>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Analisi in corso...</p>
                    </div>
                </div>
             </div>
          )}

          {/* Attachments Area */}
          <div className="flex-1 flex flex-col min-h-0">
             <h3 className="text-[10px] uppercase tracking-widest font-black text-white/40 mb-3 px-1">Elementi Condivisi</h3>
             <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {attachments.length === 0 ? (
                   <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                      <p className="text-[9px] text-white/30 italic font-bold">Nessun file condiviso</p>
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

                    <button 
                        onClick={handleInvokeOracle}
                        disabled={isInvokingOracle}
                        className={`py-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${oracleInsight ? 'bg-gold-500/10 border-gold-500/40 text-gold-500' : 'bg-white/5 border-white/5 text-white/40'}`}
                    >
                        <span className="text-xs">{isInvokingOracle ? '⌛' : '👁️'}</span>
                        <span className="text-[8px] uppercase font-bold tracking-widest">Invoca Oracolo</span>
                    </button>
                </div>

                {oracleInsight && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gold-500/5 border border-gold-500/20 rounded-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center gap-2 mb-2">
                             <span className="text-[8px] uppercase font-black text-gold-500 tracking-widest">Sussurro dell'Oracolo</span>
                             <div className="flex-1 h-px bg-gold-500/20" />
                        </div>
                        <p className="text-[10px] italic leading-relaxed text-white/80 font-serif">
                            "{oracleInsight}"
                        </p>
                    </motion.div>
                )}

                {/* Secret Tarot Card Pad */}
                <div className="bg-black/20 border border-white/5 rounded-2xl p-4 mt-4">
                    <h4 className="text-[9px] uppercase tracking-widest font-black text-white/40 mb-3 flex items-center justify-between">
                        <span>Taccuino Arcani Maggiori</span>
                        <span className="text-gold-500">{drawnCards.length} Svelati</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                        {MAJOR_ARCANA.map((card, i) => {
                            const isSelected = drawnCards.includes(i)
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (drawnCards.includes(i)) setDrawnCards(drawnCards.filter(c => c !== i))
                                        else setDrawnCards([...drawnCards, i])
                                    }}
                                    title={card}
                                    className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                                        isSelected ? 'bg-gold-500 text-black shadow-[0_0_10px_rgba(212,160,23,0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {i === 0 ? '0' : i}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {(transcriptionText.length > 0 || drawnCards.length > 0) && (
                    <button 
                        onClick={handleGenerateSummary}
                        disabled={isSummarizing}
                        className="w-full py-3 bg-gold-500/10 border border-gold-500/20 rounded-xl text-gold-500 text-[9px] uppercase font-black tracking-widest hover:bg-gold-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isSummarizing ? (
                            <div className="w-3 h-3 border-t-2 border-gold-500 rounded-full animate-spin" />
                        ) : (
                            <span>✨</span>
                        )}
                        {isSummarizing ? 'Sintetizzazione...' : 'Sintetizza Sessione (Gemini)'}
                    </button>
                )}

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
            <div className="w-full h-full max-w-6xl aspect-video bg-zinc-900 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-2 border-gold-500/30 relative group">
                <iframe 
                    ref={iframeRef} src={dailyRoomUrl}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="w-full h-full border-none" title="Video"
                />

                {/* 🏷️ Lower Thirds Overlay */}
                <AnimatePresence>
                    {!isEnding && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-8 left-8 right-8 pointer-events-none z-50 flex items-end justify-between"
                        >
                            {/* Valeria's Identity */}
                            <div className="bg-black/40 backdrop-blur-2xl border-l-[3px] border-gold-500 p-4 rounded-r-3xl flex items-center gap-6 shadow-2xl">
                                <div>
                                    <h4 className="text-white font-serif font-black text-xs uppercase tracking-[0.2em] leading-none mb-1.5">Valeria Di Pace</h4>
                                    <p className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Mentore Evolutivo</p>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="flex gap-4">
                                    <div className="text-center">
                                         <span className="text-xs block text-amber-400">☉</span>
                                         <span className="text-[7px] uppercase font-black text-white/60">{valeriaAstral.sole}</span>
                                    </div>
                                    <div className="text-center">
                                         <span className="text-xs block text-blue-300">☽</span>
                                         <span className="text-[7px] uppercase font-black text-white/60">{valeriaAstral.luna}</span>
                                    </div>
                                    <div className="text-center">
                                         <span className="text-xs block text-purple-400">🏹</span>
                                         <span className="text-[7px] uppercase font-black text-white/60">{valeriaAstral.asc}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Client's Identity (if available) */}
                            {clientAstral && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-black/40 backdrop-blur-2xl border-r-[3px] border-indigo-400 p-4 rounded-l-3xl flex items-center gap-6 shadow-2xl text-right"
                                >
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                             <span className="text-xs block text-indigo-300">☉</span>
                                             <span className="text-[7px] uppercase font-black text-white/60">{clientAstral.sole}</span>
                                        </div>
                                        <div className="text-center">
                                             <span className="text-xs block text-indigo-200">☽</span>
                                             <span className="text-[7px] uppercase font-black text-white/60">{clientAstral.luna}</span>
                                        </div>
                                        <div className="text-center">
                                             <span className="text-xs block text-indigo-400">🏹</span>
                                             <span className="text-[7px] uppercase font-black text-white/60">{clientAstral.asc}</span>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-white/10" />
                                    <div>
                                        <h4 className="text-white font-serif font-black text-xs uppercase tracking-[0.2em] leading-none mb-1.5">{sessionInfo?.inviteeName || 'Cliente'}</h4>
                                        <p className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Viaggiatore Astrale</p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
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

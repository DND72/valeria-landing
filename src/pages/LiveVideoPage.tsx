import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import { apiJson, ApiError } from '../lib/api'

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

  // Stati per l'interfaccia e la chiamata
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [seconds, setSeconds] = useState(0)
  const [isEnding, setIsEnding] = useState(false)
  const [isVideoJoined, setIsVideoJoined] = useState(false) // Valeria/Cliente è entrato nella stanza Daily?
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [successData, setSuccessData] = useState<{ credits: number, euro: string } | null>(null)

  // URL generato dal backend per l'iframe di Daily.co
  const [dailyRoomUrl, setDailyRoomUrl] = useState<string | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Ascolta il timer (parte appena la chiamata status = in_progress)
  useEffect(() => {
    if (!sessionInfo?.actualStartAt || sessionInfo?.status !== 'in_progress') return
    const startAt = new Date(sessionInfo.actualStartAt).getTime()
    if (isNaN(startAt)) return

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.floor((now - startAt) / 1000)
      setSeconds(diff > 0 ? diff : 0)
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionInfo?.actualStartAt, sessionInfo?.status])

  // POLLING dello status del Consulto e recupero link Video
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
          if (res.videoLink && !dailyRoomUrl) {
             setDailyRoomUrl(res.videoLink)
          }
       } catch (err) { console.error('[video poll]', err) }
    }
    
    void fetchSessionStatus()
    const poll = setInterval(fetchSessionStatus, 5000)
    return () => {
       isMounted = false
       clearInterval(poll)
    }
  }, [id, getToken, dailyRoomUrl, isEnding, isLoaded])

  // MESSAGGI DALL'IFRAME DI DAILY
  // Possiamo ascoltare quando l'utente si unisce o lascia per aggiornare gli stati
  useEffect(() => {
    const handleDailyMessage = (e: MessageEvent) => {
        if (e.origin !== "https://nonsolotarocchi.daily.co") return
        
        if (e.data?.action === 'joined-meeting') {
            setIsVideoJoined(true)
            // Se entriamo noi e siamo staff, magari mandiamo un ping di 'actual_start_at'
            if (isStaff && sessionInfo?.status === 'scheduled') {
                void handleAcceptSession()
            }
        }
        if (e.data?.action === 'left-meeting') {
            setIsVideoJoined(false)
        }
    }
    window.addEventListener('message', handleDailyMessage)
    return () => window.removeEventListener('message', handleDailyMessage)
  }, [isStaff, sessionInfo])

  const handleAcceptSession = async () => {
    try {
      await apiJson<any>(getToken, `/api/booking/session/${id}/accept`, { method: 'POST' })
    } catch (e: any) {
      console.warn('[Accept error]', e.message)
    }
  }

  const handleEndSession = async () => {
    if (!window.confirm(`Sei ${isStaff ? 'sicura' : 'sicuro'} di voler terminare il videoconsulto? I crediti verranno immediatamente interrotti.`)) return
    setIsEnding(true)
    try {
      if (isStaff) {
         const actualMinutes = Math.floor(seconds / 60)
         const res = await apiJson<any>(getToken, `/api/staff/consults/${id}/claim`, { 
           method: 'POST',
           body: JSON.stringify({ actualDurationMinutes: actualMinutes })
         })
         
         const coinSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3')
         void coinSound.play().catch(() => {})
         
         const creditsEarned = res.actualCost ?? currentTotalCost
         const euroEarned = typeof creditsEarned === 'number' && !isNaN(creditsEarned) ? creditsEarned.toFixed(2) : "0.00"
         
         setSuccessData({ credits: creditsEarned, euro: euroEarned })
      } else {
         await apiJson(getToken, `/api/booking/session/${id}/abandon`, { method: 'POST' }).catch(() => {})
         navigate('/area-personale')
      }
    } catch (e: any) {
      alert(e.message || "Errore chiusura video.")
      setIsEnding(false)
    }
  }

  const currentTotalCost = (sessionInfo && sessionInfo.costCredits && sessionInfo.expectedDuration) 
    ? Math.floor((seconds / 60) * (sessionInfo.costCredits / sessionInfo.expectedDuration)) 
    : 0

  const clientName = sessionInfo?.inviteeName || 'Cliente'
  const displayName = isStaff ? clientName : 'Valeria Di Pace'

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-[#050810] flex flex-col items-center justify-center gap-4 z-[99999]">
         <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
         <p className="text-indigo-400 font-serif text-sm uppercase tracking-widest animate-pulse">Setup Video Stanza...</p>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 h-screen w-screen flex flex-col z-[10000] overflow-hidden transition-colors duration-700 ${
      theme === 'dark' ? 'bg-[#050810] text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* HEADER DI CONTROLLO */}
      <header className={`relative z-50 h-20 shrink-0 px-6 flex items-center justify-between border-b backdrop-blur-3xl transition-all ${
         theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-slate-300 bg-white/70 shadow-sm'
      }`}>
         <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full overflow-hidden shadow-lg ${isStaff ? 'border-indigo-500' : 'border-amber-500'}`}>
               <img src="/valeria-hero.jpg" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
               <h1 className="text-sm font-serif font-black tracking-[0.2em] uppercase">{String(displayName)}</h1>
               <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${sessionInfo?.status === 'in_progress' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-60">
                    {sessionInfo?.status === 'in_progress' ? 'LIVE - CONTEGGIO ATTIVO' : 'SALA VIDEO PRIVATA'}
                  </p>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            {/* TIMER E CREDITI (Appaiono solo a console avviata) */}
            {sessionInfo?.status === 'in_progress' && (
               <div className={`px-5 py-2 rounded-2xl border flex items-center gap-4 transition-all mr-2 ${
                  theme === 'dark' ? 'bg-black/40 border-white/10 shadow-inner' : 'bg-white border-slate-200'
               }`}>
                  <div className="flex flex-col items-center">
                     <span className="text-[8px] uppercase tracking-widest opacity-50 font-bold text-red-500">REC</span>
                     <span className="font-mono font-black text-lg leading-none">
                        {Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
                     </span>
                  </div>
                  <div className="h-6 w-px bg-current opacity-10" />
                  <div className="flex flex-col items-center">
                     <span className="text-[8px] uppercase tracking-widest opacity-50 font-bold">{isStaff ? 'Incasso' : 'Costo'}</span>
                     <span className="text-emerald-500 font-mono font-black text-lg leading-none">
                        {currentTotalCost} cr
                     </span>
                  </div>
               </div>
            )}

            {!isEnding && (
               <button 
                  onClick={handleEndSession}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all"
               >
                  Termina Consulto
               </button>
            )}

            <button 
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                  theme === 'dark' ? 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10' : 'bg-transparent border-slate-300 text-slate-500 hover:bg-slate-200'
               }`}
            >
               {theme === 'dark' ? '☀️' : '🌙'}
            </button>
         </div>
      </header>

      {/* ZONA VIDEO (IFRAME DAILY.CO) */}
      <main className="relative z-10 flex-1 flex flex-col bg-black">
         {dailyRoomUrl ? (
            <iframe 
               ref={iframeRef}
               src={dailyRoomUrl}
               allow="camera; microphone; fullscreen; display-capture; autoplay"
               className="w-full h-full border-none outline-none"
               title="Video Consulto Valeria"
            />
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-black to-indigo-950/20">
               <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
               <p className="text-indigo-400/60 font-serif uppercase tracking-widest animate-pulse font-bold text-sm">
                 Autenticazione Stanza Video in corso...
               </p>
            </div>
         )}
      </main>

      {/* MODAL SUCCESS SOLO PER VALERIA */}
      <AnimatePresence>
        {successData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full text-center bg-zinc-900 border border-white/10 p-8 rounded-3xl"
            >
              <h2 className="text-3xl font-serif font-black text-white mb-2 uppercase tracking-tighter">Perfetto!</h2>
              <p className="text-emerald-500 font-black text-[10px] tracking-[0.4em] uppercase mb-8">Videochiamata Terminata & Incassata</p>

              <div className="bg-black/50 border border-white/5 rounded-2xl p-6 mb-8 text-left shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase font-black text-white/40 mb-2">Ricavo netto (In Euro)</span>
                  <span className="text-6xl font-serif font-black text-white tracking-tighter">€ {successData.euro}</span>
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-4">Transazione Wallet ✅</span>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/control-room')}
                className="w-full bg-white hover:bg-gray-200 text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all"
              >
                Torna al Diario
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

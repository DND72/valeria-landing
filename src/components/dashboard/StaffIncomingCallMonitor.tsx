import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { apiJson } from '../../lib/api'

interface ConsultWaiting {
  id: string
  invitee_name: string | null
  invitee_email: string | null
  service_kind: string
  created_at: string
}

export default function StaffIncomingCallMonitor() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  
  const [waitingCall, setWaitingCall] = useState<ConsultWaiting | null>(null)
  const [timeLeft, setTimeLeft] = useState(120)
  const [accepting, setAccepting] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isStaff = user?.publicMetadata?.role === 'staff'

  useEffect(() => {
    if (!isStaff) return

    // Professional digital chime, clear and non-human
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3')
    audioRef.current.loop = true
    audioRef.current.crossOrigin = "anonymous"

    const poll = async () => {
      if (waitingCall) return // Don't poll if we already have a call showing locally
      try {
        const consults = await apiJson<any[]>(getToken, '/api/staff/consults')
        const waiting = consults.find(c => c.status === 'client_waiting')
        
        if (waiting) {
          setWaitingCall({
            id: waiting.id,
            invitee_name: waiting.invitee_name,
            invitee_email: waiting.invitee_email,
            service_kind: waiting.service_kind,
            created_at: waiting.created_at
          })
          
          // Start sound
          audioRef.current?.play().catch(() => {
             console.log("Audio play blocked by browser. User interaction needed.")
          })
        }
      } catch (err) {
        // quiet fail
      }
    }

    const interval = setInterval(poll, 2000)
    return () => {
      clearInterval(interval)
      audioRef.current?.pause()
    }
  }, [getToken, waitingCall, isStaff])

  // Countdown logic
  useEffect(() => {
    if (!waitingCall) {
      setTimeLeft(120)
      return
    }

    const timer = setInterval(() => {
      const start = new Date(waitingCall.created_at).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - start) / 1000)
      const remaining = Math.max(0, 120 - elapsed)
      
      setTimeLeft(remaining)

      if (remaining <= 0) {
        handleDismiss()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [waitingCall])

  const handleDismiss = () => {
    setWaitingCall(null)
    audioRef.current?.pause()
  }

  const handleAccept = async () => {
    if (!waitingCall) return
    setAccepting(true)
    try {
      // 1. Set status to BUSY
      await apiJson(getToken, `/api/staff/presence`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'busy' }),
      })

      // 2. Stop audio
      audioRef.current?.pause()

      // 3. Move to session
      navigate(`/sessione/${waitingCall.id}`)
      setWaitingCall(null)
    } catch (err) {
      console.error("Failed to accept call", err)
    } finally {
      setAccepting(false)
    }
  }

  return (
    <AnimatePresence>
      {waitingCall && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
        >
          {/* Pulsing Background Rays */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-600/10 rounded-full blur-[120px] animate-pulse" />
          </div>

          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-xl bg-gradient-to-b from-[#1a1c1e] to-[#0a0a0c] border border-gold-500/30 rounded-[40px] p-10 shadow-[0_0_100px_rgba(212,160,23,0.15)] text-center relative overflow-hidden"
          >
            {/* Countdown Ring */}
            <div className="mb-8 relative flex items-center justify-center">
              <svg className="w-32 h-32 -rotate-90">
                <circle
                  cx="64" cy="64" r="60"
                  stroke="currentColor" strokeWidth="4" fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="64" cy="64" r="60"
                  stroke="currentColor" strokeWidth="4" fill="transparent"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - timeLeft / 120)}
                  className="text-gold-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center mb-1">
                <span className="text-4xl font-mono font-bold text-white leading-none">{timeLeft}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Secondi</span>
              </div>
            </div>

            <h2 className="text-3xl font-serif font-bold text-white mb-2">Richiesta Chat in Arrivo!</h2>
            <p className="text-gold-400 font-bold uppercase tracking-[0.2em] text-sm mb-8 animate-pulse">
               ⚡ {waitingCall.service_kind === 'chat_15' ? 'CONSULTO FLASH' : 'CONSULTO LIVE'}
            </p>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10">
               <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Cliente</p>
               <h3 className="text-2xl text-white font-bold mb-1">{waitingCall.invitee_name || 'Anima in Cammino'}</h3>
               <p className="text-white/50 text-sm font-light italic">"{waitingCall.invitee_email || 'Richiesta Immediata'}"</p>
            </div>

            <div className="flex flex-col gap-4">
               <button 
                 onClick={handleAccept}
                 disabled={accepting}
                 className="w-full btn-gold py-5 rounded-2xl text-lg font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(212,160,23,0.4)] hover:shadow-[0_0_50px_rgba(212,160,23,0.6)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {accepting ? 'Sincronizzazione...' : (
                   <>
                     <span className="text-2xl">📞</span>
                     ACCETTA ORA
                   </>
                 )}
               </button>
               
               <button 
                 onClick={handleDismiss}
                 className="text-white/30 hover:text-white/60 text-xs uppercase tracking-widest font-bold py-2 transition-colors"
               >
                 Ignora (Silenzia)
               </button>
            </div>

            {/* Subtle glow edge */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

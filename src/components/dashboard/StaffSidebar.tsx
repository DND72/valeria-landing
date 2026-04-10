import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { apiJson } from '../../lib/api'
import { type ValeriaPresenceStatus } from '../../lib/valeriaPresence'
import { getApiBaseUrl } from '../../constants/api'

type StaffSidebarProps = {
  activeTab: string
  onTabChange: (tab: any) => void
  theme?: 'dark' | 'light'
  onToggleTheme?: () => void
}

const WORKSPACE_LINKS = [
  { id: 'live', label: 'Monitor Live', emoji: '📡' },
  { id: 'oggi', label: 'Oggi', emoji: '📅' },
  { id: 'crm', label: 'CRM Rapido', emoji: '👥' },
  { id: 'analytics', label: 'Analytics', emoji: '📊' },
  { id: 'lenormand', label: 'Il Mentore', emoji: '🃏' },
  { id: 'astrologia', label: 'Tema Staff', emoji: '🌌' },
]

const ADMIN_LINKS = [
  { to: '/control-room', label: 'Control Room', emoji: '🕹️' },
  { to: '/gestione-clienti', label: 'Gestione Clienti', emoji: '📇' },
  { to: '/gestione-recensioni', label: 'Recensioni', emoji: '⭐' },
  { to: '/gestione-commenti-blog', label: 'Commenti Blog', emoji: '💬' },
]

export default function StaffSidebar({ activeTab, onTabChange, theme = 'dark', onToggleTheme }: StaffSidebarProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  
  // Utilizziamo una cache locale nel window per evitare il salto all'offline durante il cambio tab
  const [presence, setPresence] = useState<ValeriaPresenceStatus>(() => {
     if (typeof window !== 'undefined' && (window as any).__VALERIA_PRESENCE) {
        return (window as any).__VALERIA_PRESENCE
     }
     return 'offline'
  })
  const [presenceSaving, setPresenceSaving] = useState(false)

  const [hasNewRequest, setHasNewRequest] = useState(false)
  const prevWaitingIdsRef = useRef<Set<string>>(new Set())
  const audioNotificationRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Inizializza l'avviso acustico globale per nuova richiesta (indipendentemente dalla pagina)
    audioNotificationRef.current = new Audio('/sounds/suono_suora.mp3')
  }, [])
  
  const loadPresence = useCallback(async () => {
    if (!getApiBaseUrl()) return
    // Se stiamo salvando, non sovrascrivere lo stato locale con quello (potenzialmente vecchio) del server
    if (presenceSaving) return

    try {
      // Per il segnale di "nuova richiesta", controlliamo l'elenco dei consulti appena prenotati o in attesa
      const consults = await apiJson<any[]>(getToken, '/api/staff/consults')
      const waitingConsults = consults?.filter(c => c.status === 'scheduled' || c.status === 'client_waiting') || []
      
      setHasNewRequest(waitingConsults.length > 0)

      // Se troviamo un consulto con ID che non avevamo visto nello stato "in attesa", suoniamo!
      const currentWaitingIds = new Set(waitingConsults.map(c => c.id))
      let hasNew = false
      for (const id of currentWaitingIds) {
         if (!prevWaitingIdsRef.current.has(id)) {
            hasNew = true
            break
         }
      }
      
      if (hasNew) {
         void audioNotificationRef.current?.play().catch(() => {})
      }
      prevWaitingIdsRef.current = currentWaitingIds

      // Carichiamo anche la presenza
      const r = await apiJson<{ status: ValeriaPresenceStatus }>(getToken, '/api/staff/presence')
      if (r.status) {
        setPresence(r.status)
        if (typeof window !== 'undefined') (window as any).__VALERIA_PRESENCE = r.status
      }
    } catch { /* ignore */ }
  }, [getToken, presenceSaving])

  useEffect(() => {
    void loadPresence()
    const timer = setInterval(loadPresence, 3000)
    return () => clearInterval(timer)
  }, [loadPresence])

  const setStatus = async (status: ValeriaPresenceStatus) => {
    // Ottimismo: aggiorniamo subito l'interfaccia e la cache globale della finestra
    setPresence(status)
    if (typeof window !== 'undefined') (window as any).__VALERIA_PRESENCE = status
    
    setPresenceSaving(true)
    try {
      await apiJson(getToken, '/api/staff/presence', {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    } catch { 
       // Se fallisce, ricarichiamo lo stato reale
       void loadPresence()
    } finally {
      setPresenceSaving(false)
    }
  }

  const isHome = pathname === '/area-personale'

  return (
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={`fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col shadow-2xl transition-colors duration-500 backdrop-blur-md ${
        theme === 'light' ? 'bg-staff-sidebar-bg border-r border-staff-gold/10' : 'bg-black/80 border-r border-white/10'
      }`}
    >

      {/* Brand / Logo */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo-small.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div className="min-w-0">
            <p className="font-serif text-lg font-bold text-white leading-none truncate">Staff Hub</p>
            <p className="text-[9px] uppercase tracking-widest text-gold-500 font-bold mt-1">Valeria</p>
          </div>
        </div>
        
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-gold-500 hover:border-gold-500/30 transition-all"
            title={theme === 'dark' ? 'Modalità Giorno' : 'Modalità Notte'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        
        {/* Status Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
             <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Il tuo Stato</p>
             {presenceSaving && <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-ping" />}
          </div>
          <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {(['online', 'busy', 'offline'] as ValeriaPresenceStatus[]).map((s) => {
              const active = presence === s
              const color = s === 'online' ? 'bg-emerald-500' : s === 'busy' ? 'bg-amber-500' : 'bg-white/40'
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${
                    active ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5 opacity-40 hover:opacity-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${color} mb-1 ${active ? 'animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`} />
                  <span className={`text-[9px] uppercase font-bold ${active ? 'text-white' : 'text-white/40'}`}>{s}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Workspace Nav */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-2">Monitoraggio</p>
          <div className="space-y-1">
            {WORKSPACE_LINKS.map((link) => {
              const active = isHome && activeTab === link.id
              const shouldGlow = link.id === 'live' && hasNewRequest
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (!isHome) {
                      navigate(`/area-personale?tab=${link.id}`)
                    } else {
                      onTabChange(link.id)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative ${
                    active 
                      ? 'bg-gold-500 text-black font-bold shadow-lg shadow-gold-500/20' 
                      : shouldGlow 
                      ? 'bg-gold-500/20 text-gold-400 font-bold border border-gold-500/40 animate-pulse shadow-[0_0_15px_rgba(212,160,23,0.3)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{link.emoji}</span>
                  {link.label}
                  {shouldGlow && <span className="absolute right-3 w-2 h-2 bg-gold-400 rounded-full animate-ping" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Admin Nav */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-2">Gestione Sistema</p>
          <div className="space-y-1">
            {ADMIN_LINKS.map((link) => {
              const active = pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active 
                      ? 'bg-white/10 text-gold-400 font-bold ring-1 ring-gold-500/30' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{link.emoji}</span>
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          {user?.imageUrl && <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full border border-white/10" />}
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.firstName || 'Valeria'}</p>
            <p className="text-[10px] text-white/40 truncate">Master Admin</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full py-2 rounded-lg border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Esci dal Portale
        </button>
      </div>
    </motion.aside>
  )
}

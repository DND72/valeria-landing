import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { useState, useEffect, useCallback } from 'react'
import { apiJson } from '../../lib/api'
import { type ValeriaPresenceStatus } from '../../lib/valeriaPresence'
import { getApiBaseUrl } from '../../constants/api'

type StaffSidebarProps = {
  activeTab: string
  onTabChange: (tab: any) => void
}

const WORKSPACE_LINKS = [
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

export default function StaffSidebar({ activeTab, onTabChange }: StaffSidebarProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  
  const [presence, setPresence] = useState<ValeriaPresenceStatus>('offline')
  const [presenceSaving, setPresenceSaving] = useState(false)

  const loadPresence = useCallback(async () => {
    if (!getApiBaseUrl()) return
    try {
      const r = await apiJson<{ status: ValeriaPresenceStatus }>(getToken, '/api/staff/presence')
      setPresence(r.status)
    } catch { /* ignore */ }
  }, [getToken])

  useEffect(() => {
    void loadPresence()
  }, [loadPresence])

  const setStatus = async (status: ValeriaPresenceStatus) => {
    setPresenceSaving(true)
    try {
      await apiJson(getToken, '/api/staff/presence', {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setPresence(status)
    } catch { /* ignore */ } finally {
      setPresenceSaving(false)
    }
  }

  const isHome = pathname === '/area-personale'

  return (
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/10 z-50 flex flex-col shadow-2xl"
    >

      {/* Brand / Logo */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <img src="/logo-small.png" alt="Logo" className="w-8 h-8 object-contain" />
        <div>
          <p className="font-serif text-lg font-bold text-white leading-none">Staff Hub</p>
          <p className="text-[9px] uppercase tracking-widest text-gold-500 font-bold mt-1">Valeria Di Pace</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        
        {/* Status Selector */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-2">Il tuo Stato</p>
          <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {(['online', 'busy', 'offline'] as ValeriaPresenceStatus[]).map((s) => {
              const active = presence === s
              const color = s === 'online' ? 'bg-emerald-500' : s === 'busy' ? 'bg-amber-500' : 'bg-white/40'
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  disabled={presenceSaving}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${
                    active ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${color} mb-1 ${active ? 'animate-pulse' : ''}`} />
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
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (!isHome) {
                      // Se non siamo in area-personale, ci andiamo prima
                      navigate(`/area-personale?tab=${link.id}`)
                    } else {
                      onTabChange(link.id)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active 
                      ? 'bg-gold-500 text-black font-bold shadow-lg shadow-gold-500/20' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{link.emoji}</span>
                  {link.label}
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


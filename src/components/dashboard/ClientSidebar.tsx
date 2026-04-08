import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'

type ClientSidebarProps = {
  theme?: 'dark' | 'light'
  onToggleTheme?: () => void
}

const CLIENT_LINKS = [
  { to: '/area-personale', label: 'Il mio Diario', emoji: '📒' },
  { to: '/area-personale/wallet', label: 'Il mio Wallet', emoji: '💰' },
  { to: '/area-personale/miei-consulti', label: 'I miei Consulti', emoji: '🔮' },
  { to: '/area-personale/i-miei-temi', label: 'Mappe Astrali', emoji: '🌌' },
]

const EXPLORE_LINKS = [
  { to: '/crescita-personale', label: 'Crescita', emoji: '🌿' },
  { to: '/cielo', label: 'Cielo Attuale', emoji: '✨' },
  { to: '/blog', label: 'Blog', emoji: '✍️' },
]

export default function ClientSidebar({ theme = 'dark', onToggleTheme }: ClientSidebarProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/10 z-50 flex flex-col shadow-2xl"
    >

      {/* Brand / Logo */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo-small.png" alt="Logo" className="w-8 h-8 object-contain cursor-pointer" onClick={() => navigate('/')} />
          <div className="min-w-0">
            <p className="font-serif text-lg font-bold text-white leading-none truncate">Il mio Diario</p>
            <p className="text-[9px] uppercase tracking-widest text-gold-500 font-bold mt-1">Nonsolotarocchi</p>
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
        
        {/* Main Client Nav */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-2">Il tuo Percorso</p>
          <div className="space-y-1">
            {CLIENT_LINKS.map((link) => {
              const active = pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active 
                      ? 'bg-gold-500 text-black font-bold shadow-lg shadow-gold-500/20' 
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

        {/* Explore Resources */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-2">Esplora</p>
          <div className="space-y-1">
            {EXPLORE_LINKS.map((link) => {
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
            <p className="text-xs font-bold text-white truncate">{user?.firstName || 'Cara Cliente'}</p>
            <p className="text-[10px] text-white/40 truncate">Membro Evolutivo</p>
          </div>
        </div>
        <button
          onClick={() => signOut(() => navigate('/'))}
          className="w-full py-2 rounded-lg border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Esci dal Diario
        </button>
      </div>
    </motion.aside>
  )
}

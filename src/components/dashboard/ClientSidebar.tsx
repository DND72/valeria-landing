import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'

type ClientSidebarProps = {
  theme?: 'dark' | 'light'
  onToggleTheme?: () => void
}

const CORE_LINKS = [
  { to: '/area-personale', label: 'Il mio Diario', emoji: '📒' },
  { to: '/area-personale/wallet', label: 'Il mio Wallet', emoji: '💰' },
  { to: '/area-personale/i-miei-consulti', label: 'I miei Consulti', emoji: '🔮' },
]

const ASTRO_LINKS = [
  { to: '/area-personale/tema-natale', label: 'Tema Natale Free', emoji: '✨' },
  { to: '/area-personale/i-miei-temi', label: 'Mappe Astrali (Premium)', emoji: '🌌' },
  { to: '/area-personale/bi-wheel', label: 'Bi-Wheel', emoji: '🧬' },
  { to: '/affinita-di-coppia', label: 'Affinità di Coppia', emoji: '❤️' },
  { to: '/area-personale/mentore', label: 'La Mentore Silente', emoji: '🧠' },
];

const EXPLORE_LINKS = [
  { to: '/crescita-personale', label: 'Crescita', emoji: '🌿' },
  { to: '/cielo', label: 'Cielo Attuale', emoji: '✨' },
  { to: '/blog', label: 'Blog', emoji: '✍️' },
]

export default function ClientSidebar({ theme = 'dark', onToggleTheme }: ClientSidebarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={`fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col shadow-2xl transition-colors duration-500 backdrop-blur-sm ${
        theme === 'light' ? 'bg-staff-sidebar-bg border-r border-staff-gold/10' : 'bg-black/40 border-r border-white/5'
      }`}
    >

      {/* Brand / Logo */}
      <div className={`p-6 border-b flex items-center justify-between ${theme === 'light' ? 'border-staff-gold/10' : 'border-white/5'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo-small.png" alt="Logo" className="w-8 h-8 object-contain cursor-pointer" onClick={() => navigate('/')} />
          <div className="min-w-0">
            <p className={`font-serif text-lg font-bold leading-none truncate ${theme === 'light' ? 'text-dark-500' : 'text-white'}`}>Il mio Diario</p>
            <p className="text-[9px] uppercase tracking-widest text-gold-500 font-bold mt-1">Nonsolotarocchi</p>
          </div>
        </div>
        
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-all ${
              theme === 'light' 
                ? 'border-staff-gold/30 text-dark-500/40 hover:text-staff-gold' 
                : 'border-white/10 text-white/40 hover:text-gold-500'
            }`}
            title={theme === 'dark' ? 'Modalità Giorno' : 'Modalità Notte'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        
        {/* Main Client Nav */}
        <div className="space-y-2">
          <p className={`text-[10px] uppercase tracking-widest font-bold px-2 ${theme === 'light' ? 'text-dark-500/40' : 'text-white/30'}`}>Il tuo Percorso</p>
          <div className="space-y-1">
            {CORE_LINKS.map((link) => {
              const active = pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active 
                    ? (theme === 'light' ? 'bg-staff-gold text-white font-bold' : 'bg-white/10 text-white font-bold ring-1 ring-white/20')
                    : (theme === 'light' ? 'text-dark-500/60 hover:text-dark-500 hover:bg-staff-gold/5' : 'text-white/60 hover:text-white hover:bg-white/5')
                }`}
                >
                  <span className="text-base">{link.emoji}</span>
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* ASTRO Nav */}
        <div className="space-y-2">
          <p className={`text-[10px] uppercase tracking-widest font-bold px-2 ${theme === 'light' ? 'text-dark-500/40' : 'text-white/30'}`}>Le mie stelle</p>
          <div className="space-y-1">
            {ASTRO_LINKS.map((link) => {
              const active = pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active 
                    ? (theme === 'light' ? 'bg-staff-gold/10 text-staff-gold font-bold ring-1 ring-staff-gold/30' : 'bg-white/10 text-gold-400 font-bold ring-1 ring-gold-500/30')
                    : (theme === 'light' ? 'text-dark-500/60 hover:text-dark-500 hover:bg-staff-gold/5' : 'text-white/60 hover:text-white hover:bg-white/5')
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
          <p className={`text-[10px] uppercase tracking-widest font-bold px-2 ${theme === 'light' ? 'text-dark-500/40' : 'text-white/30'}`}>Esplora</p>
          <div className="space-y-1">
            {EXPLORE_LINKS.map((link) => {
              const active = pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    active 
                      ? theme === 'light' 
                        ? 'bg-staff-gold/10 text-staff-gold font-bold ring-1 ring-staff-gold/30'
                        : 'bg-white/10 text-gold-400 font-bold ring-1 ring-gold-500/30' 
                      : theme === 'light'
                        ? 'text-dark-500/60 hover:text-dark-500 hover:bg-staff-gold/10'
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
    </motion.aside>
  )
}

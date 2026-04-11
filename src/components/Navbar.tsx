import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { useValeriaPresence } from '../hooks/useValeriaPresence'
import { labelForPresence } from '../lib/valeriaPresence'

const links = [
  { label: 'Chi sono', href: '#chi-sono' },
  { label: 'Galleria', href: '#galleria' },
  { label: 'Crescita personale', href: '/crescita-personale' },
  { label: 'La Stanza Sicura', href: '/stanza-sicura' },
  { label: '🌌 Cielo Zodiacale', href: '/cielo' },
  { label: 'Blog', href: '/blog' },
  { label: 'Recensioni', href: '#recensioni' },
  { label: 'FAQ', href: '/faq' },
]

const privateClientLinks = [
  { label: 'Il tuo Oroscopo Settimanale', href: '/area-personale/mentore' },
  { label: 'Affinità di Coppia ✨', href: '/affinita-di-coppia' },
  { label: 'Wallet', href: '/area-personale/wallet' },
  { label: 'Consulti', href: '/area-personale/i-miei-consulti' },
  { label: 'Temi Natali', href: '/area-personale/i-miei-temi' },
  { label: 'Cielo', href: '/cielo' },
]

const staffLinks = [
  { label: 'Staff Hub', href: '/area-personale' },
  { label: 'Control Room', href: '/control-room' },
  { label: 'Clienti', href: '/gestione-clienti' },
  { label: 'Recensioni', href: '/gestione-recensioni' },
  { label: 'Commenti', href: '/gestione-commenti-blog' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const privileged = isLoaded && user ? isPrivilegedClerkUser(user) : false
  const { data: valeriaPresence } = useValeriaPresence()

  const isCoachingPage = pathname === '/crescita-personale' || pathname === '/stanza-sicura'
  const isDashboardArea = pathname.startsWith('/area-personale')
  const isStaffArea = pathname.startsWith('/control-room') || pathname.startsWith('/gestione-')

  const activeLinks = isStaffArea ? staffLinks : (isDashboardArea ? privateClientLinks : links)
  const barSolid = scrolled || isCoachingPage || isDashboardArea || isStaffArea

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Blocca lo scroll quando il menu è aperto
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'auto'
  }, [menuOpen])

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ zIndex: 2147483640 }}
        className={`fixed top-0 left-0 right-0 transition-all duration-500 ${
          barSolid
            ? 'py-3 bg-dark-500/90 backdrop-blur-md border-b border-gold-600/20 shadow-lg shadow-black/50'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group min-w-0 h-full">
            <img 
              src="/logo-small.png" 
              alt="Logo Nonsolotarocchi" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl md:text-2xl font-bold glow-text-gold tracking-tight whitespace-nowrap">
                  Nonsolotarocchi.it
                </span>
                <div className="hidden sm:flex items-center gap-1.5 ml-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${valeriaPresence?.status === 'online' ? 'bg-emerald-500 animate-pulse' : valeriaPresence?.status === 'busy' ? 'bg-amber-500' : 'bg-white/20'}`} />
                  <span className="text-[9px] uppercase tracking-tighter text-white/30 font-bold whitespace-nowrap">
                    {labelForPresence(valeriaPresence?.status)}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Actions & Menu Toggle */}
          <div className="flex items-center gap-4">
            
            {/* Auth Desktop Side */}
            <div className="hidden md:flex items-center gap-3">
              {isLoaded && user ? (
                <button
                  type="button"
                  onClick={() => navigate('/area-personale')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold-600/30 text-gold-400 text-sm hover:bg-gold-600/10 transition-all font-bold"
                >
                  {user.imageUrl && <img src={user.imageUrl} alt="" className="w-5 h-5 rounded-full" />}
                  <span className="hidden lg:inline">{privileged ? 'Staff Hub' : 'Il tuo Diario'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/registrati')}
                  className="btn-gold text-[13px] px-6 py-2 shadow-[0_0_20px_rgba(212,160,23,0.2)]"
                >
                  Entra nel Diario
                </button>
              )}
            </div>

            {/* 🔥 TASTO MENU A TUTTO SCHERMO */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="group flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all relative z-[2147483647]"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-gold-400 transition-colors">
                {menuOpen ? 'Chiudi' : 'Menu'}
              </span>
              <div className="flex flex-col gap-1 w-5">
                <motion.span 
                  animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="h-0.5 w-full bg-white group-hover:bg-gold-500 transition-colors origin-center" 
                />
                <motion.span 
                  animate={menuOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                  className="h-0.5 w-full bg-white group-hover:bg-gold-500 transition-colors" 
                />
                <motion.span 
                  animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="h-0.5 w-full bg-white group-hover:bg-gold-500 transition-colors origin-center" 
                />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* 🚀 FULL SCREEN OVERLAY MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[2147483641] bg-[#0a0a0b]/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
          >
            {/* Background Decorative Element */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold-500/20 rounded-full rotate-45 transform scale-150 animate-[spin_60s_linear_infinite]" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full -rotate-45 transform scale-110 animate-[spin_40s_linear_infinite_reverse]" />
            </div>

            <nav className="relative z-10 w-full max-w-4xl text-center">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 md:gap-y-12">
                {activeLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    {link.href.startsWith('#') ? (
                      <a
                        href={pathname === '/' ? link.href : `/${link.href}`}
                        onClick={() => setMenuOpen(false)}
                        className="text-4xl md:text-7xl font-serif font-black text-white/40 hover:brilliant-gold-text transition-all duration-300 inline-block hover:scale-110 active:scale-95 group"
                      >
                         <span className="text-gold-500/20 mr-4 font-mono text-xl leading-none align-middle group-hover:text-gold-500/40 transition-colors">0{i+1}</span>
                         {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="text-4xl md:text-7xl font-serif font-black text-white/40 hover:brilliant-gold-text transition-all duration-300 inline-block hover:scale-110 active:scale-95 group"
                      >
                         <span className="text-gold-500/20 mr-4 font-mono text-xl leading-none align-middle group-hover:text-gold-500/40 transition-colors">0{i+1}</span>
                         {link.label}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>

              {/* Mobile Auth (Only visible in Menu if small screen) */}
              <div className="mt-16 md:hidden">
                  {isLoaded && user ? (
                    <button onClick={() => navigate('/area-personale')} className="text-gold-400 font-bold border-b border-gold-500/30 pb-1">Il tuo Diario ✨</button>
                  ) : (
                    <div className="flex flex-col gap-4">
                       <button onClick={() => navigate('/accedi')} className="text-white/40 font-bold text-lg">Accedi</button>
                       <button onClick={() => navigate('/registrati')} className="btn-gold py-4 text-sm font-black tracking-widest uppercase">Iscriviti Ora</button>
                    </div>
                  )}
              </div>
            </nav>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="absolute bottom-12 text-center"
            >
               <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">© {new Date().getFullYear()} Nonsolotarocchi.it</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .brilliant-gold-text {
            background: linear-gradient(180deg, #fffde0 0%, #ffdd00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 20px rgba(255, 220, 80, 0.6));
        }
      `}</style>
    </>
  )
}


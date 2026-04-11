import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { useValeriaPresence } from '../hooks/useValeriaPresence'
import { labelForPresence } from '../lib/valeriaPresence'

// Solo pagine dedicate, niente scroll anchors
const links = [
  { label: 'Chi è Valeria', href: '/chi-sono' },
  { label: 'Crescita personale', href: '/crescita-personale' },
  { label: 'La Stanza Sicura', href: '/stanza-sicura' },
  { label: '🌌 Cielo Zodiacale', href: '/cielo' },
  { label: 'Blog', href: '/blog' },
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

  return (
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
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0 min-w-0 h-full">
          <img 
            src="/logo-small.png" 
            alt="Logo Nonsolotarocchi" 
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl md:text-2xl font-bold glow-text-gold tracking-tight whitespace-nowrap">
                Nonsolotarocchi.it
              </span>
              <div className="hidden sm:flex items-center gap-1.5 ml-1">
                <span className={`w-1.5 h-1.5 rounded-full ${valeriaPresence?.status === 'online' ? 'bg-emerald-500 animate-pulse' : valeriaPresence?.status === 'busy' ? 'bg-amber-500' : 'bg-white/20'}`} />
                <span className="text-[9px] uppercase tracking-tighter text-white/30 font-bold">
                  {labelForPresence(valeriaPresence?.status)}
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Desktop Links (Horizontal) */}
        <ul className="hidden xl:flex items-center gap-8 list-none p-0 m-0">
          {activeLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={`text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive 
                      ? 'brilliant-gold-text scale-110' 
                      : 'text-gold-500/60 hover:text-gold-400 hover:scale-105'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>


        {/* Actions (Auth) */}
        <div className="hidden lg:flex items-center gap-4">
          {isLoaded && user ? (
            <button
              type="button"
              onClick={() => navigate('/area-personale')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold-600/30 text-gold-400 text-sm hover:bg-gold-600/10 transition-all"
            >
              {user.imageUrl && <img src={user.imageUrl} alt="" className="w-5 h-5 rounded-full" />}
              {privileged ? 'Staff Hub' : 'Il tuo Diario'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/accedi')}
                className="text-sm font-bold text-white/60 hover:text-gold-400 transition-colors uppercase tracking-widest"
              >
                Accedi
              </button>
              <button
                type="button"
                onClick={() => navigate('/registrati')}
                className="btn-gold text-[13px] px-6 py-2 shadow-[0_0_20px_rgba(212,160,23,0.2)]"
              >
                Iscriviti Ora
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="xl:hidden text-white/80 hover:text-gold-400 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown (Simplified) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-dark-500/95 backdrop-blur-md border-b border-gold-600/20 px-6 py-6"
          >
            <ul className="flex flex-col gap-5 list-none p-0 m-0">
              {activeLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-lg font-bold text-white/80 hover:text-gold-400 block"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4 border-t border-white/10 flex flex-col gap-4">
                {isLoaded && user ? (
                  <button onClick={() => navigate('/area-personale')} className="text-left text-gold-400 font-bold italic">Il tuo Diario ✨</button>
                ) : (
                  <>
                    <button onClick={() => navigate('/accedi')} className="text-left text-white/60 font-bold uppercase tracking-widest text-sm">Accedi</button>
                    <button onClick={() => navigate('/registrati')} className="btn-gold py-3 text-center uppercase tracking-widest text-[12px]">Iscriviti Ora</button>
                  </>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

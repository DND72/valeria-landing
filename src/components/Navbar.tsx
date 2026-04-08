import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'

const links = [
  { label: 'Chi sono', href: '#chi-sono' },
  { label: 'Galleria', href: '#galleria' },
  { label: 'Crescita personale', href: '/crescita-personale' },
  { label: '🌌 Cielo Zodiacale', href: '/cielo' },
  { label: 'Blog', href: '/blog' },
  { label: 'Recensioni', href: '#recensioni' },
  { label: 'FAQ', href: '/faq' },
]

const privateClientLinks = [
  { label: 'Diario', href: '/area-personale' },
  { label: 'Wallet', href: '/area-personale/wallet' },
  { label: 'Consulti', href: '/area-personale/miei-consulti' },
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

  const isCoachingPage = pathname === '/crescita-personale'
  const isDashboardArea = pathname.startsWith('/area-personale')


  const isStaffArea = pathname.startsWith('/control-room') ||
                      pathname.startsWith('/gestione-')

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
      transition={{ duration: 0.4 }}
      style={{ zIndex: 2147483640 }}
      className={`fixed top-0 left-0 right-0 transition-all duration-500 ${
        barSolid
          ? 'py-3 bg-dark-500/90 backdrop-blur-md border-b border-gold-600/20 shadow-lg shadow-black/50'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3 lg:gap-4">
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo-small.png" 
              alt="Logo Nonsolotarocchi" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain nav-logo"
            />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl md:text-2xl font-bold glow-text-gold tracking-tight">
                  Nonsolotarocchi.it
                </span>
                <span className="text-[10px] md:text-xs text-white/40 font-light tracking-widest uppercase">
                  by Valeria Di Pace
                </span>
              </div>
              <span
                className="text-[9px] uppercase font-bold tracking-[0.2em] w-fit"
                style={{
                  color: 'rgba(255, 210, 80, 0.6)',
                  animation: 'devPulse 2s ease-in-out infinite',
                }}
              >
                site in developing
              </span>
            </div>
          </Link>
        </div>

        <ul className="hidden lg:flex items-center gap-3 list-none p-0 m-0 shrink min-w-0">
          {activeLinks.map((link) => (

            <li key={link.href}>
              {link.href.startsWith('#') ? (
                <a
                  href={pathname === '/' ? link.href : `/${link.href}`}
                  className="text-[13px] text-white/70 hover:text-gold-400 transition-colors duration-200 tracking-wide whitespace-nowrap"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.href}
                  className="text-[13px] text-white/70 hover:text-gold-400 transition-colors duration-200 tracking-wide whitespace-nowrap"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {isLoaded && user ? (
            <button
              type="button"
              onClick={() => navigate('/area-personale')}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gold-600/30 text-gold-400 text-sm hover:bg-gold-600/10 transition-colors"
            >
              {user.imageUrl && <img src={user.imageUrl} alt="" className="w-5 h-5 rounded-full" />}
              {privileged ? 'Staff Hub' : 'Il tuo Diario'}
              {privileged && (
                <span className="text-[10px] uppercase tracking-wide text-gold-500/80 border border-gold-600/30 rounded px-1.5 py-0.5">
                  Staff
                </span>
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/accedi')}
                className="text-sm text-white/60 hover:text-gold-400 transition-colors"
              >
                Accedi
              </button>
              <button
                type="button"
                onClick={() => navigate('/registrati')}
                className="btn-gold text-[13px] px-4 py-2"
              >
                Iscriviti
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden text-white/80 hover:text-gold-400 transition-colors shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
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

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-dark-300/95 backdrop-blur-md border-t border-gold-600/20"
          >
            <ul className="flex flex-col px-6 py-4 gap-4 list-none p-0 m-0">
              {activeLinks.map((link) => (

                <li key={link.href}>
                  {link.href.startsWith('#') ? (
                    <a
                      href={pathname === '/' ? link.href : `/${link.href}`}
                      className="text-white/80 hover:text-gold-400 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-white/80 hover:text-gold-400 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="flex flex-col gap-2">
                {isLoaded && user ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/area-personale')
                      setMenuOpen(false)
                    }}
                    className="text-left text-white/80 hover:text-gold-400 transition-colors flex items-center gap-2 flex-wrap"
                  >
                    {privileged ? 'Staff Hub' : 'Il tuo Diario'} ✨
                    {privileged && (
                      <span className="text-[10px] uppercase tracking-wide text-gold-500/80 border border-gold-600/30 rounded px-1.5 py-0.5">
                        Staff
                      </span>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/accedi')
                        setMenuOpen(false)
                      }}
                      className="text-left text-white/60 hover:text-gold-400 transition-colors"
                    >
                      Accedi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/registrati')
                        setMenuOpen(false)
                      }}
                      className="btn-gold text-sm px-6 py-2.5 w-full text-center"
                    >
                      Iscriviti
                    </button>
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

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { useNavigate, Link } from 'react-router-dom'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'

const links = [
  { label: 'Chi sono', href: '#chi-sono' },
  { label: 'Galleria', href: '#galleria' },
  { label: 'Crescita personale', href: '/crescita-personale' },
  { label: 'Blog', href: '/blog' },
  { label: 'Recensioni', href: '#recensioni' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const privileged = isLoaded && user ? isPrivilegedClerkUser(user) : false

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
        scrolled
          ? 'py-3 bg-dark-500/90 backdrop-blur-md border-b border-gold-600/20 shadow-lg shadow-black/50'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <Link to="/" className="font-serif text-xl font-semibold gold-text">
            Valeria Di Pace
          </Link>
          <span
            className="hidden sm:inline text-[11px] italic tracking-wide border rounded px-2 py-0.5 leading-none shrink-0"
            style={{
              color: 'rgba(255, 210, 80, 0.7)',
              borderColor: 'rgba(255, 210, 80, 0.25)',
              animation: 'devPulse 2s ease-in-out infinite',
            }}
          >
            site in developing
          </span>
        </div>

        <ul className="hidden md:flex items-center gap-6 lg:gap-8 list-none p-0 m-0 shrink min-w-0">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-white/70 hover:text-gold-400 transition-colors duration-200 tracking-wide whitespace-nowrap"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isLoaded && user ? (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold-600/30 text-gold-400 text-sm hover:bg-gold-600/10 transition-colors"
            >
              {user.imageUrl && <img src={user.imageUrl} alt="" className="w-5 h-5 rounded-full" />}
              Il tuo Diario
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
                className="btn-gold text-sm px-6 py-2.5"
              >
                Iscriviti
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden text-white/80 hover:text-gold-400 transition-colors shrink-0"
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
            className="md:hidden bg-dark-300/95 backdrop-blur-md border-t border-gold-600/20"
          >
            <ul className="flex flex-col px-6 py-4 gap-4 list-none p-0 m-0">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-gold-400 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="flex flex-col gap-2">
                {isLoaded && user ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/dashboard')
                      setMenuOpen(false)
                    }}
                    className="text-left text-white/80 hover:text-gold-400 transition-colors flex items-center gap-2 flex-wrap"
                  >
                    Il tuo Diario ✨
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

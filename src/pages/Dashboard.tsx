import { useUser, useClerk } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const FREE_CALENDLY_URL = 'https://calendly.com/valeriadipace/consulto-gratuito-10min'
const PAYPAL_SDK_URL = 'https://www.paypal.com/sdk/js?client-id=BAAIsnQZ6B0G4SuUAk1nU0CRxfSlFupqNWGyOjvqzj745x9fvKMVkRHgG-5FRxUMeZEz5gd0r1YztBDK18&components=hosted-buttons&disable-funding=venmo&currency=EUR'

const consulti = [
  { id: 'MYR75N4X68N7E', name: 'Consulto breve',    duration: '30 min · Telefonico',   price: '30€', icon: '🌙' },
  { id: 'SVPB6FGR6L6G2', name: 'Consulto online',   duration: '30 min · Videochiamata', price: '40€', icon: '🌐' },
  { id: 'RRN5H6RBWLUYL', name: 'Consulto completo', duration: '60 min · Telefonico',   price: '50€', icon: '✨' },
]

declare global {
  interface Window {
    paypal?: { HostedButtons: (c: { hostedButtonId: string }) => { render: (s: string) => void } }
  }
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const paypalLoaded = useRef(false)

  useEffect(() => {
    if (isLoaded && !user) navigate('/accedi')
  }, [isLoaded, user, navigate])

  // Carica il PayPal SDK dinamicamente solo nel dashboard
  useEffect(() => {
    if (paypalLoaded.current || document.querySelector('#paypal-sdk')) return
    const script = document.createElement('script')
    script.id = 'paypal-sdk'
    script.src = PAYPAL_SDK_URL
    script.setAttribute('data-sdk-integration-source', 'developer-studio')
    script.onload = () => {
      paypalLoaded.current = true
      consulti.forEach(({ id }) => {
        const el = document.getElementById(`paypal-container-${id}`)
        if (el && window.paypal) {
          window.paypal.HostedButtons({ hostedButtonId: id }).render(`#paypal-container-${id}`)
        }
      })
    }
    document.body.appendChild(script)
    return () => {
      const s = document.getElementById('paypal-sdk')
      if (s) s.remove()
      paypalLoaded.current = false
    }
  }, [])

  if (!isLoaded || !user) return null

  const firstName = user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'cara'

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 20%, rgba(212,160,23,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-1">Il tuo spazio</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
              Ciao, <span className="gold-text">{firstName}</span> ✨
            </h1>
          </div>
          <button
            onClick={() => signOut(() => navigate('/'))}
            className="text-white/30 text-sm hover:text-white/60 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Esci
          </button>
        </motion.div>

        {/* Free consultation card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden mb-8 p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(212,160,23,0.15) 0%, rgba(13,27,42,0.9) 100%)',
            border: '1px solid rgba(212,160,23,0.35)',
          }}
        >
          {/* Glow */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #fcd34d, #d4a017)' }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-medium mb-4">
                🎁 Regalo di benvenuto
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
                Il tuo consulto gratuito<br />
                <span className="gold-text">10 minuti con Valeria</span>
              </h2>
              <p className="text-white/50 text-sm max-w-md">
                Benvenuta nella famiglia. Valeria ti aspetta per una lettura gratuita di 10 minuti —
                il tuo primo passo nel mondo delle carte.
              </p>
            </div>
            <a
              href={FREE_CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold whitespace-nowrap shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Prenota ora — Gratis
            </a>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: '🔮',
              title: 'Prenota un consulto',
              desc: '30 o 60 minuti con Valeria',
              href: '/#prenota',
              cta: 'Vai al calendario',
            },
            {
              icon: '🃏',
              title: 'App tarocchi gratuita',
              desc: 'Estrai le tue carte ogni giorno',
              href: 'https://stese.nonsolotarocchi.it',
              cta: 'Apri l\'app',
              external: true,
            },
            {
              icon: '⭐',
              title: 'Lascia una recensione',
              desc: 'Il tuo feedback aiuta altre persone',
              href: 'mailto:valeria@nonsolotarocchi.it?subject=Recensione consulto',
              cta: 'Scrivi a Valeria',
            },
          ].map((action, i) => (
            <motion.a
              key={action.title}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="mystical-card group block"
            >
              <div className="text-2xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-gold-400 transition-colors">
                {action.title}
              </h3>
              <p className="text-white/40 text-xs mb-3">{action.desc}</p>
              <span className="text-gold-500 text-xs flex items-center gap-1">
                {action.cta}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </motion.a>
          ))}
        </div>

        {/* Acquista consulti */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-8"
        >
          <h2 className="font-serif text-xl font-bold text-white mb-1">Acquista un consulto</h2>
          <p className="text-white/40 text-sm mb-5">Pagamento sicuro via PayPal · anche con carta di credito</p>
          <div className="grid md:grid-cols-3 gap-4">
            {consulti.map((c) => (
              <div key={c.id} className="mystical-card text-center">
                <div className="text-3xl mb-2">{c.icon}</div>
                <h3 className="font-serif text-lg font-bold text-white mb-0.5">{c.name}</h3>
                <p className="text-gold-500 text-xs mb-1">{c.duration}</p>
                <p className="font-serif text-2xl font-bold mb-3" style={{
                  background: 'linear-gradient(135deg, #ffe066, #ffd700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>{c.price}</p>
                <div id={`paypal-container-${c.id}`} className="w-full" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Profile info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mystical-card"
        >
          <h3 className="font-semibold text-white/70 text-sm mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Il tuo profilo
          </h3>
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <img src={user.imageUrl} alt="Avatar" className="w-12 h-12 rounded-full border border-gold-600/30" />
            )}
            <div>
              <p className="text-white font-medium">{user.fullName || firstName}</p>
              <p className="text-white/40 text-sm">{user.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import StaffPersonalSpace from '../../components/StaffPersonalSpace'

type TabId = 'oggi' | 'crm' | 'analytics' | 'lenormand' | 'astrologia'

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'oggi', label: 'Oggi', emoji: '📅' },
  { id: 'crm', label: 'CRM Clienti', emoji: '👥' },
  { id: 'analytics', label: 'Analytics', emoji: '📊' },
  { id: 'lenormand', label: 'Il Mentore', emoji: '🃏' },
  { id: 'astrologia', label: 'Tema Staff', emoji: '🌌' },
]

const STAFF_LINKS = [
  { to: '/gestione-clienti', label: 'Gestione clienti' },
  { to: '/gestione-recensioni', label: 'Recensioni' },
  { to: '/gestione-commenti-blog', label: 'Commenti blog' },
  { to: '/control-room', label: 'Control Room' },
]

export default function StaffDashboard() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('oggi')

  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Valeria'

  return (
    <div className="relative min-h-screen px-6 py-10">
      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Sticky tab nav */}
        <div className="sticky top-20 z-30 mb-6">
          <nav className="flex flex-wrap gap-2 p-1.5 bg-[#0a0a0a]/95 border border-white/10 rounded-2xl w-fit max-w-full backdrop-blur-md shadow-2xl">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
                  tab === t.id ? 'bg-[#d4a017] text-black' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Header staff */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-1">Area di lavoro</p>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">
              Ciao, <span className="gold-text">{firstName}</span>
              <span className="ml-3 text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-gold-600/40 text-gold-400/90 align-middle">Staff</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STAFF_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="btn-outline text-xs px-3 py-1.5 whitespace-nowrap">
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => signOut(() => navigate('/'))}
              className="text-white/30 text-sm hover:text-white/60 transition-colors flex items-center gap-1.5 ml-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Esci
            </button>
          </div>
        </motion.div>

        {/* Workspace */}
        <StaffPersonalSpace activeTab={tab} />
      </div>
    </div>
  )
}

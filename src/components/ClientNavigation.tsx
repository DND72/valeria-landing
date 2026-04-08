import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Il mio Diario', to: '/dashboard', icon: '🏠', exact: true },
  { label: 'Prenota', to: '/dashboard#scegli-consulto', icon: '🔮', hash: 'scegli-consulto' },
  { label: 'I miei Consulti', to: '/dashboard#storico', icon: '📋', hash: 'storico' },
  { label: 'Wallet', to: '/wallet', icon: '👛', exact: false },
  { label: 'Tema Astrale', to: '/tema-natale', icon: '✨', exact: false },
]

export default function ClientNavigation() {
  const location = useLocation()

  function isActive(item: typeof navItems[number]): boolean {
    if (item.to === '/dashboard' && item.exact) {
      return location.pathname === '/dashboard' && !location.hash
    }
    if (item.hash) {
      return location.pathname === '/dashboard' && location.hash === `#${item.hash}`
    }
    return location.pathname === item.to
  }

  return (
    <nav
      aria-label="Navigazione principale cliente"
      className="flex flex-wrap gap-2 mb-10 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl w-fit max-w-full"
    >
      {navItems.map((item) => {
        const active = isActive(item)
        return (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
              active
                ? 'bg-[#d4a017] text-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            style={{ textShadow: 'none', boxShadow: 'none' }}
          >
            <span className="text-base" aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

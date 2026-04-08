import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Il mio Diario', to: '/dashboard', icon: '🏠' },
  { label: 'Prenota', to: '/dashboard', icon: '🔮', scrollTo: 'scegli-consulto' },
  { label: 'I miei Consulti', to: '/i-miei-consulti', icon: '📋' },
  { label: 'Wallet', to: '/wallet', icon: '👛' },
  { label: 'Tema Astrale', to: '/i-miei-temi', icon: '✨' },
]

export default function ClientNavigation() {
  const location = useLocation()

  function isActive(item: typeof navItems[number]): boolean {
    return location.pathname === item.to
  }

  function handleClick(item: typeof navItems[number], e: React.MouseEvent) {
    if (item.scrollTo && location.pathname === '/dashboard') {
      e.preventDefault()
      const el = document.getElementById(item.scrollTo)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav
      aria-label="Navigazione principale cliente"
      className="flex flex-wrap gap-2 p-1.5 bg-[#0a0a0a]/90 border border-white/10 rounded-2xl w-fit max-w-full backdrop-blur-md shadow-xl"
    >
      {navItems.map((item) => {
        const active = isActive(item)
        return (
          <Link
            key={item.label}
            to={item.to}
            onClick={(e) => handleClick(item, e)}
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

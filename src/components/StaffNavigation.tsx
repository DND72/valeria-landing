import { Link, useLocation } from 'react-router-dom'

export default function StaffNavigation() {
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    { label: 'Diario Staff', to: '/dashboard', icon: '📅' },
    { label: 'Gestione Clienti', to: '/gestione-clienti', icon: '👥' },
    { label: 'Recensioni', to: '/gestione-recensioni', icon: '⭐' },
    { label: 'Commenti Blog', to: '/gestione-commenti-blog', icon: '💬' },
    { label: 'Control Room', to: '/control-room', icon: '🚀' },
    { label: 'Tema Staff', to: '/dashboard/astrologia', icon: '🌑' },
  ]

  return (
    <nav className="flex flex-wrap gap-2 mb-8 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl w-fit">
      {navItems.map((item) => {
        const isActive = path === item.to || (item.to !== '/dashboard' && path.startsWith(item.to))
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
              isActive
                ? 'bg-gold-500 text-black shadow-none border-none'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            style={{ textShadow: 'none' }}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const labelMap: Record<string, string> = {
  dashboard: 'Diario',
  wallet: 'Wallet',
  'i-miei-consulti': 'Consulti',
  'i-miei-temi': 'Temi Natali',
  profilo: 'Profilo',
  'control-room': 'Control Room',
  'gestione-clienti': 'Clienti',
  'gestione-recensioni': 'Recensioni',
  'gestione-commenti-blog': 'Commenti',
  'crescita-personale': 'Crescita',
  blog: 'Blog',
  faq: 'FAQ',
  cielo: 'Cielo Zodiacale',
}

export default function Breadcrumbs() {
  const { pathname } = useLocation()
  if (pathname === '/') return null

  const pathnames = pathname.split('/').filter((x) => x)

  return (
    <motion.nav
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-white/30 mb-6 overflow-hidden whitespace-nowrap"
      aria-label="Breadcrumb"
    >
      <Link to="/" className="hover:text-gold-500 transition-colors">Home</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const label = labelMap[name] || name

        return (
          <div key={name} className="flex items-center gap-2">
            <span className="opacity-40">/</span>
            {isLast ? (
              <span className="text-gold-500 font-bold max-w-[120px] truncate">{label}</span>
            ) : (
              <Link to={routeTo} className="hover:text-gold-500 transition-colors max-w-[120px] truncate">
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </motion.nav>
  )
}

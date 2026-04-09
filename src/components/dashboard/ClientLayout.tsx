import { ReactNode, useState, useEffect } from 'react'
import ClientSidebar from './ClientSidebar'
import { motion } from 'framer-motion'

type ClientLayoutProps = {
  children: ReactNode
  title: string
  subtitle?: string
}

export default function ClientLayout({ children, title, subtitle }: ClientLayoutProps) {

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('client-theme') as 'dark' | 'light') || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('client-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${theme === 'light' ? 'staff-light' : 'bg-gradient-to-br from-indigo-950/10 via-black/40 to-black/80 text-white'}`}>
      {/* Sidebar fissa */}
      <ClientSidebar
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Contenuto principale */}
      <div className="flex-1 ml-64 p-8 relative">
        <div className="max-w-4xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-10 pb-6 border-b ${theme === 'light' ? 'border-staff-gold/10' : 'border-white/5'}`}
          >
            <h1 className={`font-serif text-3xl md:text-3xl font-bold ${theme === 'light' ? 'text-dark-500' : 'text-white'}`}>
              {title}
            </h1>
            {subtitle && (
              <span className={`text-[10px] uppercase tracking-[0.3em] font-black ${theme === 'light' ? 'text-dark-500/40' : 'text-white/30'}`}>
                {subtitle}
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

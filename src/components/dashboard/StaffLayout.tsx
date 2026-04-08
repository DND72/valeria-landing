import { ReactNode } from 'react'
import StaffSidebar from './StaffSidebar'
import { motion } from 'framer-motion'

type StaffLayoutProps = {
  children: ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
  title: string
  subtitle?: string
}

export default function StaffLayout({ children, activeTab = '', onTabChange = () => {}, title, subtitle }: StaffLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar fissa */}
      <StaffSidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Contenuto principale */}
      <div className="flex-1 ml-64 p-8 relative">
        <div className="max-w-5xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-10 pb-6 border-b border-white/5"
          >
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
              {title}
            </h1>
            {subtitle && (
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30">
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

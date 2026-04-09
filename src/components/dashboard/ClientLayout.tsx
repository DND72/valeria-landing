import { ReactNode, useState, useEffect } from 'react'
import ClientSidebar from './ClientSidebar'
import { motion } from 'framer-motion'
import { useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { isPrivilegedClerkUser } from '../../lib/privilegedUser'

type ClientLayoutProps = {
  children: ReactNode
  title: string
  subtitle?: string
}

export default function ClientLayout({ children, title, subtitle }: ClientLayoutProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  
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
        
        {/* Header superiore con Profilo */}
        <div className="flex justify-end mb-8">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className={`flex items-center gap-4 p-2 pl-4 rounded-2xl border transition-all ${
               theme === 'light' ? 'bg-white border-staff-gold/20 shadow-sm' : 'bg-white/[0.03] border-white/10 backdrop-blur-md shadow-2xl'
             }`}
           >
             <div className="text-right hidden sm:block">
                <p className={`text-xs font-bold leading-tight ${theme === 'light' ? 'text-dark-500' : 'text-white'}`}>
                  {user?.firstName || 'Cara Cliente'}
                </p>
                <p className={`text-[9px] uppercase tracking-widest mt-0.5 ${theme === 'light' ? 'text-dark-500/40' : 'text-gold-500/60'}`}>
                  {isPrivilegedClerkUser(user) ? 'Master Admin' : 'Membro Evolutivo'}
                </p>
             </div>

             {user?.imageUrl && (
               <img 
                 src={user.imageUrl} 
                 alt="" 
                 className={`w-9 h-9 rounded-xl border object-cover ${theme === 'light' ? 'border-staff-gold/20' : 'border-white/10'}`} 
               />
             )}

             <div className={`w-px h-6 mx-1 ${theme === 'light' ? 'bg-staff-gold/10' : 'bg-white/10'}`} />

             <button
               onClick={() => signOut(() => navigate('/'))}
               className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                 theme === 'light'
                   ? 'border-staff-gold/20 text-dark-500/40 hover:text-red-600 hover:border-red-600/30'
                   : 'border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30'
               }`}
               title="Esci dal Diario"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
             </button>
           </motion.div>
        </div>

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

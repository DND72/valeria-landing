import { motion } from 'framer-motion'
import { ASTRAL_STATUSES, getAstralStatus } from '../../constants/status'

interface AstralRankCardProps {
  user: any
  donePaidConsults: number
}

export default function AstralRankCard({ user, donePaidConsults }: AstralRankCardProps) {
  if (!user) return null

  const statusKey = getAstralStatus(user, donePaidConsults)
  const status = ASTRAL_STATUSES[statusKey]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 mystical-card border border-white/5 bg-gradient-to-r from-dark-900 to-black/40 p-5 overflow-hidden relative shadow-2xl"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-600/5 blur-[60px] rounded-full -mr-10 -mt-10 pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center text-3xl bg-white/5 rounded-2xl border border-white/10 shadow-xl">
            {status.discountEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-serif text-lg leading-none">
                Il tuo Rango Astrale: <span className={status.color}>{status.label}</span>
              </h2>
              {status.discountFactor < 1 && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 whitespace-nowrap">
                  Sconto -{Math.round((1 - status.discountFactor) * 100)}% ATTIVO
                </span>
              )}
            </div>
            <p className="text-white/50 text-xs leading-relaxed max-w-lg mt-1 italic">
              {status.description}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
            Progressione Anima: {donePaidConsults} consulti
          </p>
          {statusKey !== 'sole_centrale' && (
            <div className="w-40 sm:w-48">
              <div className="flex justify-between text-[9px] text-white/40 mb-1 uppercase tracking-tighter">
                <span>Prossimo Grado</span>
                <span>
                  {donePaidConsults} / {
                    statusKey === 'nebula' ? 3 :
                    statusKey === 'astro_guida' ? 8 : 15
                  }
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (donePaidConsults / (
                      statusKey === 'nebula' ? 3 :
                      statusKey === 'astro_guida' ? 8 : 15
                    )) * 100)}%`
                  }}
                  className={`h-full ${status.color.replace('text-', 'bg-')}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

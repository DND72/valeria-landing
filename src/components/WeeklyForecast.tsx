import { motion } from 'framer-motion'
import { Calendar, Star, AlertTriangle, Heart, Briefcase } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface WeeklyForecastProps {
  content: string
  energyLevel: number // 0-100
  luckyDays: string[]
}

export default function WeeklyForecast({ content, energyLevel, luckyDays }: WeeklyForecastProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
      {/* Header con Picco Energetico */}
      <div className="p-8 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-1">Il Tuo Cammino Settimanale</h2>
            <p className="text-white/40 text-sm">Analisi personalizzata by Nonsolotarocchi</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-blue-400">{energyLevel}%</div>
            <p className="text-[10px] uppercase tracking-widest text-white/30">Energia Cosmica</p>
          </div>
        </div>
        
        {/* Barra Energia */}
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${energyLevel}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonna Testo Analisi */}
        <div className="lg:col-span-2 space-y-6 text-white/80 leading-relaxed">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h3 className="text-lg font-bold text-blue-300 mt-6 mb-3 flex items-center gap-2" {...props} />,
                strong: ({node, ...props}) => <span className="text-white font-bold" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Sidebar Widget Rapidi */}
        <div className="space-y-4">
          {/* Giorni d'Oro */}
          <div className="p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
            <div className="flex items-center gap-3 mb-3 text-yellow-400">
              <Star size={20} />
              <span className="font-bold text-sm uppercase tracking-wider">Giorni d'Oro</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(luckyDays) && luckyDays.map(day => (
                <span key={day} className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-200 text-xs font-medium">
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Alert Sfide */}
          <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
            <div className="flex items-center gap-3 mb-3 text-red-400">
              <AlertTriangle size={20} />
              <span className="font-bold text-sm uppercase tracking-wider">Attenzione</span>
            </div>
            <p className="text-xs text-red-200/60 italic">
              Venerdì la Luna in quadratura richiede pazienza nei dialoghi familiari.
            </p>
          </div>

          {/* Pillar tematici */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 text-center">
              <Heart size={20} className="mx-auto mb-2 text-pink-400" />
              <p className="text-[10px] uppercase text-pink-200/50">Amore</p>
              <p className="text-sm font-bold text-white">Stabile</p>
            </div>
            <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
              <Briefcase size={20} className="mx-auto mb-2 text-green-400" />
              <p className="text-[10px] uppercase text-green-200/50">Lavoro</p>
              <p className="text-sm font-bold text-white">In crescita</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-6 bg-white/5 border-t border-white/5 text-center">
        <button className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-2 mx-auto">
          <Calendar size={14} />
          Scarica il Calendario Astrale Completo (.pdf)
        </button>
      </div>
    </div>
  )
}

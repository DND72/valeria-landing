import { motion } from 'framer-motion'

interface MoonEvent {
  evento: string
  timestamp: string
  tipo: 'ingresso' | 'aspetto'
  aspetto?: string
  pianeta?: string
  segno?: string
}

interface MoonTransitTimelineProps {
  events: MoonEvent[]
}

const ASPECT_EMOJI: Record<string, string> = {
  'Congiunzione': '☌',
  'Sestile':      '⚹',
  'Quadratura':   '□',
  'Trigono':      '△',
  'Opposizione':  '☍',
  'ingresso':     '🚪'
}

const BODY_GLYPHS_MINI: Record<string, string> = {
  'Sole': '☉', 'Luna': '☾', 'Mercurio': '☿', 'Venere': '♀', 'Marte': '♂',
  'Giove': '♃', 'Saturno': '♄', 'Urano': '♅', 'Nettuno': '♆', 'Plutone': '♇'
}

export default function MoonTransitTimeline({ events }: MoonTransitTimelineProps) {
  // Raggruppa per giorno
  const groups = events.reduce((acc: Record<string, MoonEvent[]>, ev) => {
    const d = new Date(ev.timestamp)
    const dateKey = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long' })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(ev)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([date, dayEvents], groupIdx) => (
        <motion.div 
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIdx * 0.1 }}
          className="relative"
        >
          {/* Header Giorno */}
          <div className="flex items-center gap-4 mb-6">
            <h4 className="text-white font-serif text-xl font-bold tracking-wide italic">{date}</h4>
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              {groupIdx === 0 ? 'Oggi' : groupIdx === 1 ? 'Domani' : 'Dopodomani'}
            </span>
          </div>

          {/* Lista Eventi */}
          <div className="space-y-4 border-l-2 border-white/5 ml-4 pl-8 pt-2 pb-2">
            {dayEvents.map((ev, i) => (
              <div key={i} className="relative group">
                {/* Dot on timeline */}
                <div 
                  className={`absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-black z-10 
                  ${ev.tipo === 'ingresso' ? 'bg-amber-400' : 'bg-blue-400'}`} 
                />
                
                <div 
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-4 transition-all duration-300"
                  style={{ borderColor: ev.tipo === 'ingresso' ? 'rgba(251,191,36,0.1)' : 'rgba(96,165,250,0.1)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl opacity-80">
                        {ev.aspetto ? ASPECT_EMOJI[ev.aspetto] : ASPECT_EMOJI['ingresso']}
                      </span>
                      <div>
                        <p className="text-white/90 font-medium text-sm">
                          {ev.evento}
                        </p>
                        <p className="text-[10px] text-white/30 uppercase tracking-tighter flex items-center gap-2">
                          {ev.pianeta && <span className="text-lg opacity-40">{BODY_GLYPHS_MINI[ev.pianeta]}</span>}
                          {ev.tipo === 'ingresso' ? 'Ingresso Zodiacale' : `Aspetto con ${ev.pianeta}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-blue-400 font-mono font-bold text-base bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                        {new Date(ev.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

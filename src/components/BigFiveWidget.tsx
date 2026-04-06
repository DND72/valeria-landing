import { motion } from 'framer-motion'
import { BODY_GLYPHS, type PlanetData } from '../utils/astrologyUtils'
import ReactMarkdown from 'react-markdown'

interface BigFiveWidgetProps {
  planets: PlanetData[]
  interpretation: string
  ascendant?: { segno: string; gradi: number }
}

const BIG_FIVE_NAMES = ['Sole', 'Luna', 'Mercurio', 'Venere']

export default function BigFiveWidget({ planets, interpretation, ascendant }: BigFiveWidgetProps) {
  const bigFive = planets.filter(p => BIG_FIVE_NAMES.includes(p.nome))
  
  // Sort to match a logical order: Sun, Moon, Asc, Merc, Ven
  const sortedDisplay = [
    bigFive.find(p => p.nome === 'Sole'),
    bigFive.find(p => p.nome === 'Luna'),
    ascendant ? { nome: 'Ascendente', segno: ascendant.segno, gradi: ascendant.gradi } : null,
    bigFive.find(p => p.nome === 'Mercurio'),
    bigFive.find(p => p.nome === 'Venere'),
  ].filter(Boolean)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mystical-card p-6 md:p-8 border border-gold-500/20 bg-dark-900/40 backdrop-blur-md relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">✨</span>
          <h2 className="font-serif text-2xl font-bold text-white">La tua Essenza Astrale</h2>
        </div>

        {/* The Planets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {sortedDisplay.map((p: any, i) => (
            <motion.div 
              key={p.nome}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-gold-500/30 transition-colors group"
            >
              <span className="text-3xl mb-2 text-gold-400 group-hover:scale-110 transition-transform duration-300">
                {p.nome === 'Ascendente' ? 'ASC' : (BODY_GLYPHS[p.nome] || '●')}
              </span>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{p.nome}</p>
              <p className="text-sm font-bold text-white text-center leading-tight">
                {p.segno} <br />
                <span className="text-[10px] font-mono text-gold-500/70">{Math.floor(p.gradi)}°</span>
              </p>
            </motion.div>
          ))}
        </div>

        {/* AI Interpretation */}
        <div className="prose prose-invert prose-sm max-w-none border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-600/20 flex items-center justify-center text-gold-400 text-xs font-bold ring-1 ring-gold-500/30">
              V
            </div>
            <p className="text-xs text-gold-400 font-medium uppercase tracking-wider">L&apos;analisi di Valeria</p>
          </div>
          <div className="text-white/80 leading-relaxed text-sm italic font-serif">
            <ReactMarkdown>{interpretation}</ReactMarkdown>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Sincronizzato con il tuo profilo Evolutivo</p>
        </div>
      </div>
    </motion.div>
  )
}

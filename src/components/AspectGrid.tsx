import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { calculateAspects, BODY_GLYPHS, ASPECTS_DEF, type PlanetData } from '../utils/astrologyUtils'

interface AspectGridProps {
  planets: PlanetData[]
  className?: string
}

// Corpi principali da mostrare nella griglia (per evitare eccessivo affollamento)
const MAIN_BODIES = [
  'Sole', 'Luna', 'Mercurio', 'Venere', 'Marte', 'Giove', 'Saturno', 'Urano', 'Nettuno', 'Plutone', 'Chirone', 'Nodo Nord', 'Lilith'
]

export default function AspectGrid({ planets, className = '' }: AspectGridProps) {
  // Filtriamo e ordiniamo i pianeti per la griglia
  const gridPlanets = useMemo(() => {
    return planets.filter(p => MAIN_BODIES.includes(p.nome))
      .sort((a, b) => MAIN_BODIES.indexOf(a.nome) - MAIN_BODIES.indexOf(b.nome))
  }, [planets])

  const aspectResults = useMemo(() => calculateAspects(gridPlanets), [gridPlanets])

  // Trova un aspetto specifico tra due pianeti
  const getAspect = (p1: string, p2: string) => {
    return aspectResults.find(a => (a.p1 === p1 && a.p2 === p2) || (a.p1 === p2 && a.p2 === p1))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Griglia Triangolare ── */}
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <table className="border-collapse mx-auto">
          <thead>
            <tr>
              <th className="w-8 h-8"></th>
              {gridPlanets.map(p => (
                <th 
                  key={p.nome} 
                  className="w-8 h-8 text-center text-white/30 font-serif text-sm p-1 cursor-help group relative"
                  title={p.nome}
                >
                  <span className="group-hover:text-gold-400 transition-colors">{BODY_GLYPHS[p.nome] || p.nome[0]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridPlanets.map((pRow, rowIndex) => (
              <tr key={pRow.nome}>
                {/* Header riga */}
                <td 
                  className="w-8 h-8 text-center text-white/30 font-serif text-sm border-r border-white/10 p-1 cursor-help group"
                  title={pRow.nome}
                >
                  <span className="group-hover:text-gold-400 transition-colors">{BODY_GLYPHS[pRow.nome] || pRow.nome[0]}</span>
                </td>
                
                {gridPlanets.map((pCol, colIndex) => {
                  // Rendering solo metà triangolo (sotto diagonale)
                  if (colIndex >= rowIndex) {
                    return <td key={pCol.nome} className="w-8 h-8"></td>
                  }

                  const aspect = getAspect(pRow.nome, pCol.nome)
                  
                  return (
                    <td
                      key={pCol.nome}
                      className="w-8 h-8 border border-white/5 relative group p-0"
                      style={{ background: aspect ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                    >
                      {aspect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center justify-center w-full h-full text-lg cursor-help transition-colors hover:bg-white/5"
                          style={{ color: aspect.color, opacity: 0.3 + (aspect.precision * 0.7) }}
                          title={`${pRow.nome} ${aspect.type} ${pCol.nome} (${aspect.diff.toFixed(1)}°)`}
                        >
                          {aspect.symbol}
                        </motion.div>
                      )}
                      
                      {/* Custom Tooltip on Hover */}
                      {aspect && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                          <div className="bg-black/95 border border-white/20 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl">
                            <p className="text-[10px] text-white/50 mb-0.5 uppercase tracking-widest font-mono">
                              {pCol.nome} {aspect.symbol} {pRow.nome}
                            </p>
                            <p className="text-xs text-white font-medium">
                              {aspect.type} <span style={{ color: aspect.color }}>•</span> {aspect.diff.toFixed(2)}° orb
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Legenda Glifi ── */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
        <h4 className="text-gold-500/50 text-[10px] uppercase tracking-[0.25em] mb-4 text-center">Legenda Simboli Classici</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-4 gap-x-2">
          {ASPECTS_DEF.map(asp => (
            <div key={asp.label} className="flex flex-col items-center gap-1 group">
              <span className="text-2xl transition-transform group-hover:scale-125" style={{ color: asp.color }}>{asp.symbol}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-tighter">{asp.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 pt-4 border-t border-white/5 text-[9px] text-white/20 text-center leading-relaxed">
          I simboli sopra indicano le relazioni geometriche tra i pianeti.<br/>
          Una barra di colore sotto il simbolo nella griglia indica la precisione dell'aspetto.
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useAstrologyApi, type SavedNatalChart, type Planet } from '../api/astrology'
import ZodiacWheel from './ZodiacWheel'
import { useCircadianTheme } from '../hooks/useCircadianTheme'
import { HOUSE_MEANINGS } from '../constants/astrologyMeanings'

const PLANET_COLOR: Record<string, string> = {
  'Sole': 'text-amber-400',
  'Luna': 'text-blue-200',
  'Mercurio': 'text-yellow-300',
  'Venere': 'text-pink-300',
  'Marte': 'text-red-400',
  'Giove': 'text-orange-300',
  'Saturno': 'text-stone-300',
  'Urano': 'text-cyan-300',
  'Nettuno': 'text-indigo-300',
  'Plutone': 'text-purple-300'
}

const PLANET_SYMBOLS: Record<string, string> = {
  'Sole': '☉', 'Luna': '☽', 'Mercurio': '☿', 'Venere': '♀',
  'Marte': '♂', 'Giove': '♃', 'Saturno': '♄', 'Urano': '♅',
  'Nettuno': '♆', 'Plutone': '♇'
}

export default function StaffAstrology() {
  const { generateStaffChart, getMyCharts, getPendingCharts, approveChart } = useAstrologyApi()
  const theme = useCircadianTheme()
  const [loading, setLoading] = useState(false)
  const [myCharts, setMyCharts] = useState<SavedNatalChart[]>([])
  const [viewingChart, setViewingChart] = useState<SavedNatalChart | null>(null)
  const [pendingCharts, setPendingCharts] = useState<any[]>([])
  const [pendingHoroscopes, setPendingHoroscopes] = useState<any[]>([])
  const [pendingLoading, setPendingLoading] = useState(false)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [city, setCity] = useState('')
  const [gender] = useState<'M'|'F'|''>('F')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharts()
  }, [])

  const fetchCharts = async () => {
    try {
      const [charts, pendingData] = await Promise.all([
        getMyCharts(),
        getPendingCharts()
      ])
      setMyCharts(charts)
      setPendingCharts(pendingData.pendingCharts || [])
      setPendingHoroscopes(pendingData.pendingHoroscopes || [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleApprove = async (id: string | number, type: 'chart' | 'horoscope' = 'chart') => {
    if (!window.confirm(`Vuoi sbloccare questo ${type === 'chart' ? 'Tema Natale' : 'Oroscopo'} per il cliente?`)) return
    setPendingLoading(true)
    try {
      await approveChart(id, type)
      await fetchCharts()
    } catch (e: any) {
      alert(e.message || "Errore approvazione")
    } finally {
      setPendingLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await generateStaffChart({
        birthDate: date,
        birthTime: time,
        city: city.trim(),
        gender: gender as 'M'|'F'
      })
      await fetchCharts()
      setViewingChart({
        id: 'new',
        type: 'advanced',
        birthDate: date,
        birthTime: time,
        city,
        chartData: res,
        interpretation: res.interpretation,
        createdAt: new Date().toISOString()
      })
    } catch (err: any) {
      setError(err.message || 'Errore durante il calcolo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ── SALA D'ATTESA (PENDING REVIEW) ── */}
      {(pendingCharts.length > 0 || pendingHoroscopes.length > 0) && (
         <motion.section
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="mystical-card border-amber-500/30 bg-amber-500/5"
         >
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl animate-pulse">⏳</div>
               <div>
                  <h3 className="font-serif text-xl text-white">Sala d'Attesa (Review Required)</h3>
                  <p className="text-amber-200/50 text-xs">Contenuti Premium in attesa di essere sbloccati per il cliente.</p>
               </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
               <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40">
                     <tr>
                        <th className="p-3">Data</th>
                        <th className="p-3">Cliente (ID)</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3 text-right">Azione</th>
                     </tr>
                  </thead>
                  <tbody>
                     {/* Liste combinate */}
                     {pendingCharts.map(pc => (
                        <tr key={`chart-${pc.id}`} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                           <td className="p-3 text-white/60 font-mono text-xs">{new Date(pc.created_at).toLocaleString('it-IT')}</td>
                           <td className="p-3 text-white font-medium">
                              {pc.clerk_user_id.slice(0, 10)}... <br/>
                              <span className="text-[10px] text-white/30 uppercase">{pc.birth_city || '—'}</span>
                           </td>
                           <td className="p-3">
                              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded uppercase font-bold">Tema Natale Adv</span>
                           </td>
                           <td className="p-3 text-right">
                              <button 
                                onClick={() => handleApprove(pc.id, 'chart')}
                                disabled={pendingLoading}
                                className="btn-gold px-4 py-1.5 text-[10px] uppercase tracking-wider disabled:opacity-50"
                              >
                                {pendingLoading ? 'Wait...' : 'Sblocca ✦'}
                              </button>
                           </td>
                        </tr>
                     ))}
                     {pendingHoroscopes.map(ph => (
                        <tr key={`horo-${ph.id}`} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                           <td className="p-3 text-white/60 font-mono text-xs">{new Date(ph.created_at).toLocaleString('it-IT')}</td>
                           <td className="p-3 text-white font-medium">
                              {ph.clerk_user_id.slice(0, 10)}... <br/>
                              <span className="text-[10px] text-white/30 uppercase">{ph.start_date} - {ph.end_date}</span>
                           </td>
                           <td className="p-3">
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-bold">Oroscopo Settim.</span>
                           </td>
                           <td className="p-3 text-right">
                              <button 
                                onClick={() => handleApprove(ph.id, 'horoscope')}
                                disabled={pendingLoading}
                                className="btn-gold px-4 py-1.5 text-[10px] uppercase tracking-wider disabled:opacity-50"
                              >
                                {pendingLoading ? 'Wait...' : 'Sblocca ✦'}
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </motion.section>
      )}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mystical-card border-gold-500/20 bg-gold-500/5 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl text-gold-500">🌌</div>
            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-0.5">Calcolatore Natale Universale</h2>
              <p className="text-gold-400/70 text-sm">Strumento professionale per analizzare il cielo di qualsiasi persona.</p>
            </div>
          </div>
          {viewingChart && (
            <button 
              onClick={() => { setViewingChart(null); setDate(''); setTime(''); setCity(''); }}
              className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Nuovo Calcolo ↺
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Data di Nascita</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-500/50 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Ora Esatta</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-500/50 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Città di Nascita</label>
            <input
              type="text"
              required
              placeholder="Es. Roma, Milano..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-500/50 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold text-xs py-2.5 rounded-lg font-bold uppercase tracking-widest"
            >
              {loading ? 'Generazione...' : 'Genera Analisi ✦'}
            </button>
          </div>
        </form>

        {error && <p className="text-red-400 text-xs mt-4 bg-red-950/20 p-2 rounded border border-red-900/40 text-center">{error}</p>}
      </motion.section>

      {viewingChart && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mystical-card p-0 overflow-hidden border border-white/10"
        >
          <div className="p-8 border-b border-white/10 bg-black/20 text-center">
             <p className="text-gold-500 text-[10px] font-bold uppercase tracking-widest mb-2">Analisi Evolutiva sbloccata</p>
             <h3 className="font-serif text-3xl text-white">Il tuo Cielo Natale, {viewingChart.city}</h3>
          </div>

          <div className="p-4 md:p-8 flex justify-center bg-[#060608]">
             <div className="w-full max-w-2xl">
                <ZodiacWheel
                  planets={viewingChart.chartData.pianeti || []}
                  ascLon={viewingChart.chartData.ascendente_totale}
                  ascSign={viewingChart.chartData.segno}
                  ascDeg={viewingChart.chartData.grado_nel_segno}
                  theme={theme}
                />
             </div>
          </div>

          <div className="p-6 md:p-10 space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {(viewingChart.chartData.pianeti || []).slice(0, 10).map((p: Planet) => (
                <div key={p.nome} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                  <span className={`text-2xl block mb-1 ${PLANET_COLOR[p.nome] || 'text-white'}`}>{PLANET_SYMBOLS[p.nome] || '✦'}</span>
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{p.nome}</p>
                  <p className="font-serif text-white text-sm">{p.segno}</p>
                </div>
              ))}
            </div>

            {/* CUSPIDI DELLE CASE (NOVITÀ STAFF) */}
            {viewingChart.chartData.case && viewingChart.chartData.case.length > 0 && (
              <div className="space-y-4 border-t border-white/10 pt-10">
                <h3 className="font-serif text-lg text-white mb-4 flex items-center gap-3">
                  <span className="text-indigo-400 font-bold">🏠</span> 
                  <span className="uppercase tracking-[0.2em] text-xs font-bold text-white/70">Cuspidi delle Case</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {viewingChart.chartData.case.map((c: any) => (
                    <div key={c.numero} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center group hover:bg-white/[0.05] transition-colors relative cursor-help">
                      <p className="text-[10px] text-white/30 uppercase tracking-tighter mb-1 font-bold">Casa {c.numero}</p>
                      <p className="text-white font-serif text-sm font-bold leading-tight">{c.segno}</p>
                      <p className="text-[9px] text-indigo-400/60 font-mono mt-1 font-extrabold">{c.gradi.toFixed(1)}°</p>
                      
                      {/* Tooltip con significato (Floating) */}
                      <div className="hidden group-hover:block absolute z-50 bg-[#0c0c14] border border-indigo-500/30 p-3 rounded-xl text-[10px] text-white/80 w-48 -top-24 left-1/2 -translate-x-1/2 backdrop-blur-xl shadow-2xl pointer-events-none">
                         <p className="font-bold text-indigo-400 mb-1 uppercase tracking-widest">{HOUSE_MEANINGS[c.numero]?.keyword}</p>
                         <p className="leading-relaxed opacity-80">{HOUSE_MEANINGS[c.numero]?.description}</p>
                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0c0c14] border-r border-b border-indigo-500/30 rotate-45"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="prose prose-invert prose-gold max-w-none border-t border-white/10 pt-10">
              <h4 className="font-serif text-2xl text-gold-500 mb-6 text-center uppercase tracking-widest italic">Saggezza Evolutiva</h4>
              <ReactMarkdown 
                components={{
                  p: ({node, ...props}) => <p className="mb-4 text-white/80 leading-relaxed text-sm" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-xl text-gold-400 mt-8 mb-4 border-b border-white/5 pb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg text-gold-500 mt-6 mb-3" {...props} />,
                  li: ({node, ...props}) => <li className="text-white/70 text-sm mb-1" {...props} />,
                }}
              >
                {viewingChart.interpretation}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}

      {myCharts.length > 0 && !viewingChart && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCharts.map((c: SavedNatalChart) => (
            <button
              key={c.id}
              onClick={() => setViewingChart(c)}
              className="mystical-card text-left hover:border-gold-500/40 transition-all p-5"
            >
              <p className="text-gold-500 text-[9px] font-bold uppercase tracking-widest mb-1">Analisi Precedente</p>
              <h4 className="text-white font-serif text-lg">{c.city}</h4>
              <p className="text-white/30 text-xs mt-1">{new Date(c.createdAt).toLocaleDateString('it-IT')}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

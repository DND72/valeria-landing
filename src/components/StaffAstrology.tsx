import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useAstrologyApi, type NatalChartResponse, type SavedNatalChart } from '../api/astrology'
import ZodiacWheel from './ZodiacWheel'
import { useCircadianTheme } from '../hooks/useCircadianTheme'
import StarsRating from './StarsRating'

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
  const { generateStaffChart, getMyCharts } = useAstrologyApi()
  const theme = useCircadianTheme()
  const [loading, setLoading] = useState(false)
  const [myCharts, setMyCharts] = useState<SavedNatalChart[]>([])
  const [viewingChart, setViewingChart] = useState<SavedNatalChart | null>(null)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [city, setCity] = useState('')
  const [gender, setGender] = useState<'M'|'F'|''>('F')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharts()
  }, [])

  const fetchCharts = async () => {
    try {
      const charts = await getMyCharts()
      setMyCharts(charts)
    } catch (e) {
      console.error(e)
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
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mystical-card border-emerald-500/20 bg-emerald-500/5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl text-emerald-400">🌕</div>
          <div>
            <h2 className="font-serif text-xl font-bold text-white mb-0.5">Il Tuo Tema Natale (Staff)</h2>
            <p className="text-emerald-400/70 text-sm">Un dono di saggia consapevolezza per chi cammina con noi.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Data di Nascita</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Ora Esatta</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Città</label>
            <input
              type="text"
              required
              placeholder="Es. Roma"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold text-xs py-2.5 rounded-lg font-bold uppercase tracking-widest"
            >
              {loading ? 'Lettura...' : 'Calcola Gratis'}
            </button>
          </div>
        </form>

        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
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
              {(viewingChart.chartData.pianeti || []).slice(0, 10).map((p) => (
                <div key={p.nome} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                  <span className={`text-2xl block mb-1 ${PLANET_COLOR[p.nome] || 'text-white'}`}>{PLANET_SYMBOLS[p.nome] || '✦'}</span>
                  <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{p.nome}</p>
                  <p className="font-serif text-white text-sm">{p.segno}</p>
                </div>
              ))}
            </div>

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
          {myCharts.map(c => (
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

import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { apiJson } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'
import { motion } from 'framer-motion'

type AnalyticsData = {
  monthly: { month: string; total: number; paid: number; free: number }[]
  typeDistribution: Record<string, number>
  retention: {
    newThisMonth: number
    returningTotal: number
    totalDistinctClients: number
  }
}

const KIND_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  tarocchi:    { label: 'Tarocchi',    color: '#d4a017', emoji: '🃏' },
  coaching:    { label: 'Coaching',    color: '#10b981', emoji: '🌱' },
  combo_light: { label: 'Combo Light', color: '#60a5fa', emoji: '✨' },
  combo_full:  { label: 'Combo Full',  color: '#818cf8', emoji: '🦋' },
  altro:       { label: 'Altro',       color: '#6b7280', emoji: '📌' },
}

export default function StaffAnalyticsWidget() {
  const { getToken } = useAuth()
  const api = Boolean(getApiBaseUrl())
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!api) { setLoading(false); return }
    setLoading(true)
    try {
      const r = await apiJson<AnalyticsData>(getToken, '/api/staff/analytics')
      setData(r)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [getToken, api])

  useEffect(() => { void load() }, [load])

  if (!api) return null

  if (loading) return (
    <div className="grid md:grid-cols-3 gap-4">
      {[0,1,2].map(i => (
        <div key={i} className="mystical-card animate-pulse h-32 bg-white/[0.02]" />
      ))}
    </div>
  )
  if (!data) return <p className="text-white/40 text-sm">Dati analytics non disponibili.</p>

  // Mese corrente e precedente per il trend
  const months = data.monthly
  const currentMonth = months[months.length - 1]
  const prevMonth = months[months.length - 2]
  const trend = currentMonth && prevMonth
    ? currentMonth.paid - prevMonth.paid
    : null

  // Totale consulti distribuzione (ultimi 12 mesi)
  const distTotal = Object.values(data.typeDistribution).reduce((a, b) => a + b, 0)

  const { retention } = data

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Card 1 — Sessioni mese corrente */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mystical-card border border-white/10"
        >
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Sessioni pagate — mese in corso</p>
          <p className="font-serif text-4xl font-bold text-gold-400">{currentMonth?.paid ?? '—'}</p>
          {trend !== null && (
            <p className={`text-xs mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400/80'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)} rispetto al mese scorso
            </p>
          )}
        </motion.div>

        {/* Card 2 — Clienti totali */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mystical-card border border-white/10"
        >
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Clienti nel sistema</p>
          <p className="font-serif text-4xl font-bold text-white">{retention.totalDistinctClients}</p>
          <p className="text-xs mt-1 text-emerald-400">+{retention.newThisMonth} nuovi questo mese</p>
        </motion.div>

        {/* Card 3 — Consulto omaggio */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mystical-card border border-white/10"
        >
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Sessioni totali (mese in corso)</p>
          <p className="font-serif text-4xl font-bold text-white">{currentMonth?.total ?? '—'}</p>
          <p className="text-xs mt-1 text-white/40">{currentMonth?.free ?? 0} omaggi inclusi</p>
        </motion.div>
      </div>

      {/* Trend mensile ultimi 6m */}
      {months.length > 1 && (
        <div className="mystical-card border border-white/10">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-4">Andamento mensile (ultimi 6 mesi)</p>
          <div className="flex items-end gap-3 h-24">
            {months.map((m) => {
              const pct = currentMonth?.paid > 0 ? (m.paid / Math.max(...months.map(x => x.paid))) : 0
              return (
                <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-t-sm bg-gold-500/40 transition-all"
                    style={{ height: `${Math.max(4, pct * 88)}px` }}
                    title={`${m.paid} pagati`}
                  />
                  <span className="text-[9px] text-white/30 rotate-[-30deg] origin-top-left">{m.month.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Distribuzione tipi */}
      {distTotal > 0 && (
        <div className="mystical-card border border-white/10">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-4">Mix consulti (ultimi 12 mesi)</p>
          <div className="space-y-2.5">
            {Object.entries(data.typeDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([kind, count]) => {
                const meta = KIND_LABELS[kind] ?? KIND_LABELS.altro
                const pct = distTotal > 0 ? Math.round((count / distTotal) * 100) : 0
                return (
                  <div key={kind}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-white/70">{meta.emoji} {meta.label}</span>
                      <span className="text-white/40">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

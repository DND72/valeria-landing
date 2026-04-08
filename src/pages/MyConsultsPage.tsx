import { useUser, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { apiJson } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'
import ClientLayout from '../components/dashboard/ClientLayout'

type ConsultRow = {
  id: string
  status: string
  is_free_consult: boolean
  meeting_join_url: string | null
  start_at: string | null
  end_at: string | null
  created_at: string
  cost_credits?: number
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Prenotato',
  completed: 'Completato',
  cancelled: 'Annullato',
  no_show: 'Non presentato',
  pending: 'In attesa',
}

const STATUS_COLOR: Record<string, string> = {
  scheduled: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
  completed: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  cancelled: 'text-red-400 border-red-500/20 bg-red-500/10',
  no_show: 'text-orange-400 border-orange-500/20 bg-orange-500/10',
  pending: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch { return iso }
}

export default function MyConsultsPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const apiOk = Boolean(getApiBaseUrl())

  const [consults, setConsults] = useState<ConsultRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isLoaded || !user) return
    if (!apiOk) { setLoading(false); return }
    setLoading(true)
    try {
      const r = await apiJson<{ consults: ConsultRow[] }>(getToken, '/api/me/consults')
      setConsults(r.consults ?? [])
    } catch {
      setError('Impossibile caricare lo storico. Riprova tra qualche istante.')
    } finally {
      setLoading(false)
    }
  }, [isLoaded, user, getToken, apiOk])

  useEffect(() => { void load() }, [load])

  if (isLoaded && !user) return <Navigate to="/accedi" replace />

  return (
    <ClientLayout title="I miei Consulti" subtitle="Cronologia Astrale">
      <div className="space-y-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-white/40 text-sm mb-10">
            Storico completo delle tue sessioni con Valeria.
          </p>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="h-6 w-6 rounded-full border-2 border-gold-500/20 border-t-gold-500 animate-spin" />
              <p className="text-white/30 text-xs uppercase tracking-widest">Caricamento sessioni...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* No backend */}
          {!loading && !error && !apiOk && (
            <div className="mystical-card text-center py-10">
              <p className="text-white/40 text-sm">Connetti il backend per visualizzare i tuoi consulti.</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && apiOk && consults?.length === 0 && (
            <div className="mystical-card text-center py-20">
              <p className="text-5xl mb-4">🔮</p>
              <p className="text-white/60 font-serif text-xl mb-2">Nessun consulto ancora</p>
              <p className="text-white/30 text-sm mb-8">Il tuo percorso inizia con il primo passo.</p>
              <Link to="/area-personale" className="btn-gold text-sm px-6 py-2.5">
                Prenota il primo consulto →
              </Link>
            </div>
          )}

          {/* List */}
          {!loading && !error && consults && consults.length > 0 && (
            <div className="space-y-3">
              {consults.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mystical-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/8"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {c.is_free_consult ? '🎁' : '🃏'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {c.is_free_consult ? 'Consulto Omaggio' : 'Consulto'}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">{formatWhen(c.start_at)}</p>
                      {c.cost_credits != null && !c.is_free_consult && (
                        <p className="text-amber-400/70 text-[10px] mt-0.5 font-mono">
                          {c.cost_credits} CR
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest border px-2.5 py-1 rounded-full ${STATUS_COLOR[c.status] ?? 'text-white/40 border-white/10 bg-white/5'}`}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                    {c.meeting_join_url && c.status === 'scheduled' && (
                      <a
                        href={c.meeting_join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] uppercase font-bold tracking-widest bg-gold-500/10 border border-gold-500/30 text-gold-400 px-3 py-1.5 rounded-lg hover:bg-gold-500/20 transition-colors whitespace-nowrap"
                      >
                        Entra →
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* CTA Prenota */}
          {!loading && consults && consults.length > 0 && (
            <div className="mt-8 text-center">
              <Link to="/area-personale" className="btn-gold text-sm px-6 py-2.5">
                + Prenota un nuovo consulto
              </Link>
            </div>
          )}

        </motion.div>
      </div>
    </ClientLayout>
  )
}

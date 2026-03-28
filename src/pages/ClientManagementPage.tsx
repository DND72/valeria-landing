import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'

type SortMode = 'alpha' | 'recent'

type ClientRow = {
  email: string
  name: string | null
  totalConsults: number
  paidConsults: number
  freeConsults: number
  lastScheduledAt: string | null
  lastInvoicedAt: string | null
  invoicedThisMonth: boolean
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function ClientManagementPage() {
  const { isLoaded, user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const apiConfigured = Boolean(getApiBaseUrl())

  const [sort, setSort] = useState<SortMode>('alpha')
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!apiConfigured) {
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await apiJson<{ clients: ClientRow[] }>(getToken, `/api/staff/clients?sort=${sort}`)
      setClients(data.clients ?? [])
    } catch (e) {
      setError(e instanceof ApiError ? String(e.message) : 'Errore caricamento')
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [getToken, apiConfigured, sort])

  useEffect(() => {
    if (!isLoaded) return
    if (!user || !isPrivilegedClerkUser(user)) {
      navigate('/dashboard', { replace: true })
      return
    }
    void load()
  }, [isLoaded, user, navigate, load])

  if (!isLoaded || !user) return null
  if (!isPrivilegedClerkUser(user)) return null

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 20%, rgba(212,160,23,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-1">Staff</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">Gestione clienti</h1>
            <p className="text-white/45 text-sm mt-2 max-w-2xl">
              Elenco da email dei consulti registrati. Ordine alfabetico o per ultimo appuntamento. Apri la scheda per
              note, fatturazione e storico.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex rounded-lg border border-white/15 p-0.5 bg-dark-400/80">
              <button
                type="button"
                onClick={() => setSort('alpha')}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  sort === 'alpha' ? 'bg-gold-600/25 text-gold-200' : 'text-white/50 hover:text-white/75'
                }`}
              >
                A → Z
              </button>
              <button
                type="button"
                onClick={() => setSort('recent')}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  sort === 'recent' ? 'bg-gold-600/25 text-gold-200' : 'text-white/50 hover:text-white/75'
                }`}
              >
                Ultimo consulto
              </button>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="btn-outline text-sm px-4 py-2"
              disabled={loading || !apiConfigured}
            >
              {loading ? 'Aggiornamento…' : 'Aggiorna'}
            </button>
            <Link to="/dashboard" className="btn-gold text-sm px-4 py-2 text-center">
              Il tuo Diario
            </Link>
          </div>
        </motion.div>

        {!apiConfigured && (
          <div className="mystical-card border border-amber-600/30 text-amber-200/90 text-sm mb-6">
            Backend non collegato (<code className="text-amber-300/90">VITE_API_URL</code>).
          </div>
        )}

        {error && (
          <p className="text-red-400/90 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="mystical-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.04] text-white/50 text-xs uppercase tracking-wide">
                  <th className="py-3 px-3 font-medium">Cliente</th>
                  <th className="py-3 px-3 font-medium">Email</th>
                  <th className="py-3 px-3 font-medium text-center">Consulti</th>
                  <th className="py-3 px-3 font-medium">Acquisti</th>
                  <th className="py-3 px-3 font-medium whitespace-nowrap">Ultimo in calendario</th>
                  <th className="py-3 px-3 font-medium">Fatt. mese</th>
                  <th className="py-3 px-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-white/40">
                      Caricamento…
                    </td>
                  </tr>
                )}
                {!loading && clients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-white/40">
                      Nessun cliente con email nei consulti.
                    </td>
                  </tr>
                )}
                {!loading &&
                  clients.map((c) => (
                    <tr key={c.email} className="border-t border-white/[0.06] hover:bg-white/[0.03]">
                      <td className="py-2.5 px-3 text-white/90">{c.name || '—'}</td>
                      <td className="py-2.5 px-3 text-white/55 text-xs break-all">{c.email}</td>
                      <td className="py-2.5 px-3 text-center text-white/70">{c.totalConsults}</td>
                      <td className="py-2.5 px-3 text-white/55 text-xs">
                        {c.paidConsults} pag. · {c.freeConsults} omag.
                      </td>
                      <td className="py-2.5 px-3 text-white/60 whitespace-nowrap text-xs">
                        {formatWhen(c.lastScheduledAt)}
                      </td>
                      <td className="py-2.5 px-3 text-xs">
                        {c.invoicedThisMonth ? (
                          <span className="text-emerald-400/90">Sì</span>
                        ) : c.lastInvoicedAt ? (
                          <span className="text-white/45">No · {formatWhen(c.lastInvoicedAt)}</span>
                        ) : (
                          <span className="text-amber-400/80">Non indicato</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <Link
                          to={`/gestione-clienti/${encodeURIComponent(c.email)}`}
                          className="text-gold-500/90 hover:underline text-xs whitespace-nowrap"
                        >
                          Scheda →
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

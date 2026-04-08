import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'
import StaffLayout from '../components/dashboard/StaffLayout'

type SortMode = 'alpha' | 'recent'
type ClientRow = {
  clerkId?: string | null
  email: string | null
  username: string | null
  name: string | null
  totalConsults: number
  paidConsults: number
  freeConsults: number
  lastScheduledAt: string | null
  lastInvoicedAt: string | null
  invoicedThisMonth: boolean
  isRegistered: boolean
  isVerified: boolean
  lastSignInAt: string | null
  balance: number | null
  lockedBalance: number | null
  latestChartId: string | null
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
      navigate('/area-personale', { replace: true })
      return
    }
    void load()
  }, [isLoaded, user, navigate, load])

  if (!isLoaded || !user) return null
  if (!isPrivilegedClerkUser(user)) return null

  return (
    <StaffLayout title="Gestione Clienti" subtitle="Anagrafica profonda e storico crediti">
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-white/45 text-sm max-w-2xl font-serif italic">
              "Il database è la memoria del percorso di ogni anima."
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex rounded-lg border border-white/15 p-0.5 bg-dark-400/80 shadow-inner">
              <button
                type="button"
                onClick={() => setSort('alpha')}
                className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-md transition-all ${
                  sort === 'alpha' ? 'bg-gold-600 text-black' : 'text-white/50 hover:text-white/75'
                }`}
              >
                A → Z
              </button>
              <button
                type="button"
                onClick={() => setSort('recent')}
                className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-md transition-all ${
                  sort === 'recent' ? 'bg-gold-600 text-black' : 'text-white/50 hover:text-white/75'
                }`}
              >
                Recenti
              </button>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="btn-outline text-xs px-4 py-2"
              disabled={loading || !apiConfigured}
            >
              {loading ? 'Aggiornamento…' : 'Sincronizza'}
            </button>
          </div>
        </motion.div>

        {!apiConfigured && (
          <div className="rounded-xl border border-amber-600/30 bg-amber-950/20 px-4 py-3 text-amber-100 text-sm mb-6">
            Backend non collegato (VITE_API_URL).
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="mystical-card p-0 overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.04] text-white/50 text-[10px] uppercase tracking-widest">
                  <th className="py-4 px-4 font-black">Stato</th>
                  <th className="py-4 px-4 font-black">Cliente</th>
                  <th className="py-4 px-4 font-black">Email</th>
                  <th className="py-4 px-4 font-black text-center">Consulti</th>
                  <th className="py-4 px-4 font-black">Acquisti</th>
                  <th className="py-4 px-4 font-black whitespace-nowrap">Ultimo booking</th>
                  <th className="py-4 px-4 font-black text-right whitespace-nowrap">Saldo</th>
                  <th className="py-4 px-4 font-black text-right whitespace-nowrap">Bloccati</th>
                  <th className="py-4 px-4 font-black" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={11} className="py-20 text-center text-white/20 italic">
                      Caricamento database...
                    </td>
                  </tr>
                )}
                {!loading && clients.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-20 text-center text-white/20 italic">
                      Nessun cliente registrato al momento.
                    </td>
                  </tr>
                )}
                {!loading &&
                  clients.map((c) => (
                    <tr key={c.clerkId || c.email || 'guest'} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {c.isRegistered ? (
                            <span className="text-[9px] bg-gold-600/20 text-gold-400 px-1.5 py-0.5 rounded border border-gold-600/30 w-fit uppercase font-black tracking-tighter shadow-sm">Registrato</span>
                          ) : (
                            <span className="text-[9px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded border border-white/10 w-fit uppercase font-bold tracking-tighter">Guest</span>
                          )}
                          {c.isVerified && (
                             <span className="text-[9px] bg-emerald-600/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-600/30 w-fit uppercase font-bold tracking-tighter">VM18</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-bold flex items-center gap-2">
                          {c.name || (c.isRegistered ? 'Utente senza nome' : '—')}
                          {c.latestChartId && <span title="Tema calcolato" className="text-gold-500 animate-pulse text-xs">✨</span>}
                        </div>
                        {c.username && <div className="text-gold-500/50 text-[10px]">@{c.username}</div>}
                      </td>
                      <td className="py-3 px-4 text-white/50 text-[11px] break-all">{c.email || <span className="italic opacity-30 text-[10px]">Username login</span>}</td>
                      <td className="py-3 px-4 text-center text-white/70">
                        {c.totalConsults > 0 ? (
                          <span className="font-mono font-bold text-gold-400 lg:text-base">{c.totalConsults}</span>
                        ) : (
                          <span className="text-white/20">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white/40 text-[11px]">
                        {c.totalConsults > 0 ? (
                          <span className="opacity-80">
                            <span className="text-white/60">{c.paidConsults}</span> pag. / <span className="text-emerald-500/60">{c.freeConsults}</span> omag.
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white/40 whitespace-nowrap text-[11px] font-mono">
                        {formatWhen(c.lastScheduledAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {c.balance !== null ? <span className="text-gold-400 font-mono font-bold">{c.balance}</span> : <span className="text-white/20">—</span>}
                        <span className="text-[9px] text-white/20 ml-1">CR</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {c.lockedBalance !== null ? (
                          c.lockedBalance > 0 ? (
                            <span className="text-amber-500 font-mono font-bold">{c.lockedBalance}</span>
                          ) : (
                            <span className="text-white/20">0</span>
                          )
                        ) : <span className="text-white/20">—</span>}
                        <span className="text-[9px] text-white/20 ml-1">CR</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {c.email ? (
                          <Link
                            to={`/gestione-clienti/${encodeURIComponent(c.email)}`}
                            className="text-gold-500/80 hover:text-gold-400 text-xs font-bold whitespace-nowrap px-3 py-1 bg-white/5 rounded-lg border border-white/5 hover:border-gold-500/30 transition-all"
                          >
                            Scheda →
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}

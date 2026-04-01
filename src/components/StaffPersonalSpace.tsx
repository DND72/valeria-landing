import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import type { ValeriaPresenceStatus } from '../lib/valeriaPresence'
import { getApiBaseUrl } from '../constants/api'
import StaffExternalReviewImport from './StaffExternalReviewImport'
import StaffAnalyticsWidget from './StaffAnalyticsWidget'
import StaffCrmDrawer from './StaffCrmDrawer'

type MeetingsPayload =
  | {
      configured: true
      meetings: Array<{
        startAt: string
        endAt: string | null
        eventName: string
        inviteeSummary: string
        joinUrl: string | null
      }>
    }
  | { configured: false; meetings: []; message: string }

type ClientsWeekPayload = {
  totalDistinctEmails: number
  windowLabel: string
  clients: Array<{
    email: string
    name: string | null
    slots: Array<{
      id: string
      startAt: string
      endAt: string | null
      status: string
      isFreeConsult: boolean
    }>
  }>
}

type ClientRow = {
  email: string
  name: string | null
  totalConsults: number
  paidConsults: number
  freeConsults: number
  lastScheduledAt: string | null
}

type Tab = 'oggi' | 'crm' | 'analytics'

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short' }).format(new Date(iso))
  } catch { return iso }
}

export default function StaffPersonalSpace() {
  const { getToken } = useAuth()
  const apiConfigured = Boolean(getApiBaseUrl())

  const [tab, setTab] = useState<Tab>('oggi')

  const [presence, setPresence] = useState<{ status: ValeriaPresenceStatus; updatedAt: string | null } | null>(null)
  const [presenceSaving, setPresenceSaving] = useState(false)

  const [today, setToday] = useState<MeetingsPayload | null>(null)
  const [todayLoading, setTodayLoading] = useState(false)

  const [clientsWeek, setClientsWeek] = useState<ClientsWeekPayload | null>(null)
  const [clientsLoading, setClientsLoading] = useState(false)

  // CRM
  const [allClients, setAllClients] = useState<ClientRow[] | null>(null)
  const [crmLoading, setCrmLoading] = useState(false)
  const [crmSearch, setCrmSearch] = useState('')
  const [drawerEmail, setDrawerEmail] = useState<string | null>(null)

  const loadPresence = useCallback(async () => {
    if (!apiConfigured) return
    try {
      const r = await apiJson<{ status: ValeriaPresenceStatus; updatedAt: string | null }>(getToken, '/api/staff/presence')
      setPresence({ status: r.status, updatedAt: r.updatedAt })
    } catch {
      setPresence(null)
    }
  }, [getToken, apiConfigured])

  const loadToday = useCallback(async () => {
    if (!apiConfigured) return
    setTodayLoading(true)
    try {
      const r = await apiJson<MeetingsPayload>(getToken, '/api/staff/calendly-today')
      setToday(r)
    } catch (e) {
      setToday({ configured: false, meetings: [], message: e instanceof ApiError ? String(e.message) : 'Errore caricamento.' })
    } finally {
      setTodayLoading(false)
    }
  }, [getToken, apiConfigured])

  const loadClientsWeek = useCallback(async () => {
    if (!apiConfigured) return
    setClientsLoading(true)
    try {
      const r = await apiJson<ClientsWeekPayload>(getToken, '/api/staff/clients-week')
      setClientsWeek(r)
    } catch {
      setClientsWeek(null)
    } finally {
      setClientsLoading(false)
    }
  }, [getToken, apiConfigured])

  const loadAllClients = useCallback(async () => {
    if (!apiConfigured) return
    setCrmLoading(true)
    try {
      const r = await apiJson<{ sort: string; clients: ClientRow[] }>(getToken, '/api/staff/clients?sort=recent')
      setAllClients(r.clients)
    } catch {
      setAllClients([])
    } finally {
      setCrmLoading(false)
    }
  }, [getToken, apiConfigured])

  useEffect(() => {
    void loadPresence()
    void loadToday()
    void loadClientsWeek()
  }, [loadPresence, loadToday, loadClientsWeek])

  useEffect(() => {
    if (tab === 'crm' && allClients === null) void loadAllClients()
  }, [tab, allClients, loadAllClients])

  const setPresenceStatus = async (status: ValeriaPresenceStatus) => {
    if (!apiConfigured) return
    setPresenceSaving(true)
    try {
      const r = await apiJson<{ status: ValeriaPresenceStatus; updatedAt: string }>(getToken, '/api/staff/presence', {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setPresence({ status: r.status, updatedAt: r.updatedAt })
    } catch { /* ignore */ } finally {
      setPresenceSaving(false)
    }
  }

  const presenceOptions: { value: ValeriaPresenceStatus; label: string; hint: string }[] = [
    { value: 'online', label: 'Online', hint: 'Disponibile per messaggi o chiamate rapide' },
    { value: 'busy', label: 'Occupata', hint: 'In sessione o non disponibile al momento' },
    { value: 'offline', label: 'Offline', hint: 'Non in linea' },
  ]

  const filteredClients = (allClients ?? []).filter((c) =>
    !crmSearch ||
    c.email.toLowerCase().includes(crmSearch.toLowerCase()) ||
    (c.name ?? '').toLowerCase().includes(crmSearch.toLowerCase())
  )

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'oggi', label: 'Oggi', emoji: '📅' },
    { id: 'crm', label: 'CRM Clienti', emoji: '👥' },
    { id: 'analytics', label: 'Analytics', emoji: '📊' },
  ]

  return (
    <>
      <div className="space-y-6">
        <p className="text-white/40 text-sm border-l border-gold-600/25 pl-3">
          Spazio di lavoro: consulti, clienti e stato visibile alle clienti sulle schede prenotazione. Il calendario
          interattivo resta in{' '}
          <Link to="/control-room" className="text-gold-500/90 hover:underline">
            Control Room
          </Link>
          .
        </p>

        {/* Presenza — sempre visibile */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mystical-card">
          <h2 className="font-serif text-xl font-bold text-white mb-1">Come ti vedono le clienti</h2>
          <p className="text-white/40 text-sm mb-4">
            Lo stato scelto qui compare sulle schede consulto nella loro area e si aggiorna automaticamente in pagina.
          </p>
          {!apiConfigured && <p className="text-amber-200/85 text-sm">Collega il backend per salvare lo stato.</p>}
          {apiConfigured && (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {presenceOptions.map((o) => {
                  const active = presence?.status === o.value
                  return (
                    <button
                      key={o.value}
                      type="button"
                      disabled={presenceSaving}
                      onClick={() => void setPresenceStatus(o.value)}
                      className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                        active
                          ? 'border-gold-500/70 bg-gold-600/15 text-gold-200'
                          : 'border-white/15 text-white/60 hover:border-white/25 hover:text-white/80'
                      }`}
                    >
                      {o.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-white/30 text-xs">
                {presenceOptions.find((o) => o.value === (presence?.status ?? 'offline'))?.hint}
                {presence?.updatedAt && (
                  <span className="ml-2">· Aggiornato {formatWhen(presence.updatedAt)}</span>
                )}
              </p>
            </>
          )}
        </motion.section>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/8 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                tab === t.id
                  ? 'bg-gold-600/20 text-gold-300 border border-gold-600/30'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <span className="mr-1.5">{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ===== TAB: OGGI ===== */}
        {tab === 'oggi' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <StaffExternalReviewImport />

            {/* Appuntamenti oggi */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mystical-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-white mb-1">Appuntamenti di oggi</h2>
                  <p className="text-white/40 text-sm">
                    Solo il giorno corrente (fuso Europe/Rome), da Calendly. Sincronizza se hai appena modificato qualcosa lì.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadToday()}
                  className="btn-outline text-sm px-4 py-2 shrink-0"
                  disabled={!apiConfigured || todayLoading}
                >
                  {todayLoading ? 'Aggiornamento…' : 'Sincronizza'}
                </button>
              </div>
              {todayLoading && !today && <p className="text-white/45 text-sm">Caricamento…</p>}
              {today && !today.configured && (
                <div className="rounded-lg border border-amber-600/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
                  {today.message}
                </div>
              )}
              {today?.configured && today.meetings.length === 0 && !todayLoading && (
                <p className="text-white/45 text-sm">Nessun appuntamento in calendario per oggi.</p>
              )}
              {today?.configured && today.meetings.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full text-sm text-left min-w-[300px]">
                    <thead>
                      <tr className="bg-white/[0.04] text-white/50 text-xs uppercase tracking-wide">
                        <th className="py-2.5 px-3">Ora</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Tipo</th>
                        <th className="py-2.5 px-3">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {today.meetings.map((m, i) => (
                        <tr key={`${m.startAt}-${i}`} className="border-t border-white/[0.06]">
                          <td className="py-2 px-3 text-white/85 whitespace-nowrap">{formatWhen(m.startAt)}</td>
                          <td className="py-2 px-3 text-white/70">{m.inviteeSummary}</td>
                          <td className="py-2 px-3 text-white/55">{m.eventName}</td>
                          <td className="py-2 px-3">
                            {m.joinUrl ? (
                              <a href={m.joinUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline text-xs">
                                Entra
                              </a>
                            ) : (
                              <span className="text-white/25">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>

            {/* Clienti settimana */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mystical-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-white mb-1">Clienti e programma (prossimi 7 giorni)</h2>
                  <p className="text-white/40 text-sm">
                    Basato sui consulti registrati nel sito (webhook Calendly). Email distinte in archivio:{' '}
                    <strong className="text-white/55">{clientsWeek?.totalDistinctEmails ?? '—'}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadClientsWeek()}
                  className="btn-outline text-sm px-4 py-2 shrink-0"
                  disabled={!apiConfigured || clientsLoading}
                >
                  {clientsLoading ? 'Aggiornamento…' : 'Aggiorna elenco'}
                </button>
              </div>
              {clientsLoading && !clientsWeek && <p className="text-white/45 text-sm">Caricamento…</p>}
              {clientsWeek && clientsWeek.clients.length === 0 && !clientsLoading && (
                <p className="text-white/45 text-sm">Nessun appuntamento nei prossimi 7 giorni con email associata.</p>
              )}
              {clientsWeek && clientsWeek.clients.length > 0 && (
                <ul className="space-y-6">
                  {clientsWeek.clients.map((c) => (
                    <li key={c.email} className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div>
                          <p className="text-white font-medium text-sm">{c.name || 'Senza nome'}</p>
                          <p className="text-white/40 text-xs">{c.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDrawerEmail(c.email)}
                          className="text-xs text-gold-500/80 hover:text-gold-400 hover:underline shrink-0"
                        >
                          Apri scheda →
                        </button>
                      </div>
                      <ul className="space-y-1.5 text-sm text-white/55">
                        {c.slots.map((s) => (
                          <li key={s.id} className="flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>{formatWhen(s.startAt)}</span>
                            <span className="text-white/35 text-xs uppercase">{s.status}</span>
                            {s.isFreeConsult && <span className="text-emerald-500/80 text-xs">omaggio</span>}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          </motion.div>
        )}

        {/* ===== TAB: CRM ===== */}
        {tab === 'crm' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="search"
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                placeholder="Cerca per email o nome…"
                className="flex-1 max-w-sm bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
              />
              <button
                type="button"
                onClick={() => void loadAllClients()}
                disabled={crmLoading}
                className="btn-outline text-sm px-4 py-2 shrink-0"
              >
                {crmLoading ? 'Caricamento…' : 'Aggiorna'}
              </button>
            </div>

            {crmLoading && <p className="text-white/45 text-sm">Caricamento clienti…</p>}
            {!crmLoading && filteredClients.length === 0 && (
              <p className="text-white/40 text-sm">Nessun cliente trovato.</p>
            )}

            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-sm text-left min-w-[500px]">
                <thead>
                  <tr className="bg-white/[0.04] text-white/50 text-xs uppercase tracking-wide">
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3 text-center">Consulti</th>
                    <th className="py-2.5 px-3">Ultimo</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((c) => (
                    <tr key={c.email} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <p className="text-white/85 font-medium">{c.name ?? '—'}</p>
                        <p className="text-white/35 text-xs">{c.email}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-white/70">{c.paidConsults}</span>
                        <span className="text-white/25 text-xs"> pagati</span>
                        {c.freeConsults > 0 && (
                          <span className="ml-1 text-xs text-emerald-500/60">+{c.freeConsults}🎁</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-white/45 text-xs">{formatDate(c.lastScheduledAt)}</td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => setDrawerEmail(c.email)}
                          className="text-xs text-gold-500/80 hover:text-gold-400 hover:underline"
                        >
                          Scheda →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ===== TAB: ANALYTICS ===== */}
        {tab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StaffAnalyticsWidget />
          </motion.div>
        )}
      </div>

      {/* CRM Drawer (portale laterale) */}
      <StaffCrmDrawer
        email={drawerEmail}
        onClose={() => setDrawerEmail(null)}
      />
    </>
  )
}

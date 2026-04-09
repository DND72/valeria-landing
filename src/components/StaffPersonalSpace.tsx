import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { apiJson, ApiError } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'
import StaffExternalReviewImport from './StaffExternalReviewImport'
import StaffAnalyticsWidget from './StaffAnalyticsWidget'
import StaffCrmDrawer from './StaffCrmDrawer'
import StaffLenormandMentor from './StaffLenormandMentor'
import StaffAstrology from './StaffAstrology'
import StaffLiveMonitor from './dashboard/StaffLiveMonitor'

type MeetingsPayload =
  | {
      configured: true
      meetings: Array<{
        id: string
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
      eventName: string
      joinUrl: string | null
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

type Tab = 'live' | 'oggi' | 'crm' | 'analytics' | 'lenormand' | 'astrologia'

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

export default function StaffPersonalSpace({ activeTab }: { activeTab: Tab }) {
  const { getToken } = useAuth()
  const apiConfigured = Boolean(getApiBaseUrl())

  const tab = activeTab

  const [today, setToday] = useState<MeetingsPayload | null>(null)
  const [todayLoading, setTodayLoading] = useState(false)

  const [clientsWeek, setClientsWeek] = useState<ClientsWeekPayload | null>(null)
  const [clientsLoading, setClientsLoading] = useState(false)

  // CRM
  const [allClients, setAllClients] = useState<ClientRow[] | null>(null)
  const [crmLoading, setCrmLoading] = useState(false)
  const [crmSearch, setCrmSearch] = useState('')
  const [drawerEmail, setDrawerEmail] = useState<string | null>(null)

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
    void loadToday()
    void loadClientsWeek()
  }, [loadToday, loadClientsWeek])

  useEffect(() => {
    if (tab === 'crm' && allClients === null) void loadAllClients()
  }, [tab, allClients, loadAllClients])

  const handleSaveLink = async (id: string, link: string) => {
    if (!apiConfigured) return
    try {
      await apiJson(getToken, `/api/staff/consults/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ meeting_link: link || null }),
      })
      void loadToday()
      void loadClientsWeek()
    } catch {
      alert('Errore nel salvataggio link')
    }
  }

  const handleClaim = async (id: string) => {
    if (!window.confirm("Confermi di voler terminare e incassare i crediti per questo consulto?")) return
    try {
      await apiJson(getToken, `/api/staff/consults/${id}/claim`, { method: 'POST' })
      void loadToday()
      void loadClientsWeek()
    } catch (e: any) {
      alert(e.message || "Errore durante l'incasso")
    }
  }

  const handleNoShow = async (id: string) => {
    if (!window.confirm("Confermi che il cliente non si è presentato? Verrà applicata una penale e il resto rimborsato.")) return
    try {
      await apiJson(getToken, `/api/staff/consults/${id}/no-show`, { method: 'POST' })
      void loadToday()
      void loadClientsWeek()
    } catch (e: any) {
      alert(e.message || "Errore durante la segnalazione no-show")
    }
  }

  const filteredClients = (allClients ?? []).filter((c) =>
    !crmSearch ||
    c.email.toLowerCase().includes(crmSearch.toLowerCase()) ||
    (c.name ?? '').toLowerCase().includes(crmSearch.toLowerCase())
  )

  return (
    <>
      <div className="space-y-6">
        {/* ===== TAB: LIVE MONITOR ===== */}
        {tab === 'live' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StaffLiveMonitor />
          </motion.div>
        )}

        {/* ===== TAB: OGGI ===== */}
        {tab === 'oggi' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <StaffExternalReviewImport />

            {/* Appuntamenti oggi */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mystical-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-white mb-1">Agenda: I Consulti di Oggi</h2>
                  <p className="text-white/45 text-xs">
                    Elenco in tempo reale delle sessioni programmate per la data odierna.
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
                        <th className="py-2.5 px-3 text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {today.meetings.map((m, i) => (
                        <tr key={`${m.startAt}-${i}`} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3 text-gold-400 font-mono font-bold whitespace-nowrap">{formatWhen(m.startAt)}</td>
                          <td className="py-3 px-3">
                            <p className="text-white font-bold text-sm leading-none">{m.inviteeSummary}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/40 border border-white/10 px-1.5 py-0.5 rounded">{m.eventName}</span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              {m.joinUrl ? (
                                <a href={m.joinUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                  {m.joinUrl}
                                </a>
                              ) : (
                                <span className="text-white/25 text-xs italic">Nessun link</span>
                              )}
                              <button
                                onClick={() => {
                                  const link = window.prompt('Inserisci il link per la riunione (Meet/Zoom):', m.joinUrl || '')
                                  if (link !== null) {
                                    void handleSaveLink(m.id, link.trim())
                                  }
                                }}
                                className="text-[10px] uppercase font-bold text-white/50 hover:text-white px-2 py-1 bg-white/5 rounded transition-colors ml-auto shrink-0"
                              >
                                {m.joinUrl ? '✎' : '+ Link'}
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleClaim(m.id)}
                                className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded hover:bg-emerald-500/20 transition-colors uppercase font-bold"
                                title="Concludi e Incassa"
                              >
                                Incassa
                              </button>
                              <button 
                                onClick={() => handleNoShow(m.id)}
                                className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded hover:bg-red-500/20 transition-colors uppercase font-bold"
                                title="Segnala No-Show"
                              >
                                No-Show
                              </button>
                            </div>
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
                  <h2 className="font-serif text-xl font-bold text-white mb-1">Prossimi Consulti (7 giorni)</h2>
                  <p className="text-white/40 text-xs">
                    Panoramica settimanale degli impegni futuri e database clienti associato.
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
                  {clientsWeek.clients.map((c: any) => (
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
                      <ul className="space-y-1.5 text-sm text-white/55 border-t border-white/5 pt-3">
                        {c.slots.map((s: any) => (
                          <li key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-black/20 rounded">
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 items-center">
                              <span className="font-medium text-white/80">{formatWhen(s.startAt)}</span>
                              <span>·</span>
                              <span className="text-gold-500/80 capitalize">{s.eventName}</span>
                              <span className="text-white/35 text-xs uppercase px-1.5">{s.status}</span>
                              {s.isFreeConsult && <span className="text-emerald-500/80 text-[10px] uppercase tracking-wider font-bold border border-emerald-500/30 rounded px-1">omaggio</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              {s.joinUrl ? (
                                <a href={s.joinUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                  {s.joinUrl}
                                </a>
                              ) : (
                                <span className="text-white/25 text-xs italic">NNessun link meeting</span>
                              )}
                              <button
                                onClick={() => {
                                  const link = window.prompt('Inserisci il link per la riunione (Meet/Zoom):', s.joinUrl || '')
                                  if (link !== null) {
                                    void handleSaveLink(s.id, link.trim())
                                  }
                                }}
                                className="text-[10px] uppercase font-bold text-white/50 hover:text-white px-2 py-1 bg-white/5 rounded transition-colors shrink-0"
                              >
                                {s.joinUrl ? '✎' : '+ Link'}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 border-l border-white/5 pl-2 ml-1">
                              <button 
                                onClick={() => handleClaim(s.id)}
                                className="text-[9px] text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded hover:bg-emerald-500/10 uppercase font-bold"
                              >
                                Incassa
                              </button>
                              <button 
                                onClick={() => handleNoShow(s.id)}
                                className="text-[9px] text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded hover:bg-red-500/10 uppercase font-bold"
                              >
                                No-Show
                              </button>
                            </div>
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

        {/* ===== TAB: LENORMAND MENTOR ===== */}
        {tab === 'lenormand' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StaffLenormandMentor />
          </motion.div>
        )}

        {/* ===== TAB: ASTROLOGIA STAFF ===== */}
        {tab === 'astrologia' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StaffAstrology />
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

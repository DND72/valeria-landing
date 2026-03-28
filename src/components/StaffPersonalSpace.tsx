import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import type { ValeriaPresenceStatus } from '../lib/valeriaPresence'
import { getApiBaseUrl } from '../constants/api'
import StaffExternalReviewImport from './StaffExternalReviewImport'

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

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function StaffPersonalSpace() {
  const { getToken } = useAuth()
  const apiConfigured = Boolean(getApiBaseUrl())

  const [presence, setPresence] = useState<{ status: ValeriaPresenceStatus; updatedAt: string | null } | null>(null)
  const [presenceSaving, setPresenceSaving] = useState(false)

  const [today, setToday] = useState<MeetingsPayload | null>(null)
  const [todayLoading, setTodayLoading] = useState(false)

  const [clientsWeek, setClientsWeek] = useState<ClientsWeekPayload | null>(null)
  const [clientsLoading, setClientsLoading] = useState(false)

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
      setToday({
        configured: false,
        meetings: [],
        message: e instanceof ApiError ? String(e.message) : 'Errore caricamento.',
      })
    } finally {
      setTodayLoading(false)
    }
  }, [getToken, apiConfigured])

  const loadClients = useCallback(async () => {
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

  useEffect(() => {
    void loadPresence()
    void loadToday()
    void loadClients()
  }, [loadPresence, loadToday, loadClients])

  const setPresenceStatus = async (status: ValeriaPresenceStatus) => {
    if (!apiConfigured) return
    setPresenceSaving(true)
    try {
      const r = await apiJson<{ status: ValeriaPresenceStatus; updatedAt: string }>(getToken, '/api/staff/presence', {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setPresence({ status: r.status, updatedAt: r.updatedAt })
    } catch {
      // ignore
    } finally {
      setPresenceSaving(false)
    }
  }

  const presenceOptions: { value: ValeriaPresenceStatus; label: string; hint: string }[] = [
    { value: 'online', label: 'Online', hint: 'Disponibile per messaggi o chiamate rapide' },
    { value: 'busy', label: 'Occupata', hint: 'In sessione o non disponibile al momento' },
    { value: 'offline', label: 'Offline', hint: 'Non in linea' },
  ]

  return (
    <div className="space-y-8">
      <p className="text-white/40 text-sm border-l border-gold-600/25 pl-3">
        Spazio di lavoro: consulti, clienti e stato visibile alle clienti sulle schede prenotazione. Il calendario
        interattivo resta in{' '}
        <Link to="/control-room" className="text-gold-500/90 hover:underline">
          Control Room
        </Link>
        .
      </p>

      {/* Presenza */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mystical-card"
      >
        <h2 className="font-serif text-xl font-bold text-white mb-1">Come ti vedono le clienti</h2>
        <p className="text-white/40 text-sm mb-4">
          Lo stato scelto qui compare sulle schede consulto nella loro area e si aggiorna automaticamente in pagina.
        </p>
        {!apiConfigured && (
          <p className="text-amber-200/85 text-sm">Collega il backend per salvare lo stato.</p>
        )}
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
                <span className="ml-2">
                  · Aggiornato {formatWhen(presence.updatedAt)}
                </span>
              )}
            </p>
          </>
        )}
      </motion.section>

      <StaffExternalReviewImport />

      {/* Oggi Calendly */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mystical-card"
      >
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
                        <a
                          href={m.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold-400 hover:underline text-xs"
                        >
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
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mystical-card"
      >
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
            onClick={() => void loadClients()}
            className="btn-outline text-sm px-4 py-2 shrink-0"
            disabled={!apiConfigured || clientsLoading}
          >
            {clientsLoading ? 'Aggiornamento…' : 'Aggiorna elenco'}
          </button>
        </div>
        {clientsLoading && !clientsWeek && <p className="text-white/45 text-sm">Caricamento…</p>}
        {clientsWeek && clientsWeek.clients.length === 0 && !clientsLoading && (
          <p className="text-white/45 text-sm">
            Nessun appuntamento nei prossimi 7 giorni con email associata. Quando i clienti prenotano, i dati compaiono
            qui.
          </p>
        )}
        {clientsWeek && clientsWeek.clients.length > 0 && (
          <ul className="space-y-6">
            {clientsWeek.clients.map((c) => (
              <li key={c.email} className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                <p className="text-white font-medium text-sm">{c.name || 'Senza nome'}</p>
                <p className="text-white/40 text-xs mb-3">{c.email}</p>
                <ul className="space-y-1.5 text-sm text-white/55">
                  {c.slots.map((s) => (
                    <li key={s.id} className="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>{formatWhen(s.startAt)}</span>
                      <span className="text-white/35 text-xs uppercase">{s.status}</span>
                      {s.isFreeConsult && (
                        <span className="text-emerald-500/80 text-xs">omaggio</span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </motion.section>
    </div>
  )
}

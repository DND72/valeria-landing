/**
 * Elenco appuntamenti futuri (scheduled events) da Calendly per la host.
 * Richiede scope scheduled_events:read (e users:read).
 */

import { calendlyFetch } from './calendlyClient.js'

function eventUuidFromUri(uri: string): string | null {
  try {
    const u = new URL(uri)
    const parts = u.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] ?? null
  } catch {
    return null
  }
}

export type StaffScheduledMeetingRow = {
  startAt: string
  endAt: string | null
  eventName: string
  inviteeSummary: string
  joinUrl: string | null
}

export type StaffScheduledMeetingsResponse =
  | {
      configured: true
      meetings: StaffScheduledMeetingRow[]
    }
  | {
      configured: false
      meetings: []
      message: string
    }

const MAX_EVENTS_DEFAULT = 25
const MAX_EVENTS_WIDE = 100

async function fetchInviteeLabel(token: string, eventUri: string): Promise<string> {
  const uuid = eventUuidFromUri(eventUri)
  if (!uuid) return '—'
  try {
    const data = (await calendlyFetch(`/scheduled_events/${uuid}/invitees?count=50`, token)) as {
      collection?: Array<{ resource?: { name?: string; email?: string; status?: string } }>
    }
    const rows = (data.collection ?? [])
      .map((c) => c.resource ?? c)
      .filter((r): r is { name?: string; email?: string; status?: string } => Boolean(r))
      .filter((r) => (r.status ?? '').toLowerCase() !== 'canceled')

    if (rows.length === 0) return '—'
    const names = rows
      .map((r) => (r.name && String(r.name).trim()) || (r.email ? String(r.email) : null))
      .filter(Boolean) as string[]
    if (names.length === 0) return '—'
    if (names.length === 1) return names[0]!
    return `${names[0]} +${names.length - 1}`
  } catch {
    return '—'
  }
}

type CalendlyEventResource = {
  uri?: string
  name?: string
  status?: string
  start_time?: string
  end_time?: string
  location?: { join_url?: string; type?: string }
}

/** Elenco eventi Calendly in una finestra temporale (ISO UTC). */
export async function fetchStaffScheduledMeetings(
  token: string,
  opts: {
    minStartTime: string
    maxStartTime?: string
    count?: number
  }
): Promise<StaffScheduledMeetingsResponse> {
  const me = (await calendlyFetch('/users/me', token)) as {
    resource?: { uri?: string; current_organization?: string }
  }
  const userUri = me?.resource?.uri
  const orgUri = me?.resource?.current_organization
  if (!userUri) {
    return {
      configured: false,
      meetings: [],
      message: 'Risposta Calendly /users/me incompleta (manca uri utente).',
    }
  }
  if (!orgUri) {
    return {
      configured: false,
      meetings: [],
      message: 'Manca l’organizzazione Calendly sull’account (current_organization).',
    }
  }

  const qs = new URLSearchParams()
  qs.set('organization', orgUri)
  qs.set('user', userUri)
  qs.set('status', 'active')
  qs.set('sort', 'start_time:asc')
  qs.set('min_start_time', opts.minStartTime)
  if (opts.maxStartTime) qs.set('max_start_time', opts.maxStartTime)
  qs.set('count', String(opts.count ?? MAX_EVENTS_DEFAULT))

  const list = (await calendlyFetch(`/scheduled_events?${qs.toString()}`, token)) as {
    collection?: Array<{ resource?: CalendlyEventResource } & CalendlyEventResource>
  }

  const raw = (list.collection ?? []).map((item) => item.resource ?? item).filter((r) => r.uri && r.start_time)

  const rows = await Promise.all(
    raw.map(async (ev) => {
      const inviteeSummary = await fetchInviteeLabel(token, ev.uri!)
      const joinUrl =
        typeof ev.location?.join_url === 'string' && ev.location.join_url.startsWith('http')
          ? ev.location.join_url
          : null
      return {
        startAt: ev.start_time!,
        endAt: ev.end_time ?? null,
        eventName: (ev.name && String(ev.name).trim()) || 'Appuntamento',
        inviteeSummary,
        joinUrl,
      }
    })
  )

  rows.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  return { configured: true, meetings: rows }
}

/** Prossimi appuntamenti (da ora in poi). */
export async function fetchStaffScheduledMeetingsUpcoming(token: string): Promise<StaffScheduledMeetingsResponse> {
  return fetchStaffScheduledMeetings(token, {
    minStartTime: new Date().toISOString(),
    count: MAX_EVENTS_DEFAULT,
  })
}

/** Appuntamenti il cui orario di inizio cade nel giorno solare corrente (Europe/Rome). */
export async function fetchStaffScheduledMeetingsToday(token: string): Promise<StaffScheduledMeetingsResponse> {
  const min = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const max = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  const res = await fetchStaffScheduledMeetings(token, {
    minStartTime: min,
    maxStartTime: max,
    count: MAX_EVENTS_WIDE,
  })
  if (!res.configured) return res
  const todayRome = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date())
  const meetings = res.meetings.filter((m) => {
    const d = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date(m.startAt))
    return d === todayRome
  })
  return { configured: true, meetings }
}

function calendlyMeetingsError(t: string | undefined, e: unknown): StaffScheduledMeetingsResponse {
  if (!t?.trim()) {
    return {
      configured: false,
      meetings: [],
      message:
        'Manca CALENDLY_PERSONAL_ACCESS_TOKEN sul server. Aggiungilo in backend/.env (scope: users:read, scheduled_events:read).',
    }
  }
  const status = (e as Error & { status?: number })?.status
  const body = (e as Error & { body?: { message?: string; title?: string } })?.body
  const hint =
    status === 403
      ? ' Verifica che il Personal Access Token includa lo scope scheduled_events:read.'
      : ''
  const msg =
    typeof body?.message === 'string'
      ? body.message
      : typeof body?.title === 'string'
        ? body.title
        : e instanceof Error
          ? e.message
          : 'Errore Calendly'
  return {
    configured: false,
    meetings: [],
    message: `Impossibile leggere gli appuntamenti da Calendly: ${msg}.${hint}`,
  }
}

export async function getStaffScheduledMeetingsOrError(token: string | undefined): Promise<StaffScheduledMeetingsResponse> {
  const t = token?.trim()
  if (!t) return calendlyMeetingsError(undefined, null)
  try {
    return await fetchStaffScheduledMeetingsUpcoming(t)
  } catch (e) {
    return calendlyMeetingsError(t, e)
  }
}

export async function getStaffTodayMeetingsOrError(token: string | undefined): Promise<StaffScheduledMeetingsResponse> {
  const t = token?.trim()
  if (!t) return calendlyMeetingsError(undefined, null)
  try {
    return await fetchStaffScheduledMeetingsToday(t)
  } catch (e) {
    return calendlyMeetingsError(t, e)
  }
}

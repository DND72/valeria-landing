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

const MAX_EVENTS = 25

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

export async function fetchStaffScheduledMeetings(token: string): Promise<StaffScheduledMeetingsResponse> {
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

  const minStart = new Date().toISOString()
  const qs = new URLSearchParams()
  qs.set('organization', orgUri)
  qs.set('user', userUri)
  qs.set('status', 'active')
  qs.set('sort', 'start_time:asc')
  qs.set('min_start_time', minStart)
  qs.set('count', String(MAX_EVENTS))

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

export async function getStaffScheduledMeetingsOrError(token: string | undefined): Promise<StaffScheduledMeetingsResponse> {
  const t = token?.trim()
  if (!t) {
    return {
      configured: false,
      meetings: [],
      message:
        'Manca CALENDLY_PERSONAL_ACCESS_TOKEN sul server. Aggiungilo in backend/.env (scope: users:read, scheduled_events:read).',
    }
  }

  try {
    return await fetchStaffScheduledMeetings(t)
  } catch (e) {
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
}

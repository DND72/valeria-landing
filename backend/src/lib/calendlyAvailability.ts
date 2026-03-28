/**
 * Legge da Calendly le user availability schedules (settimana / fasce orarie).
 * Richiede CALENDLY_PERSONAL_ACCESS_TOKEN con scope availability:read (e users:read).
 */

import { calendlyFetch } from './calendlyClient.js'

const WDAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const WDAY_IT: Record<(typeof WDAY_ORDER)[number], string> = {
  monday: 'Lunedì',
  tuesday: 'Martedì',
  wednesday: 'Mercoledì',
  thursday: 'Giovedì',
  friday: 'Venerdì',
  saturday: 'Sabato',
  sunday: 'Domenica',
}

type Interval = { from?: string; to?: string }

type RuleWday = {
  type?: string
  wday?: string
  intervals?: Interval[]
}

type RuleDate = {
  type?: string
  date?: string
  intervals?: Interval[]
}

type CalendlyScheduleResource = {
  name?: string
  timezone?: string
  rules?: Array<RuleWday | RuleDate>
}

function formatInterval(i: Interval): string {
  const a = (i.from ?? '').trim()
  const b = (i.to ?? '').trim()
  if (!a && !b) return '—'
  if (a && b) return `${a}–${b}`
  return a || b
}

function normalizeWday(w: string | undefined): (typeof WDAY_ORDER)[number] | null {
  if (!w) return null
  const x = w.toLowerCase() as (typeof WDAY_ORDER)[number]
  return WDAY_ORDER.includes(x) ? x : null
}

function buildWeekdayRows(rules: Array<RuleWday | RuleDate> | undefined) {
  const byDay = new Map<(typeof WDAY_ORDER)[number], string[]>()
  const exceptions: string[] = []

  for (const r of rules ?? []) {
    if (r.type === 'date' && 'date' in r) {
      const dr = r as RuleDate
      const parts = (dr.intervals ?? []).map(formatInterval).filter((s) => s !== '—')
      exceptions.push(
        parts.length ? `${dr.date ?? '?'}: ${parts.join(', ')}` : `${dr.date ?? '?'}`
      )
      continue
    }
    if (r.type === 'wday' || (r as RuleWday).wday) {
      const wr = r as RuleWday
      const d = normalizeWday(wr.wday)
      if (!d) continue
      const parts = (wr.intervals ?? []).map(formatInterval).filter((s) => s !== '—')
      if (!byDay.has(d)) byDay.set(d, [])
      if (parts.length) byDay.get(d)!.push(...parts)
    }
  }

  const weekdays = WDAY_ORDER.map((day) => ({
    key: day,
    label: WDAY_IT[day],
    intervals: byDay.has(day) ? byDay.get(day)! : [],
  }))

  return { weekdays, exceptions }
}

export type StaffAvailabilityDayRow = {
  key: string
  label: string
  intervals: string[]
}

export type StaffAvailabilitySchedule = {
  name: string
  timeZone: string | null
  weekdays: StaffAvailabilityDayRow[]
  exceptions: string[]
}

export type StaffAvailabilityResponse =
  | {
      configured: true
      userTimeZone: string | null
      schedules: StaffAvailabilitySchedule[]
    }
  | {
      configured: false
      userTimeZone: null
      schedules: []
      message: string
    }

export async function fetchStaffAvailabilitySummary(token: string): Promise<StaffAvailabilityResponse> {
  const me = (await calendlyFetch('/users/me', token)) as {
    resource?: { uri?: string; timezone?: string; current_organization?: string }
  }
  const userUri = me?.resource?.uri
  if (!userUri) {
    return {
      configured: false,
      userTimeZone: null,
      schedules: [],
      message: 'Risposta Calendly /users/me incompleta (manca uri utente).',
    }
  }

  const userTz = me.resource?.timezone ?? null
  const orgUri = me.resource?.current_organization
  const qs = new URLSearchParams()
  qs.set('user', userUri)
  if (orgUri) qs.set('organization', orgUri)

  const list = (await calendlyFetch(`/user_availability_schedules?${qs.toString()}`, token)) as {
    collection?: Array<{ resource?: CalendlyScheduleResource } & CalendlyScheduleResource>
  }

  const collection = (list.collection ?? []).map((item) => item.resource ?? item)
  const schedules: StaffAvailabilitySchedule[] = collection.map((sched) => {
    const { weekdays, exceptions } = buildWeekdayRows(sched.rules)
    return {
      name: (sched.name && String(sched.name).trim()) || 'Programma',
      timeZone: sched.timezone ?? null,
      weekdays,
      exceptions,
    }
  })

  return {
    configured: true,
    userTimeZone: userTz,
    schedules,
  }
}

export async function getStaffAvailabilityOrError(token: string | undefined): Promise<StaffAvailabilityResponse> {
  const t = token?.trim()
  if (!t) {
    return {
      configured: false,
      userTimeZone: null,
      schedules: [],
      message:
        'Manca CALENDLY_PERSONAL_ACCESS_TOKEN sul server. Aggiungilo in backend/.env (scope: users:read, availability:read).',
    }
  }

  try {
    return await fetchStaffAvailabilitySummary(t)
  } catch (e) {
    const status = (e as Error & { status?: number })?.status
    const body = (e as Error & { body?: { message?: string; title?: string } })?.body
    const hint =
      status === 403
        ? ' Verifica che il Personal Access Token includa lo scope availability:read.'
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
      userTimeZone: null,
      schedules: [],
      message: `Impossibile leggere le disponibilità da Calendly: ${msg}.${hint}`,
    }
  }
}

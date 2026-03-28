export type ValeriaPresenceStatus = 'online' | 'busy' | 'offline'

export const VALERIA_PRESENCE_LABELS: Record<ValeriaPresenceStatus, string> = {
  online: 'Online',
  busy: 'Occupata',
  offline: 'Offline',
}

export function labelForPresence(s: string | null | undefined): string {
  if (s === 'online' || s === 'busy' || s === 'offline') return VALERIA_PRESENCE_LABELS[s]
  return VALERIA_PRESENCE_LABELS.offline
}

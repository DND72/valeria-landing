/**
 * Utenti con publicMetadata impostato da Clerk Dashboard.
 * Esempio JSON su Public metadata: { "privileged": true }
 * oppure: { "skipPayment": true } oppure { "role": "staff" }
 */
export function isPrivilegedClerkUser(
  user: { publicMetadata?: Record<string, unknown> } | null | undefined
): boolean {
  if (!user?.publicMetadata || typeof user.publicMetadata !== 'object') return false
  const m = user.publicMetadata as Record<string, unknown>
  if (m.privileged === true) return true
  if (m.skipPayment === true) return true
  const role = m.role
  if (role === 'staff' || role === 'admin') return true
  return false
}

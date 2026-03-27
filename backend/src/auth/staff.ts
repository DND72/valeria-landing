/**
 * Allineato a src/lib/privilegedUser.ts nel frontend.
 */
export function isStaffFromPublicMetadata(
  publicMetadata: Record<string, unknown> | null | undefined
): boolean {
  if (!publicMetadata || typeof publicMetadata !== 'object') return false
  const m = publicMetadata as Record<string, unknown>
  if (m.privileged === true) return true
  if (m.skipPayment === true) return true
  const role = m.role
  if (role === 'staff' || role === 'admin') return true
  return false
}

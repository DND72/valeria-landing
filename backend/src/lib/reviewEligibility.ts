import type { Pool } from 'pg'
import { clerkClient } from '../middleware/clerkAuth.js'

export async function getPrimaryEmailNormalized(userId: string): Promise<string | null> {
  if (!clerkClient) return null
  try {
    const u = await clerkClient.users.getUser(userId)
    const primaryId = u.primaryEmailAddressId
    const emails = u.emailAddresses ?? []
    const primary =
      (primaryId && emails.find((e) => e.id === primaryId)?.emailAddress) || emails[0]?.emailAddress
    if (typeof primary === 'string' && primary.trim()) return primary.trim().toLowerCase()
  } catch {
    // ignore
  }
  return null
}

/** Almeno un consulto a pagamento completato (status done). */
export async function hasCompletedPaidConsult(
  pool: Pool,
  clerkUserId: string,
  emailNorm: string | null
): Promise<boolean> {
  const { rows } = await pool.query<{ ok: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM consults c
       WHERE (c.clerk_user_id = $1
         OR ($2::text IS NOT NULL AND c.invitee_email IS NOT NULL
             AND LOWER(TRIM(c.invitee_email)) = $2))
         AND c.is_free_consult = false
         AND c.status = 'done'
     ) AS ok`,
    [clerkUserId, emailNorm]
  )
  return Boolean(rows[0]?.ok)
}

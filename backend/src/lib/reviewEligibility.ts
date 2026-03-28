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

/** Consulti a pagamento con esito "done" (stesso criterio /api/me/consults). */
export async function countPaidDoneConsults(
  pool: Pool,
  clerkUserId: string,
  emailNorm: string | null
): Promise<number> {
  const { rows } = await pool.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n
     FROM consults c
     WHERE (c.clerk_user_id = $1
       OR ($2::text IS NOT NULL AND c.invitee_email IS NOT NULL
           AND LOWER(TRIM(c.invitee_email)) = $2))
       AND c.is_free_consult = false
       AND c.status = 'done'`,
    [clerkUserId, emailNorm]
  )
  return Number(rows[0]?.n ?? 0)
}

/**
 * Quante recensioni "cliente" può aver lasciato in base al percorso:
 * prima dopo il 3° consulto a pagamento completato, poi al massimo una ogni 2 consulti così.
 * Esempi: 3 consulti → 1 recensione; 5 → 2; 7 → 3 …
 */
export function maxClientReviewsAllowed(paidDoneCount: number): number {
  if (paidDoneCount < 3) return 0
  return 1 + Math.floor((paidDoneCount - 3) / 2)
}

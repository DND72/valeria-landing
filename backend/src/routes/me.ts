import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { clerkClient, requireClerkAuth } from '../middleware/clerkAuth.js'
import { registerMeBlogCommentRoutes } from './meBlogComments.js'
import { registerMeReviewRoutes } from './meReviews.js'

const taxCodeBody = z.object({
  firstName: z.string().min(1).max(200),
  lastName: z.string().min(1).max(200),
  codiceFiscale: z.string().min(11).max(16),
})

export function createMeRouter(pool: Pool): Router {
  const r = Router()
  r.use(requireClerkAuth)

  r.get('/consults', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    try {
      let emailNorm: string | null = null
      if (clerkClient) {
        try {
          const u = await clerkClient.users.getUser(userId)
          const primaryId = u.primaryEmailAddressId
          const emails = u.emailAddresses ?? []
          const primary =
            (primaryId && emails.find((e) => e.id === primaryId)?.emailAddress) || emails[0]?.emailAddress
          if (typeof primary === 'string' && primary.trim()) {
            emailNorm = primary.trim().toLowerCase()
          }
        } catch {
          // solo clerk_user_id
        }
      }

      const { rows } = await pool.query(
        `SELECT id, status, is_free_consult, meeting_join_url, meeting_provider,
                invitee_email, invitee_name, start_at, end_at, created_at, updated_at
         FROM consults
         WHERE clerk_user_id = $1
            OR ($2::text IS NOT NULL AND invitee_email IS NOT NULL
                AND LOWER(TRIM(invitee_email)) = $2)
         ORDER BY start_at DESC NULLS LAST, created_at DESC
         LIMIT 100`,
        [userId, emailNorm]
      )
      res.json({ consults: rows })
    } catch (e) {
      console.error('[me consults]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.get('/tax-reminder', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    try {
      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS c FROM consults
         WHERE clerk_user_id = $1 AND status = 'done' AND is_free_consult = false`,
        [userId]
      )
      const donePaid = countRes.rows[0]?.c ?? 0
      const profile = await pool.query(
        `SELECT codice_fiscale FROM client_billing_profiles WHERE clerk_user_id = $1`,
        [userId]
      )
      const cf = profile.rows[0]?.codice_fiscale
      const hasCf = typeof cf === 'string' && cf.trim().length > 0
      const showReminder = donePaid >= 3 && !hasCf
      res.json({
        showReminder,
        donePaidConsults: donePaid,
        hasCodiceFiscale: hasCf,
      })
    } catch (e) {
      console.error('[me tax-reminder]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.post('/tax-code', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    const parsed = taxCodeBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Dati non validi', details: parsed.error.flatten() })
      return
    }
    const { firstName, lastName, codiceFiscale } = parsed.data
    try {
      await pool.query(
        `INSERT INTO client_billing_profiles (clerk_user_id, first_name, last_name, codice_fiscale, updated_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (clerk_user_id) DO UPDATE SET
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           codice_fiscale = EXCLUDED.codice_fiscale,
           updated_at = now()`,
        [userId, firstName, lastName, codiceFiscale.trim().toUpperCase()]
      )
      res.status(200).json({ ok: true })
    } catch (e) {
      console.error('[me tax-code]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  registerMeReviewRoutes(r, pool)
  registerMeBlogCommentRoutes(r, pool)

  return r
}

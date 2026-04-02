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

  // -------------------------------------------------------------------------
  // POST /api/me/legal-declaration
  //
  // Registra l'autocertificazione legale sull'eta' maggiore.
  // Salva timestamp e IP per l'audit trail (tutela legale Valeria).
  // -------------------------------------------------------------------------
  r.post('/legal-declaration', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    const { declaredBirthday } = (req.body ?? {}) as { declaredBirthday?: string }
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      null

    try {
      // Salva il profilo con data di nascita dichiarata e timestamp accettazione
      await pool.query(
        `INSERT INTO client_billing_profiles (clerk_user_id, declared_birthday, legal_declaration_at, legal_declaration_ip, updated_at)
         VALUES ($1, $2::date, now(), $3, now())
         ON CONFLICT (clerk_user_id) DO UPDATE SET
           declared_birthday    = COALESCE($2::date, client_billing_profiles.declared_birthday),
           legal_declaration_at = now(),
           legal_declaration_ip = $3,
           updated_at           = now()`,
        [userId, declaredBirthday ?? null, ip]
      )

      // Registra nel log di audit
      let declaredAge: number | null = null
      if (declaredBirthday) {
        const bd = new Date(declaredBirthday)
        if (!isNaN(bd.getTime())) {
          const today = new Date()
          declaredAge = today.getFullYear() - bd.getFullYear()
          const m = today.getMonth() - bd.getMonth()
          if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) declaredAge--
        }
      }

      await pool.query(
        `INSERT INTO age_verifications
           (clerk_user_id, declared_birthday, declared_age, outcome, detail, ip_address)
         VALUES ($1, $2::date, $3, 'declaration_only', 'Autocertificazione art. 76 DPR 445/2000', $4)`,
        [userId, declaredBirthday ?? null, declaredAge, ip]
      )

      // Aggiorna Clerk publicMetadata con la data dichiarata
      if (clerkClient) {
        try {
          const u = await clerkClient.users.getUser(userId)
          const meta = (u.publicMetadata ?? {}) as Record<string, unknown>
          await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
              ...meta,
              legalDeclarationAt: new Date().toISOString(),
              ...(declaredBirthday ? { declaredBirthday } : {}),
            },
          })
        } catch {
          // Non bloccante
        }
      }

      res.json({ ok: true })
    } catch (e) {
      console.error('[me legal-declaration]', e)
      res.status(500).json({ error: 'Errore salvataggio dichiarazione' })
    }
  })

  // -------------------------------------------------------------------------
  // POST /api/me/legal-consent
  //
  // Registra l'accettazione esplicita dei Termini e della Privacy Policy.
  // -------------------------------------------------------------------------
  r.post('/legal-consent', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    const { version } = (req.body ?? {}) as { version?: string }
    const finalVersion = version || 'v1.0-2024-04'

    try {
      await pool.query(
        `INSERT INTO client_billing_profiles (clerk_user_id, legal_consent_timestamp, legal_consent_version, updated_at)
         VALUES ($1, now(), $2, now())
         ON CONFLICT (clerk_user_id) DO UPDATE SET
           legal_consent_timestamp = now(),
           legal_consent_version   = $2,
           updated_at             = now()`,
        [userId, finalVersion]
      )
      res.json({ ok: true })
    } catch (e) {
      console.error('[me legal-consent]', e)
      res.status(500).json({ error: 'Errore salvataggio consenso' })
    }
  })

  // -------------------------------------------------------------------------
  // GET /api/me/age-status
  //
  // Ritorna lo stato VM18 dell'utente autenticato.
  // Usato dalla Dashboard cliente e dal componente AgeGate.
  // -------------------------------------------------------------------------
  r.get('/age-status', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    try {
      const { rows } = await pool.query(
        `SELECT age_verified, age_verified_at, declared_birthday, legal_declaration_at
         FROM client_billing_profiles
         WHERE clerk_user_id = $1`,
        [userId]
      )
      const row = rows[0]
      res.json({
        ageVerified:          row?.age_verified          ?? false,
        ageVerifiedAt:        row?.age_verified_at       ?? null,
        declaredBirthday:     row?.declared_birthday     ?? null,
        legalDeclarationAt:   row?.legal_declaration_at   ?? null,
        hasLegalDeclaration:  !!(row?.legal_declaration_at),
        legalConsentTimestamp: row?.legal_consent_timestamp ?? null,
        legalConsentVersion:   row?.legal_consent_version   ?? null,
      })
    } catch (e) {
      console.error('[me age-status]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  registerMeReviewRoutes(r, pool)
  registerMeBlogCommentRoutes(r, pool)

  return r
}

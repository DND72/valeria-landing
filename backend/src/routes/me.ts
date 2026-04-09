import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { clerkClient, requireClerkAuth } from '../middleware/clerkAuth.js'
import { registerMeBlogCommentRoutes } from './meBlogComments.js'
import { registerMeReviewRoutes } from './meReviews.js'
import { calendlyPost } from '../lib/calendlyClient.js'

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
                invitee_email, invitee_name, start_at, end_at, created_at, updated_at,
                cost_credits, reschedule_count
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
        } catch { /* ... */ }
      }

      res.json({ ok: true })
    } catch (e) {
      console.error('[me legal-declaration]', e)
      res.status(500).json({ error: 'Errore salvataggio dichiarazione' })
    }
  })

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

  r.get('/age-status', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }
    try {
      let emailLower: string | null = null
      if (clerkClient) {
        try {
          const u = await clerkClient.users.getUser(userId)
          const primaryId = u.primaryEmailAddressId
          const emails = u.emailAddresses ?? []
          const primary = (primaryId && emails.find(e => e.id === primaryId)?.emailAddress) || emails[0]?.emailAddress
          if (primary) {
            emailLower = primary.trim().toLowerCase()
            await pool.query(
              `INSERT INTO client_billing_profiles (clerk_user_id, email_normalized, updated_at)
               VALUES ($1, $2, now())
               ON CONFLICT (clerk_user_id) DO UPDATE SET 
                  email_normalized = EXCLUDED.email_normalized,
                  updated_at = now()`,
              [userId, emailLower]
            )
          }
        } catch (err) {
          console.warn('[me age-status] sync email error:', err)
        }
      }

      const { rows } = await pool.query(
        `SELECT age_verified, age_verified_at, declared_birthday, legal_declaration_at,
                legal_consent_timestamp, legal_consent_version
         FROM client_billing_profiles
         WHERE clerk_user_id = $1`,
        [userId]
      )
      
      const bonusRes = await pool.query(
        `SELECT 
           COUNT(*) FILTER (WHERE calendly_event_name ILIKE '%7 min%') > 0 as has_used_7,
           COUNT(*) FILTER (WHERE calendly_event_name ILIKE '%conoscenza%' OR calendly_event_name ILIKE '%10 min%') > 0 as has_used_10
         FROM consults
         WHERE (clerk_user_id = $1 OR (invitee_email IS NOT NULL AND LOWER(TRIM(invitee_email)) = $2))
           AND status <> 'cancelled'`,
        [userId, emailLower]
      )
      const bonus = bonusRes.rows[0] || { has_used_7: false, has_used_10: false }

      const row = rows[0]
      res.json({
        ageVerified:          row?.age_verified          ?? false,
        ageVerifiedAt:        row?.age_verified_at       ?? null,
        declaredBirthday:     row?.declared_birthday     ?? null,
        legalDeclarationAt:   row?.legal_declaration_at   ?? null,
        hasLegalDeclaration:  !!(row?.legal_declaration_at),
        hasUsedFree7:         bonus.has_used_7,
        hasUsedIntro10:       bonus.has_used_10,
        legalConsentTimestamp: row?.legal_consent_timestamp ?? null,
        legalConsentVersion:   row?.legal_consent_version   ?? null,
      })
    } catch (e) {
      console.error('[me age-status]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.get('/profile', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }

    try {
      // 1. Dati da Clerk
      let clerkInfo = { firstName: '', lastName: '', birthday: '', email: '' }
      if (clerkClient) {
        try {
          const u = await clerkClient.users.getUser(userId)
          const primaryId = u.primaryEmailAddressId
          const emails = u.emailAddresses ?? []
          const primary = (primaryId && emails.find((e) => e.id === primaryId)?.emailAddress) || emails[0]?.emailAddress

          clerkInfo = { 
            firstName: u.firstName || '', 
            lastName: u.lastName || '',
            birthday: (u as any).birthday || '',
            email: primary?.trim().toLowerCase() || ''
          }
        } catch {}
      }

      // 2. Dati da Billing Profile
      const bpRes = await pool.query(
        `SELECT first_name, last_name, declared_birthday, birth_time, birth_city, codice_fiscale, gender, email_normalized 
         FROM client_billing_profiles WHERE clerk_user_id = $1`,
        [userId]
      )
      const bp = bpRes.rows[0]
      const email = bp?.email_normalized || clerkInfo.email

      // 3. Dati da Client Profile (Preferenze contatto)
      let cp = { contact_preference: 'none', phone_number: '' }
      if (email) {
        const cpRes = await pool.query(
          `SELECT contact_preference, phone_number FROM client_profiles WHERE email_normalized = $1`,
          [email]
        )
        if (cpRes.rows[0]) cp = cpRes.rows[0]
      }

      // 4. Fallback da Natal Charts
      const ncRes = await pool.query(
        `SELECT birth_date, birth_time, city, gender FROM natal_charts 
         WHERE clerk_user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      )
      const nc = ncRes.rows[0]

      res.json({
        firstName: bp?.first_name || clerkInfo.firstName,
        lastName: bp?.last_name || clerkInfo.lastName,
        birthDate: bp?.declared_birthday 
          ? new Date(bp.declared_birthday).toISOString().slice(0, 10) 
          : (clerkInfo.birthday || (nc?.birth_date ? new Date(nc.birth_date).toISOString().slice(0, 10) : null)),
        birthTime: bp?.birth_time || nc?.birth_time || null,
        birthCity: bp?.birth_city || nc?.city || null,
        taxId: bp?.codice_fiscale || null,
        gender: bp?.gender || nc?.gender || null,
        contactPreference: cp.contact_preference,
        phoneNumber: cp.phone_number
      })
    } catch (e) {
      console.error('[me profile]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.post('/profile', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }

    const schema = z.object({
      gender: z.enum(['M', 'F']).nullable().optional(),
      contactPreference: z.enum(['none', 'phone', 'meet', 'zoom']).optional(),
      phoneNumber: z.string().max(50).optional()
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Dati non validi', details: parsed.error.flatten() })
      return
    }

    const { gender, contactPreference, phoneNumber } = parsed.data

    try {
      // Per salvare in client_profiles (preferenze) ci serve l'email
      let email: string | null = null
      if (clerkClient) {
        try {
          const u = await clerkClient.users.getUser(userId)
          email = u.emailAddresses[0]?.emailAddress?.trim().toLowerCase() || null
        } catch {}
      }

      if (gender) {
        await pool.query(
          `INSERT INTO client_billing_profiles (clerk_user_id, gender, updated_at)
           VALUES ($1, $2, now())
           ON CONFLICT (clerk_user_id) DO UPDATE SET
             gender = EXCLUDED.gender,
             updated_at = now()`,
          [userId, gender]
        )
      }

      if (email && (contactPreference || phoneNumber !== undefined)) {
        // Recuperiamo i dati attuali per non sovrascrivere con null se non forniti
        const prevRes = await pool.query(
          `SELECT contact_preference, phone_number FROM client_profiles WHERE email_normalized = $1`,
          [email]
        )
        const prev = prevRes.rows[0]
        const finalCP = contactPreference || prev?.contact_preference || 'none'
        const finalPN = phoneNumber !== undefined ? phoneNumber : (prev?.phone_number || null)

        await pool.query(
          `INSERT INTO client_profiles (email_normalized, contact_preference, phone_number, updated_at)
           VALUES ($1, $2, $3, now())
           ON CONFLICT (email_normalized) DO UPDATE SET
             contact_preference = EXCLUDED.contact_preference,
             phone_number = EXCLUDED.phone_number,
             updated_at = now()`,
          [email, finalCP, finalPN]
        )
      }

      res.json({ ok: true })
    } catch (e) {
      console.error('[me POST profile]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  registerMeBlogCommentRoutes(r, pool)
  registerMeReviewRoutes(r, pool)

  r.post('/consults/:id/action', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }

    const { action } = req.body as { action?: string }
    if (action !== 'cancel' && action !== 'reschedule') {
      res.status(400).json({ error: 'Azione non valida' })
      return
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      const { rows } = await client.query(
        `SELECT clerk_user_id, status, calendly_invitee_uri, start_at, cost_credits, reschedule_count
         FROM consults WHERE id = $1 FOR UPDATE`,
        [req.params.id]
      )

      if (rows.length === 0) throw new Error('Consulto non trovato')
      const c = rows[0]
      if (c.clerk_user_id !== userId) throw new Error('Non autorizzato a modificare questo consulto')
      if (c.status === 'cancelled' || c.status === 'done') throw new Error('Consulto già chiuso o cancellato')
      if (!c.start_at) throw new Error('Appuntamento non ancora fissato sul calendario. Se vuoi disdirlo, basta chiudere e aspettare che il blocco da 60 minuti scada.')

      const startDates = new Date(c.start_at)
      const now = new Date()
      const diffMs = startDates.getTime() - now.getTime()
      
      // Se è in attesa (es. Chat Flash), permettiamo l'annullamento immediato ignorando il limite 24h
      if (c.status !== 'client_waiting' && diffMs < 24 * 60 * 60 * 1000) {
         throw new Error(`Mancano meno di 24 ore all'appuntamento: non è possibile modificarlo.`)
      }

      if (action === 'reschedule' && c.reschedule_count >= 1) {
         throw new Error('Hai già usufruito di uno spostamento per questo consulto in precedenza.')
      }

      // 1. Diciamo a Calendly di liberare lo slot di Valeria
      if (c.calendly_invitee_uri) {
         const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN
         if (token) {
           await calendlyPost(c.calendly_invitee_uri + '/cancellation', token, {
             reason: action === 'cancel' ? "Cancellato dal cliente via sito web." : "Il cliente ha disdetto per riprogrammare con i fondi restituiti."
           }).catch(err => console.error('[calendly cancel fail]', err))
         }
      }

      // 2. Restituiamo i crediti locked rendendoli available, pronti per un nuovo repick
      if (c.cost_credits > 0) {
        await client.query(
          `UPDATE wallets SET balance_locked = balance_locked - $1, balance_available = balance_available + $1, updated_at = now() WHERE clerk_user_id = $2`,
          [c.cost_credits, userId]
        )
        await client.query(
          `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'unlock_refund', $3)`,
          [userId, c.cost_credits, req.params.id]
        )
      }

      // 3. Modifichiamo consults
      if (action === 'reschedule') {
         await client.query(
           `UPDATE consults SET status = 'cancelled', reschedule_count = reschedule_count + 1, updated_at = now() WHERE id = $1`,
           [req.params.id]
         )
      } else {
         await client.query(
           `UPDATE consults SET status = 'cancelled', updated_at = now() WHERE id = $1`,
           [req.params.id]
         )
      }

      await client.query('COMMIT')
      res.json({ ok: true })
    } catch (e: any) {
      await client.query('ROLLBACK')
      console.error('[me action consult]', e)
      res.status(400).json({ error: e.message || 'Errore database' })
    } finally {
      client.release()
    }
  })

  r.get('/wallet-transactions', async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autenticato' })
      return
    }

    try {
      const { rows } = await pool.query(
        `SELECT id, amount, tx_type, reference_id, created_at
         FROM wallet_transactions
         WHERE clerk_user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId]
      )
      res.json({ transactions: rows })
    } catch (e) {
      console.error('[me wallet-transactions]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  return r
}

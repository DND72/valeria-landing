import type { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { clerkClient } from '../middleware/clerkAuth.js'

const profilePatch = z.object({
  email: z.string().min(3).max(320),
  generalNotes: z.string().max(50000).optional(),
  /** ISO 8601 o null per azzerare la data ultima fattura */
  lastInvoicedAt: z.union([z.string().datetime(), z.null()]).optional(),
  markInvoicedNow: z.boolean().optional(),
  manualBonusCredits: z.number().int().min(0).optional(),
  unlockReviewOverride: z.boolean().optional(),
})

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** True se last_invoiced_at cade nel mese solare corrente (Europe/Rome). */
function invoicedThisMonthRome(lastInvoicedAt: Date | null): boolean {
  if (!lastInvoicedAt) return false
  const inv = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(lastInvoicedAt)
  const now = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date())
  return inv.slice(0, 7) === now.slice(0, 7)
}

export function registerStaffClientRoutes(r: Router, pool: Pool): void {
  r.get('/clients', async (req, res) => {
    const sort = req.query.sort === 'recent' ? 'recent' : 'alpha'
    try {
      // --- 1. RECUPERO UTENTI DA CLERK ---
      let clerkDict = new Map<string, { firstName: string | null; lastName: string | null; lastSignInAt: number | null }>()
      if (clerkClient) {
        try {
          const clerkBatch = await clerkClient.users.getUserList({ limit: 499 })
          for (const u of clerkBatch.data) {
            const primaryId = u.primaryEmailAddressId
            const emails = u.emailAddresses ?? []
            const primary = (primaryId && emails.find((e) => e.id === primaryId)?.emailAddress) || emails[0]?.emailAddress
            if (typeof primary === 'string' && primary.trim()) {
              const norm = primary.trim().toLowerCase()
              clerkDict.set(norm, {
                firstName: u.firstName,
                lastName: u.lastName,
                lastSignInAt: u.lastSignInAt,
              })
            }
          }
        } catch (ce) {
          console.error('[clerk sync error]', ce)
        }
      }

      // --- 2. RECUPERO DATI DA DB (CONSULTI E BILLING) ---
      const { rows } = await pool.query<{
        email_norm: string
        name_any: string | null
        total_consults: string
        paid_consults: string
        free_consults: string
        last_scheduled: Date | null
        is_verified: boolean
      }>(
        `SELECT
            COALESCE(bp.email_normalized, LOWER(TRIM(c.invitee_email))) AS email_norm,
            COALESCE(MAX(bp.first_name || ' ' || bp.last_name), MAX(c.invitee_name)) AS name_any,
            COUNT(c.id)::text AS total_consults,
            SUM(CASE WHEN c.id IS NOT NULL AND NOT COALESCE(c.is_free_consult, false) THEN 1 ELSE 0 END)::text AS paid_consults,
            SUM(CASE WHEN c.id IS NOT NULL AND COALESCE(c.is_free_consult, false) THEN 1 ELSE 0 END)::text AS free_consults,
            MAX(c.start_at) AS last_scheduled,
            COALESCE(BOOL_OR(bp.age_verified), false) AS is_verified
          FROM client_billing_profiles bp
          FULL OUTER JOIN consults c ON LOWER(TRIM(c.invitee_email)) = bp.email_normalized
          GROUP BY 1`
      )

      const profiles = await pool.query<{
        email_normalized: string
        last_invoiced_at: Date | null
      }>(`SELECT email_normalized, last_invoiced_at FROM client_profiles`)

      const invMap = new Map<string, Date | null>()
      for (const p of profiles.rows) {
        invMap.set(p.email_normalized, p.last_invoiced_at)
      }

      type Row = {
        email: string
        name: string | null
        totalConsults: number
        paidConsults: number
        freeConsults: number
        lastScheduledAt: string | null
        lastInvoicedAt: string | null
        invoicedThisMonth: boolean
        isRegistered: boolean
        isVerified: boolean
        lastSignInAt: string | null
      }

      // --- 3. MERGE DATI ---
      // Partiamo dalle email trovate nel DB (che include chi ha consulti e chi è in billing_profiles)
      const dbEmails = new Set(rows.map(r => r.email_norm))
      
      const list: Row[] = rows.map((row) => {
        const email = row.email_norm
        const clerkInfo = clerkDict.get(email)
        const lastInv = invMap.get(email) ?? null
        const invoiced = invoicedThisMonthRome(lastInv)
        
        return {
          email,
          name: clerkInfo ? `${clerkInfo.firstName || ''} ${clerkInfo.lastName || ''}`.trim() || row.name_any : row.name_any,
          totalConsults: Number(row.total_consults),
          paidConsults: Number(row.paid_consults),
          freeConsults: Number(row.free_consults),
          lastScheduledAt: row.last_scheduled ? new Date(row.last_scheduled).toISOString() : null,
          lastInvoicedAt: lastInv ? new Date(lastInv).toISOString() : null,
          invoicedThisMonth: invoiced,
          isRegistered: !!clerkInfo,
          isVerified: row.is_verified || false,
          lastSignInAt: clerkInfo?.lastSignInAt ? new Date(clerkInfo.lastSignInAt).toISOString() : null,
        }
      })

      // Aggiungiamo eventuali utenti Clerk che NON sono ancora nel DB (0 consulti, mai entrati in dashboard)
      for (const [email, info] of clerkDict.entries()) {
        if (!dbEmails.has(email)) {
          list.push({
            email,
            name: `${info.firstName || ''} ${info.lastName || ''}`.trim() || 'Utente registrato',
            totalConsults: 0,
            paidConsults: 0,
            freeConsults: 0,
            lastScheduledAt: null,
            lastInvoicedAt: null,
            invoicedThisMonth: false,
            isRegistered: true,
            isVerified: false,
            lastSignInAt: info.lastSignInAt ? new Date(info.lastSignInAt).toISOString() : null,
          })
        }
      }

      if (sort === 'alpha') {
        list.sort((a, b) => a.email.localeCompare(b.email, 'it'))
      } else {
        list.sort((a, b) => {
          const ta = a.lastScheduledAt ? new Date(a.lastScheduledAt).getTime() : 0
          const tb = b.lastScheduledAt ? new Date(b.lastScheduledAt).getTime() : 0
          if (ta !== tb) return tb - ta
          // Se non ha consulti, ordina per registrazione
          const sa = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0
          const sb = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0
          return sb - sa
        })
      }

      res.json({ sort, clients: list })
    } catch (e) {
      console.error('[staff clients list]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.get('/clients/detail', async (req, res) => {
    const raw = req.query.email
    if (typeof raw !== 'string' || !raw.trim()) {
      res.status(400).json({ error: 'Parametro email mancante' })
      return
    }
    const email = normalizeEmail(raw)
    try {
      const { rows: consultRows } = await pool.query(
        `SELECT id, clerk_user_id, calendly_event_uri, status, is_free_consult,
                meeting_join_url, meeting_provider, invitee_email, invitee_name,
                start_at, end_at, created_at, updated_at
         FROM consults
         WHERE LOWER(TRIM(invitee_email)) = $1
         ORDER BY start_at DESC NULLS LAST, created_at DESC`,
        [email]
      )

      // Se non ci sono consulti, non è un errore, ma consultRows sarà []

      const ids = consultRows.map((c: { id: string }) => c.id)
      const { rows: noteRows } = await pool.query(
        `SELECT cn.id, cn.consult_id, cn.staff_clerk_user_id, cn.body, cn.created_at, cn.updated_at
         FROM consult_notes cn
         WHERE cn.consult_id = ANY($1::uuid[])
         ORDER BY cn.created_at ASC`,
        [ids]
      )

      const notesByConsult = new Map<string, typeof noteRows>()
      for (const n of noteRows) {
        const cid = n.consult_id as string
        if (!notesByConsult.has(cid)) notesByConsult.set(cid, [])
        notesByConsult.get(cid)!.push(n)
      }

      const prof = await pool.query(
        `SELECT email_normalized, general_notes, last_invoiced_at, updated_at, manual_bonus_credits, unlock_review_override
         FROM client_profiles WHERE email_normalized = $1`,
        [email]
      )
      const profile = prof.rows[0] ?? null

      // Cerchiamo il profilo specifico per questa email
      const bpLookup = await pool.query(
        `SELECT clerk_user_id, first_name, last_name, age_verified, age_verified_at, declared_birthday
         FROM client_billing_profiles
         WHERE email_normalized = $1 LIMIT 1`,
        [email]
      )
      const bp = bpLookup.rows[0]
      let ageVerified = bp?.age_verified ?? false
      let ageVerifiedAt: string | null = bp?.age_verified_at ? new Date(bp.age_verified_at).toISOString() : null
      let declaredBirthday: string | null = bp?.declared_birthday ? new Date(bp.declared_birthday).toISOString().slice(0, 10) : null
      let displayName = bp ? `${bp.first_name || ''} ${bp.last_name || ''}`.trim() : (consultRows[0]?.invitee_name ?? null)

      if (!bp && consultRows.length > 0) {
        // Se non abbiamo un profilo billing ma abbiamo consulti, proviamo a cercare via clerk_user_id dai consulti
        const clerkUserIds = [...new Set(
          consultRows
            .map((c: Record<string, unknown>) => c.clerk_user_id)
            .filter((id): id is string => typeof id === 'string' && id.length > 0)
        )]
        if (clerkUserIds.length > 0) {
          // ... (logica esistente di fallback se serve, ma il match email è primario ora)
        }
      }

      res.json({
        email,
        displayName: displayName || 'Cliente ospite',
        // Badge VM18
        ageVerified,
        ageVerifiedAt,
        declaredBirthday,
        profile: profile
          ? {
              generalNotes: profile.general_notes,
              lastInvoicedAt: profile.last_invoiced_at
                ? new Date(profile.last_invoiced_at).toISOString()
                : null,
              manualBonusCredits: profile.manual_bonus_credits ?? 0,
              unlockReviewOverride: profile.unlock_review_override ?? false,
              updatedAt: profile.updated_at ? new Date(profile.updated_at).toISOString() : null,
            }
          : null,
        consults: consultRows.map((c: Record<string, unknown>) => ({
          ...c,
          start_at: c.start_at ? new Date(c.start_at as string).toISOString() : null,
          end_at: c.end_at ? new Date(c.end_at as string).toISOString() : null,
          created_at: new Date(c.created_at as string).toISOString(),
          updated_at: new Date(c.updated_at as string).toISOString(),
          notes: notesByConsult.get(c.id as string) ?? [],
        })),
      })
    } catch (e) {
      console.error('[staff clients detail]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.patch('/clients/profile', async (req, res) => {
    const parsed = profilePatch.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }
    const { email, generalNotes, lastInvoicedAt, markInvoicedNow, manualBonusCredits, unlockReviewOverride } = parsed.data
    const norm = normalizeEmail(email)

    if (
      generalNotes === undefined &&
      lastInvoicedAt === undefined &&
      !markInvoicedNow &&
      manualBonusCredits === undefined &&
      unlockReviewOverride === undefined
    ) {
      res.status(400).json({ error: 'Specifica un campo da modificare' })
      return
    }

    try {
      // Sbloccato: permettiamo di creare profili anche se non ci sono consulti (CRM puro)
      const exists = await pool.query(
        `SELECT 1 FROM consults WHERE LOWER(TRIM(invitee_email)) = $1 
         UNION 
         SELECT 1 FROM client_billing_profiles WHERE email_normalized = $1 LIMIT 1`, 
        [norm]
      )
      if (exists.rows.length === 0) {
        res.status(404).json({ error: 'Nessun utente o consulto per questa email.' })
        return
      }

      const prev = await pool.query(
        `SELECT general_notes, last_invoiced_at, manual_bonus_credits, unlock_review_override FROM client_profiles WHERE email_normalized = $1`,
        [norm]
      )
      
      let notes = prev.rows[0]?.general_notes ?? null
      if (generalNotes !== undefined) notes = generalNotes

      let lastInv: Date | null = prev.rows[0]?.last_invoiced_at ?? null
      if (markInvoicedNow) lastInv = new Date()
      else if (lastInvoicedAt !== undefined) lastInv = lastInvoicedAt === null ? null : new Date(lastInvoicedAt)

      let bonus = prev.rows[0]?.manual_bonus_credits ?? 0
      if (manualBonusCredits !== undefined) bonus = manualBonusCredits

      let uRev = prev.rows[0]?.unlock_review_override ?? false
      if (unlockReviewOverride !== undefined) uRev = unlockReviewOverride

      await pool.query(
        `INSERT INTO client_profiles (email_normalized, general_notes, last_invoiced_at, manual_bonus_credits, unlock_review_override, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (email_normalized) DO UPDATE SET
           general_notes = EXCLUDED.general_notes,
           last_invoiced_at = EXCLUDED.last_invoiced_at,
           manual_bonus_credits = EXCLUDED.manual_bonus_credits,
           unlock_review_override = EXCLUDED.unlock_review_override,
           updated_at = now()`,
        [norm, notes, lastInv, bonus, uRev]
      )

      const row = await pool.query(
        `SELECT email_normalized, general_notes, last_invoiced_at, manual_bonus_credits, unlock_review_override, updated_at
         FROM client_profiles WHERE email_normalized = $1`,
        [norm]
      )
      const p = row.rows[0]!
      res.json({
        email: norm,
        profile: {
          generalNotes: p.general_notes,
          lastInvoicedAt: p.last_invoiced_at ? new Date(p.last_invoiced_at).toISOString() : null,
          manualBonusCredits: p.manual_bonus_credits,
          unlockReviewOverride: p.unlock_review_override,
          updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : null,
        },
      })
    } catch (e) {
      console.error('[staff clients profile patch]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })
}

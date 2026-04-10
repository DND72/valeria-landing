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
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  declaredBirthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  taxId: z.string().max(50).optional(),
  contactPreference: z.enum(['none', 'phone', 'meet', 'zoom']).optional(),
  phoneNumber: z.string().max(50).optional(),
  contactDetails: z.string().max(1000).optional(),
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
      let clerkDict = new Map<string, { firstName: string | null; lastName: string | null; username: string | null; lastSignInAt: number | null; clerkId: string; email: string | null }>()
      if (clerkClient) {
        try {
          const clerkBatch = await clerkClient.users.getUserList({ limit: 499 })
          for (const u of clerkBatch.data) {
            const primaryId = u.primaryEmailAddressId
            const emails = u.emailAddresses ?? []
            const primary = (primaryId && emails.find((e) => e.id === primaryId)?.emailAddress) || emails[0]?.emailAddress
            const norm = primary ? primary.trim().toLowerCase() : null
            
            clerkDict.set(u.id, {
              firstName: u.firstName,
              lastName: u.lastName,
              username: u.username,
              lastSignInAt: u.lastSignInAt,
              clerkId: u.id,
              email: norm
            })
          }
        } catch (ce) {
          console.error('[clerk sync error]', ce)
        }
      }

      // --- 2. RECUPERO DATI DA DB (CONSULTI E BILLING) ---
      const { rows } = await pool.query<{
        clerk_user_id: string | null
        email_norm: string | null
        name_any: string | null
        total_consults: string
        paid_consults: string
        free_consults: string
        last_scheduled: Date | null
        is_verified: boolean
        latest_chart_id: string | null
      }>(
        `WITH raw_identities AS (
            SELECT clerk_user_id, LOWER(TRIM(invitee_email)) as email_norm FROM consults
            UNION
            SELECT clerk_user_id, email_normalized as email_norm FROM client_billing_profiles
            UNION
            SELECT clerk_user_id, NULL as email_norm FROM natal_charts WHERE clerk_user_id IS NOT NULL
        ),
        consolidated_ids AS (
            SELECT 
                clerk_user_id, 
                MAX(email_norm) as email_norm 
            FROM raw_identities 
            WHERE clerk_user_id IS NOT NULL 
            GROUP BY clerk_user_id
            UNION
            SELECT 
                NULL as clerk_user_id, 
                email_norm
            FROM raw_identities
            WHERE email_norm IS NOT NULL 
              AND email_norm NOT IN (SELECT email_norm FROM raw_identities WHERE clerk_user_id IS NOT NULL AND email_norm IS NOT NULL)
            GROUP BY email_norm
        )
        SELECT 
            ids.clerk_user_id,
            ids.email_norm,
            COALESCE(MAX(bp.first_name || ' ' || bp.last_name), MAX(c.invitee_name), MAX(ids.email_norm)) AS name_any,
            COUNT(DISTINCT c.id)::text AS total_consults,
            COUNT(DISTINCT CASE WHEN c.id IS NOT NULL AND NOT COALESCE(c.is_free_consult, false) THEN c.id END)::text AS paid_consults,
            COUNT(DISTINCT CASE WHEN c.id IS NOT NULL AND COALESCE(c.is_free_consult, false) THEN c.id END)::text AS free_consults,
            MAX(c.start_at) AS last_scheduled,
            COALESCE(BOOL_OR(bp.age_verified), false) AS is_verified,
            (SELECT id FROM natal_charts WHERE clerk_user_id = ids.clerk_user_id ORDER BY created_at DESC LIMIT 1) AS latest_chart_id
        FROM consolidated_ids ids
        LEFT JOIN consults c ON (
            (ids.clerk_user_id IS NOT NULL AND c.clerk_user_id = ids.clerk_user_id) OR 
            (ids.clerk_user_id IS NULL AND ids.email_norm IS NOT NULL AND LOWER(TRIM(c.invitee_email)) = ids.email_norm)
        )
        LEFT JOIN client_billing_profiles bp ON (
            (ids.clerk_user_id IS NOT NULL AND bp.clerk_user_id = ids.clerk_user_id) OR 
            (ids.clerk_user_id IS NULL AND ids.email_norm IS NOT NULL AND bp.email_normalized = ids.email_norm)
        )
        GROUP BY ids.clerk_user_id, ids.email_norm`
      )

      const profiles = await pool.query<{ email_normalized: string; last_invoiced_at: Date | null }>(`SELECT email_normalized, last_invoiced_at FROM client_profiles`)
      const invMap = new Map<string, Date | null>()
      for (const p of profiles.rows) invMap.set(p.email_normalized, p.last_invoiced_at)

      const walletsRows = await pool.query<{ clerk_user_id: string; balance_available: number; balance_locked: number }>(`SELECT clerk_user_id, balance_available, balance_locked FROM wallets`)
      const walletsMap = new Map<string, { balance: number; lockedBalance: number }>()
      for (const w of walletsRows.rows) walletsMap.set(w.clerk_user_id, { balance: Number(w.balance_available), lockedBalance: Number(w.balance_locked) })

      const aggregated = new Map<string, any>()
      const dbClerkIds = new Set(rows.map(r => r.clerk_user_id).filter(Boolean) as string[])

      for (const row of rows) {
        const email = row.email_norm ? normalizeEmail(row.email_norm) : null
        const cId = row.clerk_user_id
        let clerkInfo = cId ? clerkDict.get(cId) : null
        if (!clerkInfo && email) {
          for (const info of clerkDict.values()) {
            if (info.email === email) { clerkInfo = info; break }
          }
        }
        const lastInv = email ? (invMap.get(email) ?? null) : null
        const finalClerkId = cId || clerkInfo?.clerkId || null
        const finalEmail = email || clerkInfo?.email || null
        const entry = {
          clerkId: finalClerkId,
          email: finalEmail,
          username: clerkInfo?.username || null,
          name: clerkInfo ? `${clerkInfo.firstName || ''} ${clerkInfo.lastName || ''}`.trim() || row.name_any : row.name_any,
          totalConsults: Number(row.total_consults),
          paidConsults: Number(row.paid_consults),
          freeConsults: Number(row.free_consults),
          lastScheduledAt: row.last_scheduled ? new Date(row.last_scheduled).toISOString() : null,
          lastInvoicedAt: lastInv ? new Date(lastInv).toISOString() : null,
          invoicedThisMonth: invoicedThisMonthRome(lastInv),
          isRegistered: !!clerkInfo,
          isVerified: row.is_verified || false,
          lastSignInAt: clerkInfo?.lastSignInAt ? new Date(clerkInfo.lastSignInAt).toISOString() : null,
          balance: finalClerkId ? (walletsMap.get(finalClerkId)?.balance ?? null) : null,
          lockedBalance: finalClerkId ? (walletsMap.get(finalClerkId)?.lockedBalance ?? null) : null,
          latestChartId: (row as any).latest_chart_id || null
        }
        if (finalEmail && aggregated.has(finalEmail)) {
          const prev = aggregated.get(finalEmail)!
          aggregated.set(finalEmail, { ...prev, ...entry, totalConsults: entry.totalConsults + prev.totalConsults })
        } else {
          if (finalEmail) aggregated.set(finalEmail, entry)
          else if (finalClerkId) aggregated.set(`id-${finalClerkId}`, entry)
        }
      }

      for (const [cId, info] of clerkDict.entries()) {
        const norm = info.email ? normalizeEmail(info.email) : null
        if (norm && aggregated.has(norm)) continue
        if (!dbClerkIds.has(cId)) {
          const entry = {
            clerkId: cId, email: info.email, username: info.username || null,
            name: `${info.firstName || ''} ${info.lastName || ''}`.trim() || 'Utente registrato',
            totalConsults: 0, paidConsults: 0, freeConsults: 0, lastScheduledAt: null, lastInvoicedAt: null, invoicedThisMonth: false,
            isRegistered: true, isVerified: false, lastSignInAt: info.lastSignInAt ? new Date(info.lastSignInAt).toISOString() : null,
            balance: walletsMap.get(info.clerkId)?.balance ?? null, lockedBalance: walletsMap.get(info.clerkId)?.lockedBalance ?? null,
            latestChartId: null
          }
          if (info.email) aggregated.set(normalizeEmail(info.email), entry)
          else aggregated.set(`id-${cId}`, entry)
        }
      }

      const list = Array.from(aggregated.values())
      if (sort === 'alpha') list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'it'))
      else list.sort((a, b) => (b.lastScheduledAt ? new Date(b.lastScheduledAt).getTime() : 0) - (a.lastScheduledAt ? new Date(a.lastScheduledAt).getTime() : 0))
      res.json({ sort, clients: list })
    } catch (e) {
      console.error('[staff clients list]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })

  r.get('/clients/detail', async (req, res) => {
    const rawEmail = req.query.email
    const rawClerkId = req.query.clerkId
    const email = rawEmail ? normalizeEmail(rawEmail as string) : null
    const clerkId = rawClerkId as string || null
    try {
      let consultResult: any;
      if (email) {
        consultResult = await pool.query(
          `SELECT c.id, c.clerk_user_id, c.status, c.is_free_consult, c.invitee_email, c.invitee_name, 
                  c.start_at, c.end_at, c.created_at, c.updated_at, c.cost_credits, c.status_billing, 
                  c.consult_kind, c.valeria_typing_seconds, c.client_typing_seconds,
                  r.rating as review_rating, r.title as review_title, r.status as review_status
           FROM consults c
           LEFT JOIN site_reviews r ON c.id = r.consult_id
           WHERE LOWER(TRIM(c.invitee_email)) = $1 
           ORDER BY c.start_at DESC`, 
          [email]
        )
      } else {
        consultResult = await pool.query(
          `SELECT c.id, c.clerk_user_id, c.status, c.is_free_consult, c.invitee_email, c.invitee_name, 
                  c.start_at, c.end_at, c.created_at, c.updated_at, c.cost_credits, c.status_billing, 
                  c.consult_kind, c.valeria_typing_seconds, c.client_typing_seconds,
                  r.rating as review_rating, r.title as review_title, r.status as review_status
           FROM consults c
           LEFT JOIN site_reviews r ON c.id = r.consult_id
           WHERE c.clerk_user_id = $1 
           ORDER BY c.start_at DESC`, 
          [clerkId]
        )
      }
      const consultRows = consultResult.rows;
      const ids = consultRows.map((c: any) => c.id)
      const { rows: noteRows } = await pool.query(
        `SELECT cn.id, cn.consult_id, cn.staff_clerk_user_id, cn.body, cn.created_at, cn.updated_at 
         FROM consult_notes cn 
         WHERE cn.consult_id = ANY($1::uuid[]) 
         ORDER BY cn.created_at ASC`, 
        [ids]
      )
      const notesByConsult = new Map<string, any[]>()
      for (const n of noteRows) { 
        if (!notesByConsult.has(n.consult_id)) notesByConsult.set(n.consult_id, []); 
        notesByConsult.get(n.consult_id)!.push(n) 
      }

      let profile: any = null;
      if (email) profile = (await pool.query(`SELECT email_normalized, general_notes, last_invoiced_at, updated_at, manual_bonus_credits, unlock_review_override, contact_preference, phone_number, contact_details FROM client_profiles WHERE email_normalized = $1`, [email])).rows[0] || null

      let bpResult: any;
      if (clerkId) bpResult = await pool.query(`SELECT clerk_user_id, first_name, last_name, age_verified, age_verified_at, declared_birthday, birth_time, birth_city, codice_fiscale FROM client_billing_profiles WHERE clerk_user_id = $1 LIMIT 1`, [clerkId])
      else bpResult = await pool.query(`SELECT clerk_user_id, first_name, last_name, age_verified, age_verified_at, declared_birthday, birth_time, birth_city, codice_fiscale FROM client_billing_profiles WHERE email_normalized = $1 LIMIT 1`, [email])
      const bp = bpResult.rows[0]; let clrkIdToUse = bp?.clerk_user_id || (consultRows[0]?.clerk_user_id) || null
      if (!clrkIdToUse && email && clerkClient) { const u = await clerkClient.users.getUserList({ emailAddress: [email], limit: 1 }); if (u.data.length > 0) clrkIdToUse = u.data[0].id }
      
      let firstName = bp?.first_name || null; let lastName = bp?.last_name || null; let declaredBirthday = bp?.declared_birthday ? new Date(bp.declared_birthday).toISOString().slice(0, 10) : null
      if (clrkIdToUse && clerkClient) { const cu = await clerkClient.users.getUser(clrkIdToUse); if (!firstName) firstName = cu.firstName; if (!lastName) lastName = cu.lastName; if (!declaredBirthday && (cu as any).birthday) declaredBirthday = (cu as any).birthday }

      let txs: any[] = []
      if (clrkIdToUse) txs = (await pool.query(`SELECT id, amount, tx_type, reference_id, created_at FROM wallet_transactions WHERE clerk_user_id = $1 ORDER BY created_at DESC LIMIT 100`, [clrkIdToUse])).rows.map(t => ({ ...t, amount: Number(t.amount) }))

      res.json({ email, displayName: `${firstName || ''} ${lastName || ''}`.trim() || consultRows[0]?.invitee_name || 'Ospite', firstName, lastName, taxId: bp?.codice_fiscale, ageVerified: bp?.age_verified, declaredBirthday, birthTime: bp?.birth_time, birthCity: bp?.birth_city, profile, consults: consultRows.map((c: any) => ({ ...c, notes: notesByConsult.get(c.id) || [] })), wallet: clrkIdToUse ? (await pool.query(`SELECT balance_available, balance_locked FROM wallets WHERE clerk_user_id = $1`, [clrkIdToUse])).rows[0] || null : null, transactions: txs })
    } catch (e) { console.error('[staff detail]', e); res.status(500).json({ error: 'Errore' }) }
  })

  r.patch('/clients/profile', async (req, res) => {
    const parsed = profilePatch.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: 'Invalid' })
    const { email, generalNotes, markInvoicedNow, manualBonusCredits, firstName, lastName, declaredBirthday, taxId } = parsed.data
    const norm = normalizeEmail(email)
    try {
      await pool.query(`INSERT INTO client_profiles (email_normalized, general_notes, last_invoiced_at, manual_bonus_credits, updated_at) VALUES ($1, $2, $3, $4, now()) ON CONFLICT (email_normalized) DO UPDATE SET general_notes = EXCLUDED.general_notes, last_invoiced_at = EXCLUDED.last_invoiced_at, manual_bonus_credits = EXCLUDED.manual_bonus_credits, updated_at = now()`, [norm, generalNotes, markInvoicedNow ? new Date() : undefined, manualBonusCredits])
      if (firstName || lastName || declaredBirthday || taxId) await pool.query(`INSERT INTO client_billing_profiles (clerk_user_id, email_normalized, first_name, last_name, declared_birthday, codice_fiscale, updated_at) VALUES ($1, $2, $3, $4, $5, $6, now()) ON CONFLICT (email_normalized) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, declared_birthday = EXCLUDED.declared_birthday, codice_fiscale = EXCLUDED.codice_fiscale, updated_at = now()`, [`staff-manual-${norm}`, norm, firstName, lastName, declaredBirthday, taxId])
      res.json({ ok: true })
    } catch (e) { res.status(500).json({ error: 'Errore' }) }
  })

  r.post('/clients/bonus', async (req, res) => {
    const parsed = z.object({ email: z.string(), amount: z.number().int().min(1), label_override: z.string().optional() }).safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid' })
    const { email, amount, label_override } = parsed.data
    const norm = normalizeEmail(email); const finalLabel = label_override || 'Staff Bonus'
    try {
      const bp = await pool.query(`SELECT clerk_user_id FROM client_billing_profiles WHERE email_normalized = $1 LIMIT 1`, [norm])
      let cid = bp.rows[0]?.clerk_user_id
      if ((!cid || cid.startsWith('staff-manual-')) && clerkClient) { const clu = await clerkClient.users.getUserList({ emailAddress: [norm], limit: 1 }); if (clu.data.length > 0) cid = clu.data[0].id }
      if (!cid || cid.startsWith('staff-manual-')) return res.status(404).json({ error: 'Utente non trovato' })
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query(`INSERT INTO wallets (clerk_user_id, balance_available, balance_locked) VALUES ($1, $2, 0) ON CONFLICT (clerk_user_id) DO UPDATE SET balance_available = wallets.balance_available + $2, updated_at = now()`, [cid, amount])
        await client.query(`INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'bonus', $3)`, [cid, amount, finalLabel])
        await client.query('COMMIT'); res.json({ success: true })
      } catch (err) { await client.query('ROLLBACK'); throw err } finally { client.release() }
    } catch (e) { res.status(500).json({ error: 'Errore' }) }
  })
}

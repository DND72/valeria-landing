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
        `WITH identities AS (
            SELECT clerk_user_id, LOWER(TRIM(invitee_email)) as email_norm FROM consults
            UNION
            SELECT clerk_user_id, email_normalized as email_norm FROM client_billing_profiles
            UNION
            SELECT clerk_user_id, NULL as email_norm FROM natal_charts WHERE clerk_user_id IS NOT NULL
        )
        SELECT 
            ids.clerk_user_id,
            ids.email_norm,
            COALESCE(MAX(bp.first_name || ' ' || bp.last_name), MAX(c.invitee_name)) AS name_any,
            COUNT(DISTINCT c.id)::text AS total_consults,
            COUNT(DISTINCT CASE WHEN c.id IS NOT NULL AND NOT COALESCE(c.is_free_consult, false) THEN c.id END)::text AS paid_consults,
            COUNT(DISTINCT CASE WHEN c.id IS NOT NULL AND COALESCE(c.is_free_consult, false) THEN c.id END)::text AS free_consults,
            MAX(c.start_at) AS last_scheduled,
            COALESCE(BOOL_OR(bp.age_verified), false) AS is_verified,
            (SELECT id FROM natal_charts WHERE clerk_user_id = ids.clerk_user_id ORDER BY created_at DESC LIMIT 1) AS latest_chart_id
        FROM identities ids
        LEFT JOIN consults c ON (c.clerk_user_id = ids.clerk_user_id OR (ids.email_norm IS NOT NULL AND LOWER(TRIM(c.invitee_email)) = ids.email_norm))
        LEFT JOIN client_billing_profiles bp ON (bp.clerk_user_id = ids.clerk_user_id OR (ids.email_norm IS NOT NULL AND bp.email_normalized = ids.email_norm))
        GROUP BY 1, 2`
      )

      const profiles = await pool.query<{
        email_normalized: string
        last_invoiced_at: Date | null
      }>(`SELECT email_normalized, last_invoiced_at FROM client_profiles`)

      const invMap = new Map<string, Date | null>()
      for (const p of profiles.rows) {
        invMap.set(p.email_normalized, p.last_invoiced_at)
      }

      const walletsRows = await pool.query<{ clerk_user_id: string; balance_available: number; balance_locked: number }>(
        `SELECT clerk_user_id, balance_available, balance_locked FROM wallets`
      )
      const walletsMap = new Map<string, { balance: number; lockedBalance: number }>()
      for (const w of walletsRows.rows) {
        walletsMap.set(w.clerk_user_id, { balance: Number(w.balance_available), lockedBalance: Number(w.balance_locked) })
      }

      type Row = {
        clerkId: string | null
        email: string | null
        username: string | null
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
        balance: number | null
        lockedBalance: number | null
        latestChartId: string | null
      }

      // --- 3. MERGE DATI ---
      // Partiamo dalle email e clerkId trovati nel DB
      const dbClerkIds = new Set(rows.map(r => r.clerk_user_id).filter(Boolean) as string[])
      
      const list: Row[] = rows.map((row) => {
        const cId = row.clerk_user_id
        const email = row.email_norm
        
        // Cerchiamo le info di Clerk via ID (priorità) o via email
        let clerkInfo = cId ? clerkDict.get(cId) : null
        if (!clerkInfo && email) {
          // Fallback: se avevamo solo l'email (vecchio clienteguest), 
          // proviamo a vedere se in clerkDict c'è qualcuno con quell'email
          for (const info of clerkDict.values()) {
            if (info.email === email) {
              clerkInfo = info
              break
            }
          }
        }

        const lastInv = email ? (invMap.get(email) ?? null) : null
        const invoiced = invoicedThisMonthRome(lastInv)
        const finalClerkId = cId || clerkInfo?.clerkId || null
        
        return {
          clerkId: finalClerkId,
          email,
          username: clerkInfo?.username || null,
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
          balance: finalClerkId ? (walletsMap.get(finalClerkId)?.balance ?? null) : null,
          lockedBalance: finalClerkId ? (walletsMap.get(finalClerkId)?.lockedBalance ?? null) : null,
          latestChartId: (row as any).latest_chart_id || null
        }
      })

      // Aggiungiamo eventuali utenti Clerk che NON sono ancora nel DB (0 consulti, mai entrati in dashboard)
      for (const [cId, info] of clerkDict.entries()) {
        if (!dbClerkIds.has(cId)) {
          list.push({
            clerkId: cId,
            email: info.email,
            username: info.username || null,
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
            balance: walletsMap.get(info.clerkId)?.balance ?? null,
            lockedBalance: walletsMap.get(info.clerkId)?.lockedBalance ?? null,
            latestChartId: null
          })
        }
      }

      if (sort === 'alpha') {
        list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'it'))
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
    const rawEmail = req.query.email
    const rawClerkId = req.query.clerkId
    
    if ((typeof rawEmail !== 'string' || !rawEmail.trim()) && (typeof rawClerkId !== 'string' || !rawClerkId.trim())) {
      res.status(400).json({ error: 'Specifica un parametro email o clerkId' })
      return
    }

    const email = rawEmail ? normalizeEmail(rawEmail as string) : null
    const clerkId = rawClerkId as string || null

    try {
      // 1. Cerchiamo i consulti via email o via clerkId
      let consultResult: any;
      if (email) {
        consultResult = await pool.query(
          `SELECT id, clerk_user_id, status, is_free_consult, invitee_email, invitee_name, start_at, end_at, created_at, updated_at
           FROM consults WHERE LOWER(TRIM(invitee_email)) = $1 ORDER BY start_at DESC`,
          [email]
        )
      } else {
        consultResult = await pool.query(
          `SELECT id, clerk_user_id, status, is_free_consult, invitee_email, invitee_name, start_at, end_at, created_at, updated_at
           FROM consults WHERE clerk_user_id = $1 ORDER BY start_at DESC`,
          [clerkId]
        )
      }
      const consultRows = consultResult.rows;

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

      let profile: any = null;
      if (email) {
        const profRes = await pool.query(
          `SELECT email_normalized, general_notes, last_invoiced_at, updated_at, manual_bonus_credits, unlock_review_override
           FROM client_profiles WHERE email_normalized = $1`,
          [email]
        )
        profile = profRes.rows[0] || null
      }

      // Cerchiamo il profilo billing via email o via clerkId (che è UNIQUE)
      let bpResult: any;
      if (clerkId) {
        bpResult = await pool.query(
          `SELECT clerk_user_id, first_name, last_name, age_verified, age_verified_at, declared_birthday, birth_time, birth_city, codice_fiscale
           FROM client_billing_profiles WHERE clerk_user_id = $1 LIMIT 1`,
          [clerkId]
        )
      } else {
        bpResult = await pool.query(
          `SELECT clerk_user_id, first_name, last_name, age_verified, age_verified_at, declared_birthday, birth_time, birth_city, codice_fiscale
           FROM client_billing_profiles WHERE email_normalized = $1 LIMIT 1`,
          [email]
        )
      }
      const bp = bpResult.rows[0]
      let ageVerified = bp?.age_verified ?? false
      let ageVerifiedAt: string | null = bp?.age_verified_at ? new Date(bp.age_verified_at).toISOString() : null
      let declaredBirthday: string | null = bp?.declared_birthday ? new Date(bp.declared_birthday).toISOString().slice(0, 10) : null
      let birthTime: string | null = bp?.birth_time || null;
      let birthCity: string | null = bp?.birth_city || null;
      let firstName = bp?.first_name ?? null
      let lastName = bp?.last_name ?? null
      let taxId = bp?.codice_fiscale ?? null

      let clrkIdToUse: string | null = bp?.clerk_user_id ?? null
      if (!clrkIdToUse) {
        const consultClerkIds = consultRows.map((c: { clerk_user_id?: string }) => c.clerk_user_id).filter(Boolean) as string[]
        if (consultClerkIds.length > 0) clrkIdToUse = consultClerkIds[0]
      }
      // Se abbiamo ancora email ma non clerkId, proviamo a cercarlo via email in Clerk (opzionale, ma utile)
      if (!clrkIdToUse && email && clerkClient) {
        try {
          const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [email], limit: 1 })
          if (clerkUsers.data.length > 0) clrkIdToUse = clerkUsers.data[0].id
        } catch (ce) { console.error('[clerk search email error]', ce) }
      }

      // --- NUOVA LOGICA: Se mancano i nomi o la data di nascita, li cerchiamo in Clerk ---
      if (clrkIdToUse && clerkClient) {
        try {
          const u = await clerkClient.users.getUser(clrkIdToUse)
          if (!firstName) firstName = u.firstName || null
          if (!lastName) lastName = u.lastName || null
          // Fallback per la data di nascita da Clerk se non impostata nel DB
          if (!declaredBirthday && (u as any).birthday) {
            declaredBirthday = (u as any).birthday // Clerk format is YYYY-MM-DD
          }
        } catch (ce) {
          console.error('[clerk fetch detail error]', ce)
        }
      }

      let displayName = (firstName || lastName) 
        ? `${firstName || ''} ${lastName || ''}`.trim() 
        : (consultRows[0]?.invitee_name ?? null)

      // --- NUOVA LOGICA FALLBACK: Se mancano i dati nel profilo, li cerchiamo nell'ultimo tema natale ---
      if (!declaredBirthday || !birthTime || !birthCity) {
        if (clrkIdToUse) {
          const lastChart = await pool.query(
            `SELECT birth_date, birth_time, city FROM natal_charts WHERE clerk_user_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [clrkIdToUse]
          )
          if (lastChart.rows.length > 0) {
            const lc = lastChart.rows[0];
            if (!declaredBirthday) declaredBirthday = lc.birth_date ? new Date(lc.birth_date).toISOString().slice(0, 10) : null;
            if (!birthTime) birthTime = lc.birth_time || null;
            if (!birthCity) birthCity = lc.city || null;
          }
        }
      }
      
      let walletInfo: { balance: number; lockedBalance: number } | null = null
      if (clrkIdToUse && !clrkIdToUse.startsWith('staff-manual-')) {
        const wRes = await pool.query(`SELECT balance_available, balance_locked FROM wallets WHERE clerk_user_id = $1`, [clrkIdToUse])
        if (wRes.rows.length > 0) {
          walletInfo = {
            balance: Number(wRes.rows[0].balance_available),
            lockedBalance: Number(wRes.rows[0].balance_locked)
          }
        }
      }

      let latestChart: { id: string; interpretation: string | null } | null = null
      if (clrkIdToUse) {
        const chartRes = await pool.query(
          `SELECT id, interpretation FROM natal_charts WHERE clerk_user_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [clrkIdToUse]
        )
        if (chartRes.rows.length > 0) {
          latestChart = {
            id: chartRes.rows[0].id,
            interpretation: chartRes.rows[0].interpretation
          }
        }
      }

      res.json({
        email,
        displayName: displayName || 'Cliente ospite',
        firstName,
        lastName,
        taxId,
        // Badge VM18
        ageVerified,
        ageVerifiedAt,
        declaredBirthday,
        birthTime,
        birthCity,
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
        latestChart,
        consults: consultRows.map((c: Record<string, unknown>) => ({
          ...c,
          start_at: c.start_at ? new Date(c.start_at as string).toISOString() : null,
          end_at: c.end_at ? new Date(c.end_at as string).toISOString() : null,
          created_at: new Date(c.created_at as string).toISOString(),
          updated_at: new Date(c.updated_at as string).toISOString(),
          notes: notesByConsult.get(c.id as string) ?? [],
        })),
        wallet: walletInfo
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
    const { email, generalNotes, lastInvoicedAt, markInvoicedNow, manualBonusCredits, unlockReviewOverride, firstName, lastName, declaredBirthday, taxId } = parsed.data
    const norm = normalizeEmail(email)

    if (
      generalNotes === undefined &&
      lastInvoicedAt === undefined &&
      !markInvoicedNow &&
      manualBonusCredits === undefined &&
      unlockReviewOverride === undefined &&
      firstName === undefined &&
      lastName === undefined &&
      declaredBirthday === undefined &&
      taxId === undefined
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

      // Se forniti Nome, Cognome, Compleanno o CF, salviamo in client_billing_profiles
      if (firstName !== undefined || lastName !== undefined || declaredBirthday !== undefined || taxId !== undefined) {
        const bpPrev = await pool.query(
          `SELECT first_name, last_name, declared_birthday, codice_fiscale FROM client_billing_profiles WHERE email_normalized = $1 LIMIT 1`,
          [norm]
        )
        const row = bpPrev.rows[0]
        const fn = firstName !== undefined ? firstName : row?.first_name || null
        const ln = lastName !== undefined ? lastName : row?.last_name || null
        const db = declaredBirthday !== undefined ? (declaredBirthday || null) : row?.declared_birthday || null
        const tf = taxId !== undefined ? taxId : row?.codice_fiscale || null

        // Se non esiste ancora per questa email, lo creiamo con un clerk_user_id fake "staff-manual-EMAIL" per evitare collisioni su UNIQUE
        // Clerk user id è NOT NULL UNIQUE.
        await pool.query(
          `INSERT INTO client_billing_profiles (clerk_user_id, email_normalized, first_name, last_name, declared_birthday, codice_fiscale, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, now())
           ON CONFLICT (email_normalized) DO UPDATE SET
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             declared_birthday = EXCLUDED.declared_birthday,
             codice_fiscale = EXCLUDED.codice_fiscale,
             updated_at = now()`,
          [`staff-manual-${norm}`, norm, fn, ln, db, tf]
        )
      }

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

  r.post('/clients/bonus', async (req, res) => {
    const parsed = z.object({ email: z.string(), amount: z.number().int().min(1) }).safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido' })
      return
    }
    const { email, amount } = parsed.data
    const norm = normalizeEmail(email)

    try {
      const bpLookup = await pool.query(`SELECT clerk_user_id FROM client_billing_profiles WHERE email_normalized = $1 LIMIT 1`, [norm])
      let cid = bpLookup.rows[0]?.clerk_user_id
      
      if (!cid || cid.startsWith('staff-manual-')) {
          const consultLookup = await pool.query(`SELECT clerk_user_id FROM consults WHERE LOWER(TRIM(invitee_email)) = $1 AND clerk_user_id IS NOT NULL LIMIT 1`, [norm])
          cid = consultLookup.rows[0]?.clerk_user_id
      }

      if (!cid || cid.startsWith('staff-manual-')) {
          res.status(404).json({ error: 'Utente non registrato, impossibile accreditare un bonus su un conto inesistente.' })
          return
      }

      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        
        const walletQuery = await client.query(`
          INSERT INTO wallets (clerk_user_id, balance_available, balance_locked, created_at, updated_at)
          VALUES ($1, $2, 0, now(), now())
          ON CONFLICT (clerk_user_id) DO UPDATE SET 
            balance_available = wallets.balance_available + $2,
            updated_at = now()
          RETURNING id, balance_available
        `, [cid, amount])

        await client.query(`
          INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id, created_at)
          VALUES ($1, $2, 'bonus', 'Staff Bonus', now())
        `, [cid, amount])

        await client.query('COMMIT')
        res.json({ success: true, newBalance: walletQuery.rows[0].balance_available })
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    } catch (e) {
      console.error('[staff bonus]', e)
      res.status(500).json({ error: 'Errore database transazione' })
    }
  })
}

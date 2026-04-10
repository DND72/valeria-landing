import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import crypto from 'crypto'
import { requireClerkAuth } from '../middleware/clerkAuth.js'
import { CONSULT_META, isValidConsultKind } from '../lib/consultPrices.js'
import { sendTelegramNotification } from '../lib/telegram.js'
import { getDiscountFactor } from '../lib/status.js'
import { clerkClient } from '../middleware/clerkAuth.js'
import { createDailyRoom, createDailyToken } from '../lib/dailyClient.js'


export function createBookingRouter(pool: Pool): Router {
  const r = Router()

  // --- ENGINE DISPONIBILITÀ INTERNA ---
  const BUFFER_MINS = 10

  r.get('/available-slots', async (req, res) => {
    try {
      const kind = req.query.kind as string
      const duration = (kind && isValidConsultKind(kind)) ? CONSULT_META[kind].durationMinutes : 60
      const totalNeeded = duration + BUFFER_MINS

      const daysAhead = 35
      const now = new Date()
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const endDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

      // Helper per determinare la settimana (1 o 2) nel ciclo bisettimanale
      const getWeekNumber = (date: Date) => {
        const refDate = new Date('2024-01-01T00:00:00Z') // Lunedì di riferimento
        const msPerWeek = 7 * 24 * 60 * 60 * 1000
        const diff = date.getTime() - refDate.getTime()
        const weeksSinceRef = Math.floor(diff / msPerWeek)
        return (Math.abs(weeksSinceRef) % 2) + 1
      }

      // 1. Carico patterns settimanali (Settimana 1/2 e 3 fasce)
      const { rows: patterns } = await pool.query<{
        day_of_week: number
        week_number: number
        slot_label: string
        is_active: boolean
        start_time: string
        end_time: string
      }>(`SELECT day_of_week, week_number, slot_label, is_active, 
                TO_CHAR(start_time, 'HH24:MI') as start_time, 
                TO_CHAR(end_time, 'HH24:MI') as end_time 
         FROM booking_availability`)

      // 2. Carico overrides (ferie/blocchi)
      const { rows: overrides } = await pool.query<{
        override_date: Date
        is_available: boolean
        start_time: string | null
        end_time: string | null
      }>(`SELECT override_date, is_available, 
                TO_CHAR(start_time, 'HH24:MI') as start_time, 
                TO_CHAR(end_time, 'HH24:MI') as end_time 
         FROM booking_overrides WHERE override_date >= $1 AND override_date <= $2`, [startDate, endDate])

      // 3. Carico appuntamenti già presi
      const { rows: taken } = await pool.query<{
        start_at: Date
        end_at: Date
      }>(`SELECT start_at, end_at FROM consults WHERE status <> 'cancelled' AND start_at >= $1 AND start_at <= $2`, [startDate, endDate])

      const availableSlots: Record<string, string[]> = {}

      for (let i = 0; i < daysAhead; i++) {
        const currentRef = new Date()
        currentRef.setDate(currentRef.getDate() + i)
        const dateStr = currentRef.toISOString().split('T')[0]
        const dow = currentRef.getDay()
        const weekNum = getWeekNumber(currentRef)

        const ov = overrides.find(o => new Date(o.override_date).toISOString().split('T')[0] === dateStr)
        if (ov && !ov.is_available) continue

        // Se c'è un override specifico di apertura, usiamo quello. Altrimenti usiamo i pattern bisettimanali attivi.
        const dayPatterns = (ov?.is_available && ov.start_time)
          ? [{ start_time: ov.start_time, end_time: ov.end_time }]
          : patterns.filter(p => p.day_of_week === dow && p.week_number === weekNum && p.is_active)

        if (dayPatterns.length === 0) continue

        const daySlots: string[] = []
        
        for (const pat of dayPatterns) {
          const [hS, mS] = (pat.start_time || '00:00').split(':').map(Number)
          const [hE, mE] = (pat.end_time || '23:59').split(':').map(Number)

          let cursor = new Date(currentRef)
          cursor.setHours(hS, mS, 0, 0)
          const stop = new Date(currentRef)
          stop.setHours(hE, mE, 0, 0)

          while (cursor < stop) {
            const slotEnd = new Date(cursor.getTime() + totalNeeded * 60 * 1000)
            const isInstantKind = kind && (kind.startsWith('chat_') || ['rapido', 'breve', 'completo'].includes(kind))
            const leadTimeMs = isInstantKind ? 0 : (60 * 60 * 1000) 
            const minLeadTime = new Date(Date.now() + leadTimeMs)
            
            if (cursor > minLeadTime) {
              const overlaps = taken.some(t => {
                const startT = new Date(t.start_at).getTime()
                const endT = new Date(t.end_at).getTime()
                const currentT = cursor.getTime()
                const slotEndT = slotEnd.getTime()
                // Check if [currentT, slotEndT] overlaps with [startT, endT]
                return (currentT < endT && slotEndT > startT)
              })

              if (!overlaps) {
                daySlots.push(cursor.toISOString())
              }
            }
            // Generiamo slot ogni 30 minuti
            cursor = new Date(cursor.getTime() + 30 * 60 * 1000)
          }
        }

        if (daySlots.length > 0) {
          availableSlots[dateStr] = daySlots.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        }
      }

      res.json(availableSlots)
    } catch (e) {
      console.error('[booking available-slots]', e)
      res.status(500).json({ error: 'Errore durante il calcolo della disponibilità.' })
    }
  })

  // --- FINESTRE LIVE (PER WIDGET FRONTEND) ---
  r.get('/live-windows', async (_req, res) => {
    try {
      const daysAhead = 7
      const now = new Date()

      // Helper per determinare la settimana (1 o 2) nel ciclo bisettimanale
      const getWeekNumber = (date: Date) => {
        const refDate = new Date('2024-01-01T00:00:00Z')
        const msPerWeek = 7 * 24 * 60 * 60 * 1000
        const diff = date.getTime() - refDate.getTime()
        const weeksSinceRef = Math.floor(diff / msPerWeek)
        return (Math.abs(weeksSinceRef) % 2) + 1
      }

      const { rows: patterns } = await pool.query(`SELECT day_of_week, week_number, slot_label, is_active, TO_CHAR(start_time, 'HH24:MI') as start_time, TO_CHAR(end_time, 'HH24:MI') as end_time FROM booking_availability WHERE is_active = true`)
      
      const { rows: overrides } = await pool.query(`SELECT override_date, is_available, TO_CHAR(start_time, 'HH24:MI') as start_time, TO_CHAR(end_time, 'HH24:MI') as end_time FROM booking_overrides WHERE override_date >= CURRENT_DATE AND override_date <= CURRENT_DATE + INTERVAL '7 days'`)

      const activeWindows: { start: string, end: string, label: string }[] = []

      for (let i = 0; i < daysAhead; i++) {
        const currentRef = new Date()
        currentRef.setDate(currentRef.getDate() + i)
        const dateStr = currentRef.toISOString().split('T')[0]
        const dow = currentRef.getDay()
        const weekNum = getWeekNumber(currentRef)

        const ov = overrides.find(o => new Date(o.override_date).toISOString().split('T')[0] === dateStr)
        
        if (ov && !ov.is_available) continue

        const dayPatterns = (ov?.is_available && ov.start_time)
          ? [{ start_time: ov.start_time, end_time: ov.end_time, slot_label: 'Custom' }]
          : patterns.filter(p => p.day_of_week === dow && p.week_number === weekNum)

        for (const pat of dayPatterns) {
          const [hS, mS] = (pat.start_time || '00:00').split(':').map(Number)
          const [hE, mE] = (pat.end_time || '23:59').split(':').map(Number)
          
          let windowStart = new Date(currentRef)
          windowStart.setHours(hS, mS, 0, 0)
          let windowEnd = new Date(currentRef)
          windowEnd.setHours(hE, mE, 0, 0)
          
          if (windowEnd > now) {
            activeWindows.push({
              start: windowStart.toISOString(),
              end: windowEnd.toISOString(),
              label: pat.slot_label
            })
          }
        }
      }

      res.json({ 
        windows: activeWindows.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).slice(0, 5) 
      })
    } catch (e) {
      console.error('[live windows error]', e)
      res.status(500).json({ error: 'Errore durante il recupero delle finestre live.' })
    }
  })

  // --- LOGICA DI PRENOTAZIONE ORIGINALE ---

  const bookSchema = z.object({
    consultKind: z.string().min(1),
    slotIso: z.string().datetime(),
  })

  r.post('/start', requireClerkAuth, async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autorizzato' })
      return
    }

    const parsed = bookSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }

    const { consultKind, slotIso } = parsed.data

    if (!isValidConsultKind(consultKind)) {
      res.status(400).json({ error: `Tipo di consulto non valido: ${consultKind}` })
      return
    }

    const meta = CONSULT_META[consultKind]
    let cost = meta.costCredits

    // 0. Calcolo eventuale sconto status
    try {
      const { rows: countRes } = await pool.query(
        `SELECT COUNT(*)::int AS c FROM consults WHERE clerk_user_id = $1 AND status = 'done' AND is_free_consult = false`,
        [userId]
      )
      const donePaid = countRes[0]?.c ?? 0
      
      let forcedStatus: string | undefined
      if (clerkClient) {
        try {
          const u = await clerkClient.users.getUser(userId)
          forcedStatus = (u.publicMetadata?.astralStatus as string) || undefined
        } catch {}
      }

      const factor = getDiscountFactor(donePaid, forcedStatus)
      if (factor < 1 && cost > 0) {
        cost = Math.max(0, Math.round(cost * factor))
      }
    } catch (e) {
      console.error('[booking status discount error]', e)
    }

    const duration = meta.durationMinutes
    const totalNeeded = duration + BUFFER_MINS

    const bookingId = 'book_' + crypto.randomUUID()

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // 1. Verifico slot libero
      const slotStart = new Date(slotIso)
      const slotEnd = new Date(slotStart.getTime() + totalNeeded * 60 * 1000)

      // Collision check con range overlap
      const { rows: collision } = await client.query(
        `SELECT id FROM consults 
         WHERE status <> 'cancelled' 
           AND (start_at < $2 AND end_at > $1)
         FOR UPDATE`,
        [slotStart, slotEnd]
      )

      if (collision.length > 0) {
        await client.query('ROLLBACK')
        res.status(409).json({ error: 'Spiacenti, questo orario è stato appena occupato da un altro utente.' })
        return
      }

      // 2. Verifico saldo
      // 2. Verifico saldo
      const { rows: walletRows } = await client.query(
        `SELECT balance_available FROM wallets WHERE clerk_user_id = $1 FOR UPDATE`,
        [userId]
      )

      if (walletRows.length === 0 || walletRows[0].balance_available < cost) {
        await client.query('ROLLBACK')
        res.status(400).json({ error: 'Saldo Crediti insufficiente.' })
        return
      }

      // 3. Scalo e blocco fondi
      if (cost > 0) {
        await client.query(
          `UPDATE wallets SET balance_available = balance_available - $1, balance_locked = balance_locked + $1, updated_at = now() WHERE clerk_user_id = $2`,
          [cost, userId]
        )
        await client.query(
          `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id, created_at)
           VALUES ($1, $2, 'lock_for_consult', $3, now())`,
          [userId, cost, bookingId]
        )
      }

      // 4. Registro consulto già schedulato (INTERNAL)
      await client.query(
        `INSERT INTO consults (
           stripe_session_id, consult_kind, amount_cents, cost_credits, clerk_user_id, 
           status, is_free_consult, start_at, end_at, updated_at, meeting_provider
         ) VALUES ($1, $2, $3, $4, $5, 'scheduled', $6, $7, $8, now(), 'internal')`,
        [bookingId, consultKind, meta.amountCents, cost, userId, meta.isFree, slotStart, slotEnd]
      )

      await client.query('COMMIT')

      // Invio notifica Telegram a Valeria (Out-of-platform)
      const dateLoc = slotStart.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
      const timeLoc = slotStart.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      const tgMsg = `🔮 <b>NUOVA PRENOTAZIONE</b>\n\n👤 <b>Cliente:</b> ID ${userId}\n📅 <b>Data:</b> ${dateLoc}\n⏰ <b>Ora:</b> ${timeLoc}\n✨ <b>Tipo:</b> ${consultKind}\n💰 <b>Costo:</b> ${cost} CR`
      void sendTelegramNotification(tgMsg)

      res.json({ ok: true, internal: true })
    } catch (e: any) {
      if (client) await client.query('ROLLBACK')
      console.error('[booking] Errore:', e.message)
      res.status(500).json({ error: 'Errore durante la prenotazione.' })
    } finally {
      client.release()
    }

  })

  // --- SISTEMA CHAT LIVE / VIDEO LIVE ---
  r.get('/video-session/:id', requireClerkAuth, async (req, res) => {
    const { id } = req.params
    const userId = req.auth?.userId

    try {
      const { rows } = await pool.query(
        `SELECT clerk_user_id, status, consult_kind, actual_start_at, meeting_link
         FROM consults WHERE id = $1`,
        [id]
      )
      if (rows.length === 0) return res.status(404).json({ error: 'Sessione non trovata' })
      const consult = rows[0]
      
      // Controlla se utente è Staff
      let isStaff = false
      if (clerkClient && userId) {
        try {
          const u = await clerkClient.users.getUser(userId)
          isStaff = u.publicMetadata?.role === 'staff' || u.publicMetadata?.role === 'admin'
        } catch {}
      }

      if (!isStaff && userId !== consult.clerk_user_id) {
        return res.status(403).json({ error: 'Non autorizzato' })
      }

      let roomName = ''
      // Generiamo / Recuperiamo la room
      if (consult.meeting_link && consult.meeting_link.startsWith('daily:')) {
        roomName = consult.meeting_link.split(':')[1]
      } else {
         // Generiamo la stanza su Daily.co (se non esiste)
         // Lo facciamo on the fly. In produzione potremmo farlo nell'interfaccia staff
         try {
           const room = await createDailyRoom(undefined, Math.floor(Date.now() / 1000) + 3600 * 2) 
           roomName = room.name
           await pool.query(
             `UPDATE consults SET meeting_link = $1, meeting_provider = 'daily', updated_at = now() WHERE id = $2`,
             [`daily:${roomName}`, id]
           )
         } catch (roomErr: any) {
           console.error('[daily room error]', roomErr)
           return res.status(500).json({ error: 'Impossibile creare stanza Daily' })
         }
      }

      // Ora forgiato il badge personale
      try {
         const token = await createDailyToken(roomName, isStaff)
         const dailyUrl = \`https://nonsolotarocchi.daily.co/\${roomName}?t=\${token}\`
         
         res.json({
           videoLink: dailyUrl,
           sessionInfo: {
             kind: consult.consult_kind,
             status: consult.status,
             actualStartAt: consult.actual_start_at,
             costCredits: consult.cost_credits,
             inviteeName: consult.invitee_name
           }
         })
      } catch (tokenErr) {
         console.error('[daily token error]', tokenErr)
         return res.status(500).json({ error: 'Impossibile generare accesso video' })
      }

    } catch (e) {
      console.error('[video-session get]', e)
      res.status(500).json({ error: 'Errore generico' })
    }
  })
  r.get('/session/:id/messages', requireClerkAuth, async (req, res) => {
    const { id } = req.params
    try {
      const { rows: msgs } = await pool.query(
        `SELECT id, role, text, created_at FROM consult_messages 
         WHERE consult_id = $1 ORDER BY created_at ASC`,
        [id]
      )

      // Recuperiamo anche i dettagli del consulto per tempo/costo e typing status
      const { rows: consultInfo } = await pool.query(
        `SELECT cost_credits, consult_kind, status, actual_start_at, created_at,
                invitee_name, valeria_typing_seconds,
                (staff_is_typing_until > now()) as staff_typing,
                (client_is_typing_until > now()) as client_typing
         FROM consults WHERE id = $1`,
        [id]
      )
      
      const info = consultInfo[0] || {}

      res.json({
        messages: msgs.map(m => ({
          id: m.id,
          role: m.role,
          text: m.text,
          timestamp: m.created_at
        })),
        typing: {
          staff: info.staff_typing || false,
          client: info.client_typing || false
        },
        sessionInfo: {
          costCredits: info.cost_credits,
          kind: info.consult_kind,
          status: info.status,
          actualStartAt: info.actual_start_at,
          createdAt: info.created_at,
          inviteeName: info.invitee_name,
          valeriaWritingSeconds: info.valeria_typing_seconds,
          expectedDuration: (info.consult_kind && info.consult_kind in CONSULT_META) ? (CONSULT_META as any)[info.consult_kind].durationMinutes : 30
        }
      })
    } catch (e) {
      console.error('[chat get]', e)
      res.status(500).json({ error: 'Errore recupero messaggi' })
    }
  })

  r.post('/session/:id/accept', requireClerkAuth, async (req, res) => {
    const { id } = req.params
    try {
       const { rowCount } = await pool.query(
         `UPDATE consults SET 
            status = 'in_progress', 
            actual_start_at = COALESCE(actual_start_at, now()), 
            updated_at = now() 
          WHERE id = $1 AND (status = 'scheduled' OR status = 'client_waiting')`,
         [id]
       )
       if (rowCount === 0) {
          // Verifichiamo se è già in progress
          const check = await pool.query(`SELECT status FROM consults WHERE id = $1`, [id])
          if (check.rows.length === 0) return res.status(404).json({ error: 'Sessione non trovata' })
          if (check.rows[0].status === 'in_progress') return res.json({ ok: true, alreadyActive: true })
          return res.status(400).json({ error: 'Stato non valido per accettazione' })
       }
       res.json({ ok: true })
    } catch (e) {
       console.error('[accept error]', e)
       res.status(500).json({ error: 'Errore accettazione sessione' })
    }
  })

  r.post('/session/:id/enter', requireClerkAuth, async (req, res) => {
    const { id } = req.params
    try {
       // Se è un cliente ad entrare, segnamo che è in attesa (se era solo scheduled)
       await pool.query(
         `UPDATE consults SET status = 'client_waiting', updated_at = now() 
          WHERE id = $1 AND status = 'scheduled'`,
         [id]
       )
       res.json({ ok: true })
    } catch (e) {
       res.status(500).json({ error: 'Errore entry signal' })
    }
  })

  r.post('/session/:id/abandon', requireClerkAuth, async (req, res) => {
    const { id } = req.params
    try {
       // Controlla se è già in progress
       const { rows } = await pool.query(`SELECT status, clerk_user_id, cost_credits, status_billing, consult_kind, actual_start_at FROM consults WHERE id = $1`, [id])
       if (rows.length > 0 && rows[0].status === 'in_progress' && rows[0].status_billing !== 'billed') {
           const consult = rows[0]
           
           // Calculate duration if it's per minute
           const start = consult.actual_start_at ? new Date(consult.actual_start_at).getTime() : Date.now();
           const actualMinutes = Math.floor((Date.now() - start) / 60000);
           
           const baseRates: Record<string, number> = {
              'chat_flash': 1.3,
              'chat_prenotabile': 1.0,
              'tarocchi_flash': 1.3,
              'tarocchi_prenotabile': 1.0,
              'coaching_flash': 1.5,
              'coaching_prenotabile': 1.2,
              'combo_flash': 1.7,
              'combo_prenotabile': 1.4,
              'free': 0
           }
           const rate = consult.consult_kind && baseRates[consult.consult_kind] !== undefined ? baseRates[consult.consult_kind] : 1.0;
           let finalCost = Math.ceil(rate * Math.max(1, actualMinutes));
           finalCost = Math.min(finalCost, consult.cost_credits);
           
           let refundAmount = consult.cost_credits - finalCost;
           if (refundAmount < 0) refundAmount = 0;
           
           // Move locked balance to available and staff claim
           if (consult.cost_credits > 0 && consult.clerk_user_id) {
              await pool.query(
                `UPDATE wallets SET balance_locked = balance_locked - $1, balance_available = balance_available + $2, updated_at = now() WHERE clerk_user_id = $3`,
                [consult.cost_credits, refundAmount, consult.clerk_user_id]
              )
              if (finalCost > 0) {
                 await pool.query(
                   `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'staff_claim', $3)`,
                   [consult.clerk_user_id, finalCost, id]
                 )
              }
              if (refundAmount > 0) {
                 await pool.query(
                   `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id) VALUES ($1, $2, 'unlock_refund', $3)`,
                   [consult.clerk_user_id, refundAmount, id]
                 )
              }
           }
           await pool.query(`UPDATE consults SET status = 'done', status_billing = 'billed', updated_at = now() WHERE id = $1`, [id])
           return res.json({ ok: true, billed: true })
       }

       // Se il cliente abbandona prima che valeria accetti, cancelliamo.
       // Se è già in progress, potremmo voler gestire un rimborso parziale o simili, 
       // ma per ora lo settiamo a 'done' o 'cancelled' per fermare la sessione.
       await pool.query(
         `UPDATE consults SET status = 'cancelled', updated_at = now() 
          WHERE id = $1 AND (status = 'scheduled' OR status = 'client_waiting')`,
         [id]
       )
       res.json({ ok: true })
    } catch (e) {
       console.error('[abandon error]', e)
       res.status(500).json({ error: 'Errore abbandono sessione' })
    }
  })

  r.post('/session/:id/typing', requireClerkAuth, async (req, res) => {
    const { id } = req.params
    const { role } = req.body
    const isValeria = role === 'valeria'
    const col = isValeria ? 'staff_is_typing_until' : 'client_is_typing_until'
    const secCol = isValeria ? 'valeria_typing_seconds' : 'client_typing_seconds'
    
    try {
       // Incrementiamo il contatore di 5 secondi (l'intervallo dell'invio segnale)
       await pool.query(
         `UPDATE consults SET 
            ${col} = now() + INTERVAL '5 seconds', 
            ${secCol} = ${secCol} + 5,
            updated_at = now() 
          WHERE id = $1`,
         [id]
       )
       res.json({ ok: true })
    } catch (e) {
       res.status(500).json({ error: 'Errore typing status' })
    }
  })

  const msgSchema = z.object({
    text: z.string().min(1).max(5000),
    role: z.enum(['valeria', 'client'])
  })

  r.post('/session/:id/messages', requireClerkAuth, async (req, res) => {
    const { id } = req.params
    const userId = req.auth?.userId
    const parsed = msgSchema.safeParse(req.body)
    
    if (!parsed.success || !userId) {
      res.status(400).json({ error: 'Dati non validi' })
      return
    }

    try {
      // Opzionale: verificare che il userId sia il cliente del consulto o uno staff
      // Per velocità ora permettiamo l'inserimento se autenticati
      const { rows } = await pool.query(
        `INSERT INTO consult_messages (consult_id, sender_id, role, text)
         VALUES ($1, $2, $3, $4)
         RETURNING id, created_at`,
        [id, userId, parsed.data.role, parsed.data.text]
      )
      
      res.status(201).json({ 
        id: rows[0].id, 
        timestamp: rows[0].created_at 
      })
    } catch (e) {
      console.error('[chat post]', e)
      res.status(500).json({ error: 'Errore invio messaggio' })
    }
  })

  return r
}

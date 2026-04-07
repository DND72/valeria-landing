import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { requireClerkAuth } from '../middleware/clerkAuth.js'
import { type ConsultKind, CONSULT_META, isValidConsultKind } from '../lib/consultPrices.js'
import { getSingleUseCalendlyLink } from '../lib/calendlyLinkGen.js'
import { sendTelegramNotification } from '../lib/telegram.js'

const MULTIPACK_STEPS: Partial<Record<ConsultKind, ConsultKind[]>> = {
  coaching_pack5: ['coaching_60', 'coaching_60', 'coaching_60', 'coaching_60', 'coaching_60'],
  combo_light: ['breve', 'breve', 'coaching_30'],
  combo_full: ['completo', 'completo', 'coaching_60'],
}

export function createBookingRouter(pool: Pool): Router {
  const r = Router()

  // --- ENGINE DISPONIBILITÀ INTERNA ---

  r.get('/available-slots', async (_req, res) => {
    try {
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
          const [hS, mS] = pat.start_time.split(':').map(Number)
          const [hE, mE] = pat.end_time.split(':').map(Number)

          let cursor = new Date(currentRef)
          cursor.setHours(hS, mS, 0, 0)
          const stop = new Date(currentRef)
          stop.setHours(hE, mE, 0, 0)

          while (cursor < stop) {
            const slotEnd = new Date(cursor.getTime() + 60 * 60 * 1000)
            const minLeadTime = new Date(Date.now() + 2 * 60 * 60 * 1000)
            
            if (cursor > minLeadTime) {
              const isTaken = taken.some(t => {
                const startT = new Date(t.start_at).getTime()
                const endT = new Date(t.end_at).getTime()
                const currentT = cursor.getTime()
                const slotEndT = slotEnd.getTime()
                return (currentT < endT && slotEndT > startT)
              })

              if (!isTaken) {
                daySlots.push(cursor.toISOString())
              }
            }
            cursor = new Date(cursor.getTime() + 60 * 60 * 1000)
          }
        }

        if (daySlots.length > 0) {
          // Ordiniamo gli slot cronologicamente (fondendo le fasce morning/afternoon/evening)
          availableSlots[dateStr] = daySlots.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        }
      }

      res.json(availableSlots)
    } catch (e) {
      console.error('[booking available-slots]', e)
      res.status(500).json({ error: 'Errore durante il calcolo della disponibilità.' })
    }
  })

  // --- LOGICA DI PRENOTAZIONE ORIGINALE ---

  const bookSchema = z.object({
    consultKind: z.string().min(1),
    slotIso: z.string().datetime().optional(), // Opzionale per ora, obbligatorio per i nuovi consulti "internal"
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
    const cost = meta.costCredits

    const bookingId = 'book_' + crypto.randomUUID()

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // 1. Verifico slot libero se fornito (per nuovi consulti interni)
      if (slotIso) {
        const slotStart = new Date(slotIso)
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)

        const { rows: collision } = await client.query(
          `SELECT id FROM consults WHERE status <> 'cancelled' AND start_at = $1 FOR UPDATE`,
          [slotStart]
        )
        if (collision.length > 0) {
          await client.query('ROLLBACK')
          res.status(409).json({ error: 'Spiacenti, questo orario è stato appena occupato da un altro utente.' })
          return
        }

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
        return
      }

      // --- LOGICA VECCHIA (Calendly Webhook) ---
      // Se non passa slotIso, usiamo il fallback Calendly (per retrocompatibilità temporanea)
      
      const { rows: walletRows } = await client.query(
        `SELECT balance_available FROM wallets WHERE clerk_user_id = $1 FOR UPDATE`,
        [userId]
      )

      if (walletRows.length === 0 || walletRows[0].balance_available < cost) {
        await client.query('ROLLBACK')
        res.status(400).json({ error: 'Saldo Crediti insufficiente.' })
        return
      }

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

      const steps = MULTIPACK_STEPS[consultKind] || [consultKind]
      for (let i = 0; i < steps.length; i++) {
        const stepKind = steps[i]
        const currentBookingId = (i === 0) ? bookingId : 'book_' + crypto.randomUUID()
        const stepCost = Math.floor(cost / steps.length)
        const finalStepCost = (i === steps.length - 1) ? (cost - (stepCost * (steps.length - 1))) : stepCost

        await client.query(
          `INSERT INTO consults (
             stripe_session_id, consult_kind, amount_cents, cost_credits, clerk_user_id, 
             status, is_free_consult, updated_at
           ) VALUES ($1, $2, $3, $4, $5, 'pending_booking_calendly', $6, now())`,
          [currentBookingId, stepKind, Math.floor(meta.amountCents / steps.length), finalStepCost, userId, meta.isFree]
        )
      }

      await client.query('COMMIT')

      const calendlyToken = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN
      if (!calendlyToken) throw new Error('Calendly Token mancante')
      const rawBookingUrl = await getSingleUseCalendlyLink(calendlyToken, consultKind)
      const finalUrl = rawBookingUrl + '?salesforce_uuid=' + bookingId
      
      res.json({ ok: true, bookingUrl: finalUrl })
    } catch (e: any) {
      if (client) await client.query('ROLLBACK')
      console.error('[booking] Errore:', e.message)
      res.status(500).json({ error: 'Errore durante la prenotazione.' })
    } finally {
      client.release()
    }

  })

  return r
}

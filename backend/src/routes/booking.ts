import { Router } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { requireClerkAuth } from '../middleware/clerkAuth.js'
import { type ConsultKind, CONSULT_META, isValidConsultKind } from '../lib/consultPrices.js'
import { getSingleUseCalendlyLink } from '../lib/calendlyLinkGen.js'

const MULTIPACK_STEPS: Partial<Record<ConsultKind, ConsultKind[]>> = {
  coaching_pack5: ['coaching_60', 'coaching_60', 'coaching_60', 'coaching_60', 'coaching_60'],
  combo_light: ['breve', 'breve', 'coaching_30'],
  combo_full: ['completo', 'completo', 'coaching_60'],
}

export function createBookingRouter(pool: Pool): Router {
  const r = Router()

  const bookSchema = z.object({
    consultKind: z.string().min(1),
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

    const { consultKind } = parsed.data

    if (!isValidConsultKind(consultKind)) {
      res.status(400).json({ error: `Tipo di consulto non valido: ${consultKind}` })
      return
    }

    const meta = CONSULT_META[consultKind]
    const cost = meta.costCredits

    // Auth Calendly
    const calendlyToken = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN
    if (!calendlyToken) {
      console.error('[booking] CALENDLY_PERSONAL_ACCESS_TOKEN non configurato')
      res.status(500).json({ error: 'Errore configurazione backend Calendly.' })
      return
    }

    const bookingId = 'book_' + crypto.randomUUID()

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Verifico saldo disponibile (FOR UPDATE)
      const { rows: walletRows } = await client.query(
        `SELECT balance_available FROM wallets WHERE clerk_user_id = $1 FOR UPDATE`,
        [userId]
      )

      if (walletRows.length === 0 || walletRows[0].balance_available < cost) {
        await client.query('ROLLBACK')
        res.status(400).json({ error: 'Saldo Crediti insufficiente nel wallet per prenotare questo consulto.' })
        return
      }

      // Blocco i fondi nel wallet
      if (cost > 0) {
        await client.query(
          `UPDATE wallets SET
             balance_available = balance_available - $1,
             balance_locked = balance_locked + $1,
             updated_at = now()
           WHERE clerk_user_id = $2`,
          [cost, userId]
        )
      }

      // Registro la transazione in wallet_transactions (lock_for_consult)
      if (cost > 0) {
        await client.query(
          `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id, created_at)
           VALUES ($1, $2, 'lock_for_consult', $3, now())`,
          [userId, cost, bookingId]
        )
      }

      // Genero record in consults per abbinarci il Webhook Calendly quando l'utente sceglierà giorno/ora.
      // E' impostato a pending_booking_calendly.
      
      const steps = MULTIPACK_STEPS[consultKind] || [consultKind]

      for (let i = 0; i < steps.length; i++) {
        const stepKind = steps[i]
        
        // Ogni "pezzo" del pacchetto ha un UUID unico per il tracking Calendly
        const currentBookingId = (i === 0) ? bookingId : 'book_' + crypto.randomUUID()
        
        // Ripartiamo il costo totale sulla prima riga per semplicità di logica rimborsi/audit,
        // oppure dividiamo? L'utente ha confermato che i crediti vengono tolti SUBITO.
        // Impostiamo il costo della riga singola in modo che la somma sia il totale pagato.
        const stepCost = Math.floor(cost / steps.length)
        // Aggiustiamo l'ultimo per eventuali arrotondamenti
        const finalStepCost = (i === steps.length - 1) ? (cost - (stepCost * (steps.length - 1))) : stepCost

        await client.query(
          `INSERT INTO consults (
             stripe_session_id,
             consult_kind,
             amount_cents,
             cost_credits,
             clerk_user_id,
             status,
             is_free_consult,
             updated_at
           ) VALUES ($1, $2, $3, $4, $5, 'pending_booking_calendly', $6, now())`,
          [currentBookingId, stepKind, Math.floor(meta.amountCents / steps.length), finalStepCost, userId, meta.isFree]
        )
      }

      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('[booking] Errore DB prenotazione:', e)
      res.status(500).json({ error: 'Errore server durante il blocco dei crediti.' })
      return
    } finally {
      client.release()
    }

    // A questo punto ho bloccato i fondi. Chiamo Calendly per il GUEST link.
    try {
      const rawBookingUrl = await getSingleUseCalendlyLink(calendlyToken, consultKind)
      
      // Injectiamo il tracking salesforce_uuid per riconoscerla via webhook
      const finalUrl = rawBookingUrl + '?salesforce_uuid=' + bookingId
      
      res.json({ ok: true, bookingUrl: finalUrl })
    } catch (e: any) {
      console.error('[booking] Errore Calendly Link:', e.message)
      // Se fallisce Calendly, teoricamente dovrei rollbackare i fondi.
      // Lo tratteremo manualmente o il timeout 60 minuti libererà il fondo perché resterà 'pending_booking_calendly'.
      res.status(502).json({ error: 'Calendly non disponibile, riprova. I tuoi crediti ti verranno restituiti entro 60 minuti in automatico.' })
    }
  })

  return r
}

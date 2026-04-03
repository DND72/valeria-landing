import Stripe from 'stripe'
import { Router, raw, json } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { requireClerkAuth, clerkClient } from '../middleware/clerkAuth.js'
import { TOPUP_META, isValidTopUpKind } from '../lib/walletPrices.js'

// ---------------------------------------------------------------------------
// Stripe client — singleton lazy per evitare errori di startup senza chiave
// ---------------------------------------------------------------------------
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY non configurata nelle variabili d\'ambiente')
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
}

// ---------------------------------------------------------------------------
// Validazione body per la creazione della sessione
// ---------------------------------------------------------------------------
const createSessionSchema = z.object({
  topUpKind: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

// ---------------------------------------------------------------------------
// Helper: estrae e salva i dati di fatturazione dalla sessione Stripe completata
//
// Chiama sia il nostro DB (client_billing_profiles) che le API Clerk
// per tenere i dati sincronizzati su entrambi i sistemi.
// ---------------------------------------------------------------------------
async function applyBillingDataFromSession(
  pool: Pool,
  session: Stripe.Checkout.Session
): Promise<void> {
  const clerkUserId = session.metadata?.clerkUserId || null
  const customerEmail = session.metadata?.customerEmail || session.customer_email || null

  // Raccoglie customer da Stripe (può essere un Customer object espanso o solo l'ID)
  const stripeCustomerId =
    typeof session.customer === 'string'
      ? session.customer
      : (session.customer as Stripe.Customer | null)?.id ?? null

  // --- Indirizzo di fatturazione ---
  // Stripe popola customer_details.address quando billing_address_collection = 'required'
  const details = session.customer_details
  const addr = details?.address

  const firstName = details?.name?.split(' ').slice(0, -1).join(' ').trim() || null
  const lastName = details?.name?.split(' ').slice(-1)[0]?.trim() || null
  const fullName = details?.name?.trim() || null

  // --- Tax ID (Codice Fiscale) ---
  // Stripe restituisce tax_ids come array di oggetti { type, value }
  // Per l'Italia il type è 'it_cf' (privato) o 'eu_vat' (partita IVA)
  let taxId: string | null = null
  const taxIds = (session as unknown as { customer_details?: { tax_ids?: Array<{ type: string; value: string }> } })
    ?.customer_details?.tax_ids ?? []
  for (const t of taxIds) {
    if (t.value?.trim()) {
      taxId = t.value.trim().toUpperCase()
      break
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Aggiorna client_billing_profiles nel nostro DB
  // ---------------------------------------------------------------------------
  const hasIdentifier = clerkUserId || customerEmail
  if (hasIdentifier) {
    try {
      if (clerkUserId) {
        // Upsert per clerk_user_id
        await pool.query(
          `INSERT INTO client_billing_profiles (
             clerk_user_id, first_name, last_name, codice_fiscale,
             stripe_customer_id, tax_id,
             address_line1, address_line2, address_city,
             address_state, address_postal_code, address_country,
             updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
           ON CONFLICT (clerk_user_id) DO UPDATE SET
             first_name           = COALESCE(EXCLUDED.first_name,           client_billing_profiles.first_name),
             last_name            = COALESCE(EXCLUDED.last_name,            client_billing_profiles.last_name),
             codice_fiscale       = COALESCE(EXCLUDED.codice_fiscale,       client_billing_profiles.codice_fiscale),
             stripe_customer_id   = COALESCE(EXCLUDED.stripe_customer_id,   client_billing_profiles.stripe_customer_id),
             tax_id               = COALESCE(EXCLUDED.tax_id,               client_billing_profiles.tax_id),
             address_line1        = COALESCE(EXCLUDED.address_line1,        client_billing_profiles.address_line1),
             address_line2        = COALESCE(EXCLUDED.address_line2,        client_billing_profiles.address_line2),
             address_city         = COALESCE(EXCLUDED.address_city,         client_billing_profiles.address_city),
             address_state        = COALESCE(EXCLUDED.address_state,        client_billing_profiles.address_state),
             address_postal_code  = COALESCE(EXCLUDED.address_postal_code,  client_billing_profiles.address_postal_code),
             address_country      = COALESCE(EXCLUDED.address_country,      client_billing_profiles.address_country),
             updated_at           = now()`,
          [
            clerkUserId,
            firstName,
            lastName,
            taxId,          // mappa su codice_fiscale (campo preesistente)
            stripeCustomerId,
            taxId,
            addr?.line1 ?? null,
            addr?.line2 ?? null,
            addr?.city ?? null,
            addr?.state ?? null,
            addr?.postal_code ?? null,
            addr?.country ?? null,
          ]
        )
        console.log(`[stripe webhook] ✅ Profilo fatturazione aggiornato (clerk_user_id: ${clerkUserId})`)
      }
    } catch (e) {
      // Non blocchiamo il webhook per un errore di profilo — solo log
      console.error('[stripe webhook] Errore aggiornamento profilo fatturazione:', e)
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Aggiorna i publicMetadata su Clerk se il codice fiscale è disponibile
  //    Questo lo rende visibile ovunque senza ulteriori query al DB.
  // ---------------------------------------------------------------------------
  if (clerkUserId && (taxId || fullName || stripeCustomerId) && clerkClient) {
    try {
      const currentUser = await clerkClient.users.getUser(clerkUserId)
      const currentMeta = (currentUser.publicMetadata ?? {}) as Record<string, unknown>

      const updatedMeta: Record<string, unknown> = {
        ...currentMeta,
        // Aggiorna solo se il nuovo valore è presente (non sovrascrivere con null)
        ...(stripeCustomerId ? { stripeCustomerId } : {}),
        ...(taxId ? { codiceFiscale: taxId } : {}),
        billing: {
          ...(typeof currentMeta.billing === 'object' && currentMeta.billing !== null
            ? (currentMeta.billing as Record<string, unknown>)
            : {}),
          ...(fullName ? { fullName } : {}),
          ...(addr?.line1 ? { addressLine1: addr.line1 } : {}),
          ...(addr?.line2 ? { addressLine2: addr.line2 } : {}),
          ...(addr?.city ? { city: addr.city } : {}),
          ...(addr?.postal_code ? { postalCode: addr.postal_code } : {}),
          ...(addr?.country ? { country: addr.country } : {}),
          updatedAt: new Date().toISOString(),
        },
      }

      await clerkClient.users.updateUserMetadata(clerkUserId, {
        publicMetadata: updatedMeta,
      })
      console.log(`[stripe webhook] ✅ Metadati Clerk aggiornati (clerk_user_id: ${clerkUserId})`)
    } catch (e) {
      // Non blocchiamo per errori Clerk — solo log
      console.error('[stripe webhook] Errore aggiornamento Clerk metadata:', e)
    }
  }
}

// ---------------------------------------------------------------------------
// Router factory — esportato e montato in index.ts
// ---------------------------------------------------------------------------
export function createPaymentsRouter(pool: Pool): Router {
  const r = Router()

  // -------------------------------------------------------------------------
  // POST /api/payments/create-checkout-session
  //
  // Richiede autenticazione Clerk (Bearer token).
  // Crea una Stripe Checkout Session per il tipo di consulto richiesto.
  //
  // Body JSON:
  //   { consultKind: string, successUrl: string, cancelUrl: string }
  //
  // Risposta:
  //   { sessionId: string, url: string }
  // -------------------------------------------------------------------------
  r.post('/create-checkout-session', json(), requireClerkAuth, async (req, res) => {
    const parsed = createSessionSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }

    const { topUpKind, successUrl, cancelUrl } = parsed.data
    const userId = req.auth?.userId

    if (!isValidTopUpKind(topUpKind)) {
      res.status(400).json({ error: `Pacchetto ricarica non valido: ${topUpKind}` })
      return
    }

    const meta = TOPUP_META[topUpKind]

    if (meta.amountCents === 0) {
      res.status(400).json({ error: 'Errore: pacchetto gratuito', isFree: true })
      return
    }

    // Recupera l'email del cliente da Clerk per pre-compilare il checkout Stripe
    let customerEmail: string | undefined
    if (clerkClient && userId) {
      try {
        const u = await clerkClient.users.getUser(userId)
        const primary =
          (u.primaryEmailAddressId &&
            u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress) ||
          u.emailAddresses[0]?.emailAddress
        if (typeof primary === 'string' && primary.trim()) {
          customerEmail = primary.trim().toLowerCase()
        }
      } catch (e) {
        console.warn('[payments] impossibile recuperare email Clerk:', e)
      }
    }

    let stripe: Stripe
    try {
      stripe = getStripe()
    } catch (e) {
      console.error('[payments] Stripe non configurato:', e)
      res.status(503).json({ error: 'Servizio di pagamento non configurato sul server.' })
      return
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],

        // Pre-compila email (e nome se disponibile da Clerk)
        ...(customerEmail ? { customer_email: customerEmail } : {}),

        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: meta.amountCents,
              product_data: {
                name: meta.name,
                description: meta.description,
              },
            },
            quantity: 1,
          },
        ],

        // Metadati che passano al webhook per accreditare i fondi
        metadata: {
          topUpKind,
          clerkUserId: userId ?? '',
          customerEmail: customerEmail ?? '',
        },

        // success_url: Stripe sostituisce automaticamente {CHECKOUT_SESSION_ID}
        success_url: successUrl.includes('{CHECKOUT_SESSION_ID}')
          ? successUrl
          : `${successUrl}${successUrl.includes('?') ? '&' : '?'}stripe_session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,

        // Scadenza della sessione: 30 minuti
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,

        // Localizzazione italiana
        locale: 'it',
      })

      if (!session.url) throw new Error('Stripe non ha restituito un URL di checkout')

      res.json({ sessionId: session.id, url: session.url })
    } catch (e) {
      console.error('[payments create-checkout-session]', e)
      res.status(500).json({ error: 'Errore nella creazione della sessione di pagamento' })
    }
  })

  // -------------------------------------------------------------------------
  // GET /api/payments/session-status?session_id=cs_xxx
  //
  // Usato dalla pagina /grazie per verificare l'esito del pagamento.
  // Non richiede autenticazione (la session_id è già un segreto monouso Stripe).
  // -------------------------------------------------------------------------
  r.get('/session-status', async (req, res) => {
    const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id.trim() : ''
    if (!sessionId || !sessionId.startsWith('cs_')) {
      res.status(400).json({ error: 'session_id mancante o non valido' })
      return
    }

    let stripe: Stripe
    try {
      stripe = getStripe()
    } catch {
      res.status(503).json({ error: 'Servizio di pagamento non configurato' })
      return
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      const topUpKind = session.metadata?.topUpKind ?? null
      const meta = topUpKind && isValidTopUpKind(topUpKind) ? TOPUP_META[topUpKind] : null

      res.json({
        status: session.payment_status,          // 'paid' | 'unpaid' | 'no_payment_required'
        paymentStatus: session.payment_status,
        topUpKind,
        topUpName: meta?.name ?? null,
        credits: meta?.credits ?? 0,
        amountTotal: session.amount_total,        // centesimi
        currency: session.currency,
        customerEmail: session.customer_email,
        customerName: session.customer_details?.name ?? null,
      })
    } catch (e) {
      console.error('[payments session-status]', e)
      res.status(500).json({ error: 'Errore nel recupero dello stato della sessione' })
    }
  })

  // -------------------------------------------------------------------------
  // POST /api/payments/webhook
  //
  // Endpoint per i webhook Stripe (DEVE usare raw body, NON express.json()).
  // Montato PRIMA di express.json() in index.ts.
  //
  // Gestisce:
  //   checkout.session.completed  → crea record consulto + aggiorna profilo fatturazione
  //   checkout.session.expired    → log
  //   payment_intent.payment_failed → log
  // -------------------------------------------------------------------------
  r.post(
    '/webhook',
    raw({ type: 'application/json' }),
    async (req, res) => {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      const sig = req.headers['stripe-signature']

      let stripe: Stripe
      try {
        stripe = getStripe()
      } catch {
        res.status(503).json({ error: 'Stripe non configurato' })
        return
      }

      let event: Stripe.Event

      if (webhookSecret && sig) {
        // ✅ Verifica firma crittografica Stripe (obbligatoria in produzione)
        try {
          event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret)
        } catch (e) {
          console.error('[stripe webhook] Firma non valida:', e)
          res.status(400).json({ error: 'Firma webhook non valida' })
          return
        }
      } else if (process.env.NODE_ENV === 'production') {
        console.warn('[stripe webhook] STRIPE_WEBHOOK_SECRET mancante in produzione — webhook rifiutato')
        res.status(503).json({ error: 'Webhook non configurato' })
        return
      } else {
        // Sviluppo locale senza firma (Stripe CLI forwarding opzionale)
        try {
          event = JSON.parse((req.body as Buffer).toString('utf8')) as Stripe.Event
        } catch {
          res.status(400).json({ error: 'JSON non valido' })
          return
        }
      }

      // -----------------------------------------------------------------------
      // Evento: checkout.session.completed
      // -----------------------------------------------------------------------
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status !== 'paid') {
          // Fattura in sospeso — il pagamento arriverà con un evento separato
          res.json({ ok: true, skipped: true, reason: 'payment_not_yet_confirmed' })
          return
        }

        const topUpKind      = session.metadata?.topUpKind      ?? null
        const clerkUserId    = session.metadata?.clerkUserId    || null
        const stripeSessionId = session.id


        // 1. Aggiungi i crediti al wallet dell'utente
        if (clerkUserId && topUpKind && isValidTopUpKind(topUpKind)) {
          const meta = TOPUP_META[topUpKind]
          const creditsToAdd = meta.credits

          try {
            await pool.query('BEGIN')
            
            // Upsert sul wallet
            await pool.query(
              `INSERT INTO wallets (clerk_user_id, balance_available, balance_locked, updated_at)
               VALUES ($1, $2, 0, now())
               ON CONFLICT (clerk_user_id) DO UPDATE SET
                 balance_available = wallets.balance_available + EXCLUDED.balance_available,
                 updated_at = now()`,
              [clerkUserId, creditsToAdd]
            )

            // Registra la transazione di tipo top_up
            await pool.query(
              `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id, created_at)
               VALUES ($1, $2, 'top_up', $3, now())`,
              [clerkUserId, creditsToAdd, stripeSessionId]
            )

            await pool.query('COMMIT')
            console.log(`[stripe webhook] ✅ Ricarica completata — session: ${stripeSessionId}, \n  +${creditsToAdd} crediti / pkg: ${topUpKind} / user: ${clerkUserId}`)
          } catch (e) {
            await pool.query('ROLLBACK')
            console.error('[stripe webhook] Errore inserimento crediti:', e)
            res.status(500).json({ error: 'Errore inserimento crediti' })
            return
          }
        } else {
           console.warn(`[stripe webhook] ⚠️ Ignorato accredito, sessionId: ${stripeSessionId} manca userID o topUpKind.`)
        }

        // 2. Estrae e salva i dati di fatturazione (non bloccante per il webhook)
        void applyBillingDataFromSession(pool, session)
      }

      // -----------------------------------------------------------------------
      // Evento: payment_intent.succeeded
      // Gestisce il caso in cui checkout.session.completed arrivi con
      // payment_status = 'unpaid' (es. SEPA/bonifico) e il pagamento
      // viene confermato in un secondo momento.
      // -----------------------------------------------------------------------
      else if (event.type === 'payment_intent.succeeded') {
        // Nessun'azione sul payment_intent perchè il wallet viene aggiornato sulla checkout.session.completed 
        // che copre la quasi totalità degli use cases. Per SEPA delayed, stripe solleverebbe config di default.
      }

      // -----------------------------------------------------------------------
      // Evento: checkout.session.expired
      // -----------------------------------------------------------------------
      else if (event.type === 'checkout.session.expired') {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[stripe webhook] Sessione scaduta senza pagamento: ${session.id}`)
      }

      // -----------------------------------------------------------------------
      // Evento: payment_intent.payment_failed
      // -----------------------------------------------------------------------
      else if (event.type === 'payment_intent.payment_failed') {
        const pi = event.data.object as Stripe.PaymentIntent
        console.warn(
          `[stripe webhook] Pagamento fallito: ${pi.id} — ${pi.last_payment_error?.message ?? 'motivo sconosciuto'}`
        )
      }

      res.json({ received: true })
    }
  )

  return r
}

import Stripe from 'stripe'
import { Router, raw } from 'express'
import type { Pool } from 'pg'
import { z } from 'zod'
import { requireClerkAuth, clerkClient } from '../middleware/clerkAuth.js'
import { CONSULT_META, isValidConsultKind } from '../lib/consultPrices.js'
import { verifyAgeFromCF } from '../lib/codiceFiscale.js'

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
  consultKind: z.string().min(1),
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
  r.post('/create-checkout-session', requireClerkAuth, async (req, res) => {
    const parsed = createSessionSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Payload non valido', details: parsed.error.flatten() })
      return
    }

    const { consultKind, successUrl, cancelUrl } = parsed.data
    const userId = req.auth?.userId

    if (!isValidConsultKind(consultKind)) {
      res.status(400).json({ error: `Tipo di consulto non valido: ${consultKind}` })
      return
    }

    const meta = CONSULT_META[consultKind]

    if (meta.isFree) {
      res.status(400).json({ error: 'Questo consulto è gratuito e non richiede pagamento.', isFree: true })
      return
    }

    // Recupera l'email del cliente da Clerk per pre-compilare il checkout Stripe
    let customerEmail: string | undefined
    let customerFullName: string | undefined
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
        const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
        if (name) customerFullName = name
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

        // ✅ Indirizzo di fatturazione obbligatorio
        billing_address_collection: 'required',

        // ✅ Raccolta Tax ID (Codice Fiscale / P.IVA)
        // Stripe mostrerà il campo nella pagina di checkout
        tax_id_collection: { enabled: true },

        // ✅ Metadati che passano al webhook per creare il record consulto
        // Includiamo clerkUserId, consultKind, email e nome per la fattura
        metadata: {
          consultKind,
          clerkUserId: userId ?? '',
          customerEmail: customerEmail ?? '',
          customerFullName: customerFullName ?? '',
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
      const consultKind = session.metadata?.consultKind ?? null
      const meta = consultKind && isValidConsultKind(consultKind) ? CONSULT_META[consultKind] : null

      res.json({
        status: session.payment_status,          // 'paid' | 'unpaid' | 'no_payment_required'
        paymentStatus: session.payment_status,
        consultKind,
        consultName: meta?.name ?? null,
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

        const consultKind    = session.metadata?.consultKind    ?? null
        const clerkUserId    = session.metadata?.clerkUserId    || null
        const customerEmail  = session.metadata?.customerEmail  || session.customer_email || null
        const stripeSessionId = session.id
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null
        const amountTotal = session.amount_total ?? null

        // -----------------------------------------------------------------------
        // ✅ STRATO 3 — Verifica Codice Fiscale (VM18 Check)
        //
        // Estrae il tax_id fornito da Stripe Checkout, decodifica la data di
        // nascita dal CF italiano e verifica la maggiore eta'.
        // Se minore: rimborso immediato e blocco dell'ordine.
        // -----------------------------------------------------------------------
        const taxIds = (session as unknown as {
          customer_details?: { tax_ids?: Array<{ type: string; value: string }> }
        }).customer_details?.tax_ids ?? []
        const cfRaw = taxIds.find((t) => t.value?.trim())?.value?.trim().toUpperCase() ?? null

        if (cfRaw) {
          const ageCheck = verifyAgeFromCF(cfRaw)

          // Determina l'outcome per il log audit
          const outcome = ageCheck.verified
            ? 'verified_major'
            : ageCheck.reason === 'minor'
            ? 'rejected_minor'
            : ageCheck.reason === 'cf_invalid'
            ? 'rejected_cf_invalid'
            : 'rejected_cf_anomaly'

          // Recupera la data dichiarata dal DB per confronto
          let declaredBirthday: string | null = null
          if (clerkUserId) {
            try {
              const pr = await pool.query(
                `SELECT declared_birthday FROM client_billing_profiles WHERE clerk_user_id = $1`,
                [clerkUserId]
              )
              declaredBirthday = pr.rows[0]?.declared_birthday
                ? new Date(pr.rows[0].declared_birthday).toISOString().slice(0, 10)
                : null
            } catch { /* non bloccante */ }
          }

          // Log audit nella tabella age_verifications
          try {
            await pool.query(
              `INSERT INTO age_verifications
                 (clerk_user_id, declared_birthday, cf_used, cf_birth_date, cf_age, outcome, detail)
               VALUES ($1, $2::date, $3, $4::date, $5, $6, $7)`,
              [
                clerkUserId,
                declaredBirthday,
                cfRaw,
                ageCheck.birthDateISO,
                ageCheck.age,
                outcome,
                ageCheck.verified ? null : (ageCheck.error ?? `CF indica eta': ${ageCheck.age ?? '?'} anni`),
              ]
            )
          } catch (e) {
            console.error('[stripe webhook] Errore log age_verifications:', e)
          }

          if (!ageCheck.verified) {
            // ❌ MINORE RILEVATO — rimborso immediato e blocco
            console.warn(
              `[stripe webhook] ⚠️  MINORE — session ${stripeSessionId} | CF: ${cfRaw} | eta': ${ageCheck.age ?? '?'} | motivo: ${ageCheck.reason}`
            )

            if (paymentIntentId) {
              try {
                await stripe.refunds.create({
                  payment_intent: paymentIntentId,
                  reason: 'fraudulent',
                })
                console.log(`[stripe webhook] Rimborso emesso per payment_intent: ${paymentIntentId}`)
              } catch (e) {
                console.error('[stripe webhook] Errore durante il rimborso:', e)
              }
            }

            // Segna il consulto come annullato (se già inserito per qualsiasi motivo)
            try {
              await pool.query(
                `UPDATE consults SET status = 'cancelled', updated_at = now()
                 WHERE stripe_session_id = $1`,
                [stripeSessionId]
              )
            } catch { /* non bloccante */ }

            res.json({
              received: true,
              blocked: true,
              reason: `age_verification_failed:${ageCheck.reason}`,
            })
            return
          }

          // ✅ Maggiorenne verificato — aggiorna il profilo
          if (clerkUserId) {
            try {
              await pool.query(
                `INSERT INTO client_billing_profiles (clerk_user_id, age_verified, age_verified_at, updated_at)
                 VALUES ($1, true, now(), now())
                 ON CONFLICT (clerk_user_id) DO UPDATE SET
                   age_verified    = true,
                   age_verified_at = now(),
                   updated_at      = now()`,
                [clerkUserId]
              )
            } catch (e) {
              console.error('[stripe webhook] Errore aggiornamento age_verified:', e)
            }

            // Aggiorna anche Clerk publicMetadata
            if (clerkClient) {
              try {
                const u = await clerkClient.users.getUser(clerkUserId)
                const meta = (u.publicMetadata ?? {}) as Record<string, unknown>
                await clerkClient.users.updateUserMetadata(clerkUserId, {
                  publicMetadata: {
                    ...meta,
                    ageVerified: true,
                    ageVerifiedAt: new Date().toISOString(),
                  },
                })
              } catch { /* non bloccante */ }
            }
          }
        } else {
          // Nessun CF fornito — non blocchiamo ma logghiamo
          console.warn(`[stripe webhook] Nessun tax_id nella sessione: ${stripeSessionId}`)
        }

        // 1. Crea / aggiorna il record consulto
        try {
          await pool.query(
            `INSERT INTO consults (
               stripe_session_id,
               stripe_payment_intent,
               consult_kind,
               amount_cents,
               clerk_user_id,
               invitee_email,
               status,
               is_free_consult,
               updated_at
             ) VALUES ($1, $2, $3, $4, $5, $6, 'pending_booking', false, now())
             ON CONFLICT (stripe_session_id) DO UPDATE SET
               stripe_payment_intent = COALESCE(EXCLUDED.stripe_payment_intent, consults.stripe_payment_intent),
               clerk_user_id         = COALESCE(EXCLUDED.clerk_user_id,         consults.clerk_user_id),
               invitee_email         = COALESCE(EXCLUDED.invitee_email,         consults.invitee_email),
               amount_cents          = COALESCE(EXCLUDED.amount_cents,           consults.amount_cents),
               updated_at            = now()`,
            [stripeSessionId, paymentIntentId, consultKind, amountTotal, clerkUserId, customerEmail]
          )
          console.log(`[stripe webhook] ✅ Consulto registrato — session: ${stripeSessionId}, kind: ${consultKind}`)
        } catch (e) {
          console.error('[stripe webhook] Errore salvataggio consulto:', e)
          res.status(500).json({ error: 'Errore salvataggio consulto' })
          return
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
        const pi = event.data.object as Stripe.PaymentIntent
        try {
          await pool.query(
            `UPDATE consults
             SET status = 'pending_booking', updated_at = now()
             WHERE stripe_payment_intent = $1
               AND status IN ('scheduled', 'pending_payment')`,
            [pi.id]
          )
        } catch (e) {
          console.error('[stripe webhook] Errore aggiornamento stato da payment_intent.succeeded:', e)
        }
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

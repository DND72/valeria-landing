/**
 * Stripe frontend utility.
 *
 * Uso nel componente:
 *   import { redirectToStripeCheckout, fetchStripeSessionStatus } from '@/lib/stripe'
 *
 * La chiave pubblica viene da import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
 * (configurata nelle variabili d'ambiente dell'host di deploy).
 */

import { loadStripe } from '@stripe/stripe-js'
import { getApiBaseUrl } from '../constants/api'

// ---------------------------------------------------------------------------
// Singleton Stripe.js — caricato una sola volta al primo redirect
// ---------------------------------------------------------------------------
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined

let _stripePromise: ReturnType<typeof loadStripe> | null = null
function loadStripeOnce(): ReturnType<typeof loadStripe> {
  if (!STRIPE_PK) {
    return Promise.resolve(null)
  }
  if (!_stripePromise) {
    _stripePromise = loadStripe(STRIPE_PK)
  }
  return _stripePromise
}

// Pre-warm in background (nessun await al caricamento del modulo)
void loadStripeOnce()

// ---------------------------------------------------------------------------
// Tipi
// ---------------------------------------------------------------------------
export type ConsultKind =
  | 'breve'
  | 'online'
  | 'completo'
  | 'coaching_intro'
  | 'coaching_60'
  | 'coaching_pack5'
  | 'combo_light'
  | 'combo_full'
  | 'free'

// ---------------------------------------------------------------------------
// redirectToStripeCheckout
// ---------------------------------------------------------------------------

/**
 * Richiede al backend la URL di Stripe Checkout e reindirizza il browser.
 *
 * @returns null se il redirect è partito, oppure { error } se qualcosa è andato storto.
 */
export async function redirectToStripeCheckout({
  consultKind,
  getToken,
}: {
  consultKind: ConsultKind
  getToken: () => Promise<string | null>
}): Promise<{ error: string } | null> {
  const apiBase = getApiBaseUrl()
  if (!apiBase) return { error: 'Backend non configurato' }
  if (!STRIPE_PK) return { error: 'Chiave Stripe non configurata (VITE_STRIPE_PUBLISHABLE_KEY)' }

  const token = await getToken()
  if (!token) return { error: 'Autenticazione richiesta' }

  const origin = window.location.origin
  // {CHECKOUT_SESSION_ID} è un placeholder sostituito automaticamente da Stripe
  const successUrl = `${origin}/grazie?stripe_session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${origin}/dashboard?payment=cancelled`

  try {
    const res = await fetch(`${apiBase}/api/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ consultKind, successUrl, cancelUrl }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string; isFree?: boolean }
      if (body.isFree) return { error: 'Consulto gratuito — nessun pagamento necessario.' }
      return { error: body.error ?? `Errore server (${res.status})` }
    }

    const data = (await res.json()) as { url?: string }
    if (!data.url) return { error: 'Nessun URL di pagamento ricevuto' }

    // Reindirizza a Stripe Checkout (pagina ospitata da Stripe)
    window.location.href = data.url
    return null
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Errore di rete' }
  }
}

// ---------------------------------------------------------------------------
// fetchStripeSessionStatus
// ---------------------------------------------------------------------------

export type StripeSessionStatus = {
  status: 'paid' | 'unpaid' | 'no_payment_required' | null
  consultKind: string | null
  consultName: string | null
  amountTotal: number | null
  currency: string | null
  customerEmail: string | null
  error?: string
}

/**
 * Verifica lo stato di una sessione Stripe dal backend.
 * Usata nella pagina /grazie dopo il redirect.
 */
export async function fetchStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus> {
  const apiBase = getApiBaseUrl()
  if (!apiBase) {
    return {
      status: null, consultKind: null, consultName: null,
      amountTotal: null, currency: null, customerEmail: null,
      error: 'Backend non configurato',
    }
  }

  try {
    const res = await fetch(
      `${apiBase}/api/payments/session-status?session_id=${encodeURIComponent(sessionId)}`
    )
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? `Errore server (${res.status})`)
    }
    return (await res.json()) as StripeSessionStatus
  } catch (e) {
    return {
      status: null, consultKind: null, consultName: null,
      amountTotal: null, currency: null, customerEmail: null,
      error: e instanceof Error ? e.message : 'Errore di rete',
    }
  }
}

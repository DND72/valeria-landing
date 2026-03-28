#!/usr/bin/env node
/**
 * Registra su Calendly l'URL del webhook verso questo backend (una tantum).
 * Usa il Personal Access Token con scope webhooks:write (e users:read).
 * Per la Control Room serve anche availability:read sullo stesso PAT.
 *
 * In backend/.env:
 *   CALENDLY_PERSONAL_ACCESS_TOKEN=...
 *   CALENDLY_WEBHOOK_URL=https://TUO-BACKEND.up.railway.app/api/calendly/webhook
 *
 * Poi: npm run register-calendly-webhook
 */
import { config } from 'dotenv'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
config({ path: join(root, '.env') })

const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN?.trim()
const webhookUrl = process.env.CALENDLY_WEBHOOK_URL?.trim()

if (!token) {
  console.error('Manca CALENDLY_PERSONAL_ACCESS_TOKEN in backend/.env')
  process.exit(1)
}
if (!webhookUrl) {
  console.error('Manca CALENDLY_WEBHOOK_URL in backend/.env (URL completo fino a /api/calendly/webhook)')
  process.exit(1)
}

const base = 'https://api.calendly.com'

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }
  if (!res.ok) {
    const err = new Error(`Calendly API ${res.status}: ${text.slice(0, 500)}`)
    err.data = data
    throw err
  }
  return data
}

const me = await api('/users/me')
const userUri = me?.resource?.uri
const orgUri = me?.resource?.current_organization

if (!userUri || !orgUri) {
  console.error('Risposta /users/me inattesa:', JSON.stringify(me, null, 2))
  process.exit(1)
}

console.log('Utente:', userUri)
console.log('Organization:', orgUri)
console.log('Webhook URL:', webhookUrl)

const payload = {
  url: webhookUrl,
  events: ['invitee.created', 'invitee.canceled'],
  organization: orgUri,
  user: userUri,
  scope: 'user',
}

try {
  const created = await api('/webhook_subscriptions', {
    method: 'POST',
    body: payload,
  })
  console.log('Webhook registrato:', JSON.stringify(created, null, 2))
} catch (e) {
  if (String(e.message).includes('422') || String(e.message).includes('already')) {
    console.error(e.message)
    console.error('\nSe esiste già una subscription, rimuovila dal portale Calendly o via API e riprova.')
  } else {
    console.error(e.message)
  }
  process.exit(1)
}

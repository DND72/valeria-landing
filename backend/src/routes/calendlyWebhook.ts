import { createHmac, timingSafeEqual } from 'node:crypto'
import type { RequestHandler } from 'express'
import type { Pool } from 'pg'

function verifyCalendlySignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  signingKey: string
): boolean {
  if (!signatureHeader) return false
  let timestamp = ''
  let v1 = ''
  for (const part of signatureHeader.split(',')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const k = part.slice(0, eq).trim()
    const v = part.slice(eq + 1).trim()
    if (k === 't') timestamp = v
    if (k === 'v1') v1 = v
  }
  if (!timestamp || !v1) return false
  const payload = `${timestamp}.${rawBody.toString('utf8')}`
  const expectedHex = createHmac('sha256', signingKey).update(payload, 'utf8').digest('hex')
  try {
    const a = Buffer.from(v1, 'hex')
    const b = Buffer.from(expectedHex, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

function pickJoinUrl(payload: unknown): { url: string | null; provider: string | null } {
  if (!payload || typeof payload !== 'object') return { url: null, provider: null }
  const root = payload as Record<string, unknown>
  const ev = root.payload
  if (!ev || typeof ev !== 'object') return { url: null, provider: null }
  const p = ev as Record<string, unknown>
  const scheduled = p.event
  if (!scheduled || typeof scheduled !== 'object') return { url: null, provider: null }
  const se = scheduled as Record<string, unknown>
  const loc = se.location
  if (loc && typeof loc === 'object') {
    const l = loc as Record<string, unknown>
    const join = l.join_url
    const type = l.type
    if (typeof join === 'string' && join) {
      return { url: join, provider: typeof type === 'string' ? type : null }
    }
  }
  return { url: null, provider: null }
}

function pickEventFields(payload: unknown): {
  eventUri: string | null
  eventName: string | null
  inviteeUri: string | null
  inviteeEmail: string | null
  inviteeName: string | null
  startAt: string | null
  endAt: string | null
} {
  const out = {
    eventUri: null as string | null,
    eventName: null as string | null,
    inviteeUri: null as string | null,
    inviteeEmail: null as string | null,
    inviteeName: null as string | null,
    startAt: null as string | null,
    endAt: null as string | null,
  }
  if (!payload || typeof payload !== 'object') return out
  const root = payload as Record<string, unknown>
  const inner = root.payload
  if (!inner || typeof inner !== 'object') return out
  const p = inner as Record<string, unknown>
  const ev = p.event
  if (ev && typeof ev === 'object') {
    const e = ev as Record<string, unknown>
    if (typeof e.uri === 'string') out.eventUri = e.uri
    if (typeof e.name === 'string' && e.name.trim()) out.eventName = e.name.trim()
    if (typeof e.start_time === 'string') out.startAt = e.start_time
    if (typeof e.end_time === 'string') out.endAt = e.end_time
  }
  const inv = p.invitee
  if (inv && typeof inv === 'object') {
    const i = inv as Record<string, unknown>
    if (typeof i.uri === 'string') out.inviteeUri = i.uri
    if (typeof i.email === 'string') out.inviteeEmail = i.email
    if (typeof i.name === 'string') out.inviteeName = i.name
  }
  return out
}

export function createCalendlyWebhookHandler(pool: Pool): RequestHandler {
  return async (req, res) => {
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY
    const skipVerify = process.env.CALENDLY_SKIP_SIGNATURE_VERIFY === 'true'
    const rawBody = req.body as Buffer
    if (!Buffer.isBuffer(rawBody)) {
      res.status(400).json({ error: 'Body non valido' })
      return
    }

    if (signingKey && !skipVerify) {
      const sig = req.headers['calendly-webhook-signature']
      const ok = verifyCalendlySignature(rawBody, typeof sig === 'string' ? sig : undefined, signingKey)
      if (!ok) {
        res.status(401).json({ error: 'Firma webhook non valida' })
        return
      }
    } else if (!skipVerify && process.env.NODE_ENV === 'production') {
      console.warn('[calendly] CALENDLY_WEBHOOK_SIGNING_KEY mancante in produzione: webhook rifiutato')
      res.status(503).json({ error: 'Webhook non configurato' })
      return
    }

    let body: unknown
    try {
      body = JSON.parse(rawBody.toString('utf8'))
    } catch {
      res.status(400).json({ error: 'JSON non valido' })
      return
    }

    const eventType =
      typeof body === 'object' && body !== null && 'event' in body
        ? String((body as { event?: string }).event ?? '')
        : ''

    const fields = pickEventFields(body)
    const { url: joinUrl, provider } = pickJoinUrl(body)

    if (!fields.eventUri) {
      res.status(200).json({ ok: true, ignored: true, reason: 'missing_event_uri' })
      return
    }

    const cancelled = eventType.includes('canceled') || eventType.includes('cancelled')
    const lowerName = (fields.eventName ?? '').toLowerCase()
    const isFree = lowerName.includes('7 min') || lowerName.includes('conoscenza') || lowerName.includes('10 min')

    // Leggiamo un nostro identificativo personalizzato (se passato dalla route booking)
    const rootBody = body as any
    const bookingId = rootBody?.payload?.tracking?.salesforce_uuid || null

    try {
      if (bookingId && eventType.includes('created')) {
        // Flusso link generato tramite wallet pre-autorizzato
        await pool.query(
          `UPDATE consults SET
            calendly_event_uri = $1, calendly_invitee_uri = $2, status = $3,
            meeting_join_url = $4, meeting_provider = $5, invitee_email = $6, invitee_name = $7,
            start_at = $8, end_at = $9, calendly_event_name = $10, raw_payload = $11::jsonb, updated_at = now()
           WHERE stripe_session_id = $12 AND status = 'pending_booking_calendly'`,
           [fields.eventUri, fields.inviteeUri, 'scheduled', joinUrl, provider, fields.inviteeEmail, fields.inviteeName, fields.startAt, fields.endAt, fields.eventName, JSON.stringify(body), bookingId]
        )
        res.status(200).json({ ok: true, matched_wallet: true })
        return
      }

      // Old flow o Cancellazione Calendly
      await pool.query(
        `INSERT INTO consults (
          calendly_event_uri, calendly_invitee_uri, clerk_user_id, status,
          is_free_consult,
          meeting_join_url, meeting_provider,
          invitee_email, invitee_name, start_at, end_at, calendly_event_name, raw_payload, updated_at
        ) VALUES (
          $1, $2,
          (SELECT clerk_user_id FROM client_billing_profiles WHERE email_normalized = LOWER(TRIM($7)) LIMIT 1),
          $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, now()
        )
        ON CONFLICT (calendly_event_uri) DO UPDATE SET
          calendly_invitee_uri = COALESCE(EXCLUDED.calendly_invitee_uri, consults.calendly_invitee_uri),
          clerk_user_id = COALESCE(EXCLUDED.clerk_user_id, consults.clerk_user_id),
          status = EXCLUDED.status,
          is_free_consult = EXCLUDED.is_free_consult,
          meeting_join_url = COALESCE(EXCLUDED.meeting_join_url, consults.meeting_join_url),
          meeting_provider = COALESCE(EXCLUDED.meeting_provider, consults.meeting_provider),
          invitee_email = COALESCE(EXCLUDED.invitee_email, consults.invitee_email),
          invitee_name = COALESCE(EXCLUDED.invitee_name, consults.invitee_name),
          start_at = COALESCE(EXCLUDED.start_at, consults.start_at),
          end_at = COALESCE(EXCLUDED.end_at, consults.end_at),
          calendly_event_name = COALESCE(EXCLUDED.calendly_event_name, consults.calendly_event_name),
          raw_payload = EXCLUDED.raw_payload,
          updated_at = now()`,
        [
          fields.eventUri,
          fields.inviteeUri,
          cancelled ? 'cancelled' : 'scheduled',
          isFree,
          joinUrl,
          provider,
          fields.inviteeEmail,
          fields.inviteeName,
          fields.startAt,
          fields.endAt,
          fields.eventName,
          JSON.stringify(body),
        ]
      )
      res.status(200).json({ ok: true })
    } catch (e) {
      console.error('[calendly webhook]', e)
      res.status(500).json({ error: 'Errore salvataggio' })
    }
  }
}

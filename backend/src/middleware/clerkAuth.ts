import { createClerkClient, verifyToken } from '@clerk/backend'
import type { RequestHandler } from 'express'
import { isStaffFromPublicMetadata } from '../auth/staff.js'

const secretKey = process.env.CLERK_SECRET_KEY

export const clerkClient = secretKey
  ? createClerkClient({ secretKey })
  : null

function bearerToken(authorization: string | undefined): string | null {
  if (!authorization?.startsWith('Bearer ')) return null
  const t = authorization.slice(7).trim()
  return t || null
}

/** Verifica JWT Clerk e attacca req.auth = { userId } */
export const requireClerkAuth: RequestHandler = async (req, res, next) => {
  if (!secretKey?.trim() || !clerkClient) {
    res.status(503).json({ error: 'CLERK_SECRET_KEY non configurata sul server' })
    return
  }
  const token = bearerToken(req.headers.authorization)
  if (!token) {
    res.status(401).json({ error: 'Token mancante' })
    return
  }
  try {
    const payload = await verifyToken(token, { secretKey })
    const userId = typeof payload.sub === 'string' ? payload.sub : null
    if (!userId) {
      res.status(401).json({ error: 'Token non valido' })
      return
    }
    req.auth = { userId }
    next()
  } catch {
    res.status(401).json({ error: 'Token non valido o scaduto' })
  }
}

/** Solo utenti con publicMetadata staff/privileged (come Dashboard “Staff”) */
export const requireStaff: RequestHandler = async (req, res, next) => {
  const userId = req.auth?.userId
  if (!userId || !clerkClient) {
    res.status(503).json({ error: 'Autenticazione non disponibile' })
    return
  }
  try {
    const user = await clerkClient.users.getUser(userId)
    if (!isStaffFromPublicMetadata(user.publicMetadata as Record<string, unknown> | null)) {
      res.status(403).json({ error: 'Accesso riservato allo staff' })
      return
    }
    next()
  } catch (e) {
    console.error('[requireStaff]', e)
    res.status(500).json({ error: 'Errore verifica utente' })
  }
}

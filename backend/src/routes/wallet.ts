import { Router } from 'express'
import type { Pool } from 'pg'
import { requireClerkAuth } from '../middleware/clerkAuth.js'

export function createWalletRouter(pool: Pool): Router {
  const r = Router()

  /**
   * GET /api/wallet/me
   * Restituisce il saldo (disponibile e impegnato) dell'utente loggato.
   */
  r.get('/me', requireClerkAuth, async (req, res) => {
    const userId = req.auth?.userId
    if (!userId) {
      res.status(401).json({ error: 'Non autorizzato' })
      return
    }

    try {
      const { rows } = await pool.query(
        `SELECT balance_available, balance_locked 
         FROM wallets 
         WHERE clerk_user_id = $1`,
        [userId]
      )

      if (rows.length === 0) {
        // Nessun wallet ancora creato, ritorna 0
        res.json({ balanceAvailable: 0, balanceLocked: 0 })
        return
      }

      res.json({
        balanceAvailable: rows[0].balance_available,
        balanceLocked: rows[0].balance_locked,
      })
    } catch (e) {
      console.error('[wallet] Errore fetch saldo:', e)
      res.status(500).json({ error: 'Errore durante la lettura del wallet' })
    }
  })

  return r
}

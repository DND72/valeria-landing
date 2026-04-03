import { pool } from '../db.js'

/**
 * Controlla ogni 5 minuti se ci sono consulti in 'pending_booking_calendly'
 * creati da più di 60 minuti. In tal caso, li contrassegna come cancellati per timeout
 * e reinstanzia i crediti dal 'balance_locked' al 'balance_available' del wallet utente.
 */
export function startWalletTimeoutCron() {
  console.log('[cron] Job Timeout Wallet inizializzato.')
  
  setInterval(async () => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      const { rows } = await client.query(`
        SELECT stripe_session_id, clerk_user_id, cost_credits 
        FROM consults 
        WHERE status = 'pending_booking_calendly' 
          AND updated_at < now() - interval '60 minutes'
        FOR UPDATE
      `)

      for (const row of rows) {
        if (row.cost_credits > 0) {
          // Rimborso crediti all'utente (libera i locked blockati dal checkout parziale)
          await client.query(
            `UPDATE wallets SET
               balance_locked = balance_locked - $1,
               balance_available = balance_available + $1,
               updated_at = now()
             WHERE clerk_user_id = $2`,
            [row.cost_credits, row.clerk_user_id]
          )
          
          // Ledger entry
          await client.query(
             `INSERT INTO wallet_transactions (clerk_user_id, amount, tx_type, reference_id, created_at)
              VALUES ($1, $2, 'timeout_refund', $3, now())`,
             [row.clerk_user_id, row.cost_credits, row.stripe_session_id]
          )
        }

        // Segna il consulto (orfano di Calendly) come cancellato
        await client.query(
          `UPDATE consults SET status = 'cancelled', updated_at = now() WHERE stripe_session_id = $1`,
          [row.stripe_session_id]
        )
        
        console.log(`[cron] Sbloccati e rimborsati ${row.cost_credits} crediti per scadenza time out 60min prenotazione: ${row.stripe_session_id}`)
      }

      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('[cron] Errore timeout wallet:', e)
    } finally {
      client.release()
    }
  }, 5 * 60 * 1000) // Ogni 5 minuti
}

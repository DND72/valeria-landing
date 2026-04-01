/**
 * Script di migrazione per aggiungere le colonne Stripe alla tabella consults.
 *
 * Esegui con:  node scripts/migrate-stripe.mjs
 *
 * Idempotente: usa ADD COLUMN IF NOT EXISTS, sicuro da rieseguire.
 */

import pg from 'pg'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    console.log('▶ Migrazione Stripe in corso…')

    await client.query(`
      ALTER TABLE consults
        ADD COLUMN IF NOT EXISTS stripe_session_id   TEXT,
        ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT,
        ADD COLUMN IF NOT EXISTS consult_kind        TEXT,
        ADD COLUMN IF NOT EXISTS amount_cents        INTEGER
    `)

    // Indice per lookup rapido dal webhook Stripe
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS consults_stripe_session_id_uq
        ON consults (stripe_session_id)
        WHERE stripe_session_id IS NOT NULL
    `)

    console.log('✅ Migrazione completata.')
  } catch (e) {
    console.error('❌ Errore migrazione:', e)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()

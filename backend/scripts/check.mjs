import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const { rows: wTxs } = await pool.query('SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 5')
  console.log('--- WALLET TRANSACTIONS ---')
  console.log(wTxs)

  const { rows: wallets } = await pool.query('SELECT * FROM wallets ORDER BY updated_at DESC LIMIT 5')
  console.log('--- WALLETS ---')
  console.log(wallets)

  process.exit(0)
}
run().catch(console.error)

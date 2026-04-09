#!/usr/bin/env node
/**
 * Applica migrations/*.sql in ordine lessicografico su DATABASE_URL.
 * Legge DATABASE_URL da: variabile d'ambiente oppure file backend/.env (consigliato su Windows).
 */
import { config } from 'dotenv'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
config({ path: join(root, '.env') })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl?.trim()) {
  console.error('DATABASE_URL mancante.')
  process.exit(1)
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: true } })
await client.connect()

// 🛡️ Ensure tracking table exists
await client.query(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
  )
`)

try {
  const dir = join(root, 'migrations')
  const files = (await readdir(dir))
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const { rows } = await client.query(`SELECT 1 FROM _migrations WHERE name = $1`, [file])
    if (rows.length > 0) {
      console.log(`✓ ${file} (già applicata)`)
      continue
    }

    const sql = await readFile(join(dir, file), 'utf8')
    console.log(`→ Applicazione di ${file}...`)
    
    // Per sicurezza usiamo una transazione per ogni file
    await client.query('BEGIN')
    try {
      await client.query(sql)
      await client.query(`INSERT INTO _migrations (name) VALUES ($1)`, [file])
      await client.query('COMMIT')
      console.log(`✓ ${file} completata.`)
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`✕ Errore in ${file}:`, err.message)
      throw err // Stop execution on error
    }
  }
  console.log('Tutte le migrazioni necessarie sono state applicate.')
} finally {
  await client.end()
}

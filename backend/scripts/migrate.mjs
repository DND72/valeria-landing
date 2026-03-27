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

try {
  const dir = join(root, 'migrations')
  const files = (await readdir(dir))
    .filter((f) => f.endsWith('.sql'))
    .sort()
  for (const file of files) {
    const sql = await readFile(join(dir, file), 'utf8')
    console.log(`→ ${file}`)
    await client.query(sql)
  }
  console.log('Migrazioni completate.')
} finally {
  await client.end()
}

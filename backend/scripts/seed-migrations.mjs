import 'dotenv/config'
import pg from 'pg'
import { readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const databaseUrl = process.env.DATABASE_URL
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: true } })
await client.connect()

try {
  await client.query(`CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW())`)
  
  const dir = join(root, 'migrations')
  const files = (await readdir(dir)).filter(f => f.endsWith('.sql')).sort()
  
  // Per ogni file, proviamo a inserirlo. Se il DB ha già quell'oggetto, lo consideriamo "applicato"
  for (const file of files) {
     try {
       await client.query(`INSERT INTO _migrations (name) VALUES ($1)`, [file])
       console.log(`Marcato ${file} come applicato.`)
     } catch {
       // Già presente o errore, skip
     }
  }
} finally { await client.end() }

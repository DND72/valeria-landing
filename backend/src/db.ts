import pg from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl?.trim()) {
  console.warn('[db] DATABASE_URL non impostata: le route che usano il DB falliranno.')
}

export const pool = new pg.Pool({
  connectionString: databaseUrl,
  max: 10,
  ssl: databaseUrl ? { rejectUnauthorized: true } : undefined,
})

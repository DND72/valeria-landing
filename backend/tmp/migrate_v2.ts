import 'dotenv/config'
import pg from 'pg'
const { Pool } = pg

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    // Rimuovo la vecchia PK che era solo sul giorno
    await client.query(`ALTER TABLE booking_availability DROP CONSTRAINT IF EXISTS booking_availability_pkey CASCADE;`)

    // Aggiungo campi se non ci sono
    await client.query(`
      ALTER TABLE booking_availability ADD COLUMN IF NOT EXISTS week_number INTEGER DEFAULT 1;
      ALTER TABLE booking_availability ADD COLUMN IF NOT EXISTS slot_label TEXT DEFAULT 'morning';
    `)

    // Nuova PK composita
    await client.query(`ALTER TABLE booking_availability ADD PRIMARY KEY (day_of_week, week_number, slot_label);`)

    // Popolamento (se non esistono già) - 2 settimane, 7 giorni, 3 slot
    for (let w = 1; w <= 2; w++) {
      for (let d = 0; d <= 6; d++) {
        for (const lab of ['morning', 'afternoon', 'evening']) {
          await client.query(`
            INSERT INTO booking_availability (day_of_week, week_number, slot_label, is_active, start_time, end_time)
            VALUES ($1, $2, $3, false, '09:00:00', '12:00:00')
            ON CONFLICT (day_of_week, week_number, slot_label) DO NOTHING
          `, [d, w, lab])
        }
      }
    }

    await client.query('COMMIT')
    console.log('Migrazione v2 (Retry PK) completata.')
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('Errore migrazione:', e)
  } finally {
    client.release()
    await pool.end()
  }
}

run()

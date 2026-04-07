import 'dotenv/config'
import pg from 'pg'
const { Pool } = pg

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    // Attivo d'ufficio la Settimana 1 per testare lo sblocco
    console.log('Attivazione forzata Settimana 1...')
    
    // Lun-Ven: Mattina e Pomeriggio attivi
    for (let d = 1; d <= 5; d++) {
       await client.query(`
         UPDATE booking_availability 
         SET is_active = true, start_time = '09:00:00', end_time = '13:00:00', updated_at = now()
         WHERE day_of_week = $1 AND week_number = 1 AND slot_label = 'morning'
       `, [d])
       
       await client.query(`
         UPDATE booking_availability 
         SET is_active = true, start_time = '14:00:00', end_time = '18:00:00', updated_at = now()
         WHERE day_of_week = $1 AND week_number = 1 AND slot_label = 'afternoon'
       `, [d])
    }

    await client.query('COMMIT')
    console.log('Sblocco forzato completato. Ora la Settimana 1 dovrebbe essere popolata.')
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('Errore sblocco:', e)
  } finally {
    client.release()
    await pool.end()
  }
}

run()

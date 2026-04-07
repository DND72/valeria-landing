import 'dotenv/config'
import { pool } from './db.js'

async function migrate() {
  console.log('--- Migrazione Preferenze Contatto ---')
  try {
    await pool.query(`
      ALTER TABLE client_profiles 
      ADD COLUMN IF NOT EXISTS contact_preference VARCHAR(20) DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30),
      ADD COLUMN IF NOT EXISTS contact_details TEXT;
    `)
    console.log('✅ Colonne preferenze contatto aggiunte con successo.')
  } catch (e) {
    console.error('❌ Errore durante la migrazione:', e)
  } finally {
    process.exit(0)
  }
}

void migrate()

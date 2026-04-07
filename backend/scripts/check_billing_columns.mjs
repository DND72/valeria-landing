import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'client_billing_profiles'
    `);
    console.log('Colonne trovate in client_billing_profiles:');
    res.rows.forEach(row => console.log('- ' + row.column_name));
    await pool.end();
  } catch (err) {
    console.error('Errore durante il controllo:', err);
    process.exit(1);
  }
}

checkColumns();

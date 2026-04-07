import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    console.log("--- ISPEZIONE TOTALE TABELLE ---");
    const bp = await pool.query("SELECT * FROM client_billing_profiles LIMIT 10").catch(e => ({ rows: [] }));
    console.log("Dettagli profili billing:");
    console.table(bp.rows.map(r => ({ email: r.email_normalized, name: r.first_name + ' ' + r.last_name, clerk_id: r.clerk_user_id })));

  } catch (e) {
    console.error("ERRORE GENERALE:", e.message);
  } finally {
    await pool.end();
  }
}

check();

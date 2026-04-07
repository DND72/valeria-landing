import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const { rows } = await pool.query(`
        WITH identities AS (
            SELECT clerk_user_id, LOWER(TRIM(invitee_email)) as email_norm FROM consults
            UNION
            SELECT clerk_user_id, email_normalized as email_norm FROM client_billing_profiles
        )
        SELECT 
            ids.clerk_user_id,
            ids.email_norm,
            COALESCE(MAX(bp.first_name || ' ' || bp.last_name), MAX(c.invitee_name)) AS name_any,
            COUNT(c.id)::text AS total_consults,
            SUM(CASE WHEN c.id IS NOT NULL AND NOT COALESCE(c.is_free_consult, false) THEN 1 ELSE 0 END)::text AS paid_consults,
            SUM(CASE WHEN c.id IS NOT NULL AND COALESCE(c.is_free_consult, false) THEN 1 ELSE 0 END)::text AS free_consults,
            MAX(c.start_at) AS last_scheduled,
            COALESCE(BOOL_OR(bp.age_verified), false) AS is_verified,
            MAX(nc.id) AS latest_chart_id
        FROM identities ids
        LEFT JOIN consults c ON (c.clerk_user_id = ids.clerk_user_id OR LOWER(TRIM(c.invitee_email)) = ids.email_norm)
        LEFT JOIN client_billing_profiles bp ON (bp.clerk_user_id = ids.clerk_user_id OR bp.email_normalized = ids.email_norm)
        LEFT JOIN natal_charts nc ON (nc.clerk_user_id = ids.clerk_user_id)
        GROUP BY 1, 2
    `);
    console.log('Client count:', rows.length);
    if (rows.length > 0) {
      console.log('First client:', rows[0]);
    }
  } catch (e) {
    console.error('SQL Error:', e);
  } finally {
    await pool.end();
  }
}

check();

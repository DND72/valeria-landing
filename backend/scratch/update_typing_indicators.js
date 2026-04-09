
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import pg from 'pg';

async function run() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
    try {
        console.log('Updating consults table for typing indicators...');
        await pool.query(`ALTER TABLE consults ADD COLUMN IF NOT EXISTS staff_is_typing_until TIMESTAMP;`);
        await pool.query(`ALTER TABLE consults ADD COLUMN IF NOT EXISTS client_is_typing_until TIMESTAMP;`);
        console.log('Update completed!');
    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await pool.end();
    }
}
run();

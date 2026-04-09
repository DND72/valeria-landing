
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import pg from 'pg';
import fs from 'fs';

async function run() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
    const sql = fs.readFileSync('backend/migrations/020_synastry.sql', 'utf8');
    try {
        console.log('Running migration 020...');
        await pool.query(sql);
        console.log('Migration completed!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}
run();

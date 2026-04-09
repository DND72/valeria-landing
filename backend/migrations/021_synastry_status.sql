
-- Migrazione 021: Stato per Sinastria
ALTER TABLE synastry_reports ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending_staff';

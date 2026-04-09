-- Migrazione 024: Sincronizzazione Sessioni Live e Timer
ALTER TABLE consults ADD COLUMN IF NOT EXISTS actual_start_at TIMESTAMPTZ;
ALTER TABLE consults ADD COLUMN IF NOT EXISTS actual_duration_minutes INT;

-- Aggiorniamo il check constraint per includere i nuovi stati della sessione live
ALTER TABLE consults DROP CONSTRAINT IF EXISTS consults_status_check;
ALTER TABLE consults ADD CONSTRAINT consults_status_check 
    CHECK (status IN ('scheduled', 'pending_payment', 'done', 'cancelled', 'client_waiting', 'in_progress'));

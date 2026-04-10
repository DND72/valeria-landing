-- Migrazione 018: Tracciamento tempi di scrittura per billing personalizzato
ALTER TABLE consults ADD COLUMN IF NOT EXISTS valeria_typing_seconds INT DEFAULT 0;
ALTER TABLE consults ADD COLUMN IF NOT EXISTS client_typing_seconds INT DEFAULT 0;

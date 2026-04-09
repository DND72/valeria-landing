
-- Migrazione 019: Sistema Chat Sessioni Live
CREATE TABLE IF NOT EXISTS consult_messages (
    id SERIAL PRIMARY KEY,
    consult_id VARCHAR(255) NOT NULL, -- Usiamo varchar per compatibilità con i vari formati ID consulto
    sender_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'valeria' o 'client'
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consult_messages_consult ON consult_messages(consult_id);

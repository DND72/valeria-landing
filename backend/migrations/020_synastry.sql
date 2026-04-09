
-- Migrazione 020: Sinastria di Coppia
CREATE TABLE IF NOT EXISTS synastry_reports (
    id SERIAL PRIMARY KEY,
    clerk_user_id VARCHAR(255) NOT NULL,
    person_a_data JSONB NOT NULL, -- Dati anagrafici A
    person_b_data JSONB NOT NULL, -- Dati anagrafici B
    chart_a JSONB NOT NULL,       -- Posizioni pianeti A
    chart_b JSONB NOT NULL,       -- Posizioni pianeti B
    inter_aspects JSONB NOT NULL, -- Aspetti incrociati A vs B
    interpretation TEXT,          -- Analisi di Valeria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_synastry_user ON synastry_reports(clerk_user_id);

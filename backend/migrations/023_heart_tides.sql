CREATE TABLE heart_tides_reports (
    id SERIAL PRIMARY KEY,
    clerk_user_id TEXT NOT NULL,
    person_a_data JSONB NOT NULL,
    person_b_data JSONB NOT NULL,
    interpretation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aggiorniamo anche i tipi di transazione nel wallet (opzionale, per chiarezza nel DB)
-- ALTER TYPE wallet_tx_type ADD VALUE IF NOT EXISTS 'heart_tides';

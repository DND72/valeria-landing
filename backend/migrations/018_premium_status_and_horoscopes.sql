
-- Aggiungi colonna status al tema natale (default ready per i basic, pending per gli advanced)
ALTER TABLE natal_charts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ready';

-- Tabella per gli Oroscopi Settimanali (Enterprise)
CREATE TABLE IF NOT EXISTS user_horoscopes (
    id SERIAL PRIMARY KEY,
    clerk_user_id VARCHAR(255) NOT NULL,
    forecast_text TEXT NOT NULL,
    lucky_days JSONB DEFAULT '[]',
    energy_level INTEGER DEFAULT 50,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index per ricerca rapida
CREATE INDEX IF NOT EXISTS idx_horoscopes_user ON user_horoscopes(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_charts_status ON natal_charts(status);

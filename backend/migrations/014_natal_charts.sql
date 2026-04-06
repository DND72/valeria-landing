-- Migrazione 014: Tabelle per i Temi Natali Salvati

DO $$
BEGIN

CREATE TABLE IF NOT EXISTS natal_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL REFERENCES wallets(clerk_user_id) ON DELETE CASCADE,
  chart_type TEXT NOT NULL, -- 'basic' o 'advanced'
  birth_date TEXT NOT NULL,
  birth_time TEXT NOT NULL,
  city TEXT NOT NULL,
  chart_data JSONB NOT NULL,
  interpretation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clerk_user_id, birth_date, birth_time, city)
);

CREATE INDEX IF NOT EXISTS idx_natal_charts_user ON natal_charts(clerk_user_id);

END;
$$;

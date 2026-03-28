-- Più recensioni per cliente + import da Kang / Profetum / altre piattaforme

ALTER TABLE site_reviews DROP CONSTRAINT IF EXISTS site_reviews_clerk_user_id_key;

ALTER TABLE site_reviews ALTER COLUMN clerk_user_id DROP NOT NULL;

ALTER TABLE site_reviews
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS external_platform TEXT,
  ADD COLUMN IF NOT EXISTS imported_by_clerk_id TEXT;

ALTER TABLE site_reviews DROP CONSTRAINT IF EXISTS site_reviews_source_check;
ALTER TABLE site_reviews
  ADD CONSTRAINT site_reviews_source_check CHECK (source IN ('client', 'external'));

CREATE INDEX IF NOT EXISTS idx_site_reviews_clerk_source ON site_reviews (clerk_user_id, source);

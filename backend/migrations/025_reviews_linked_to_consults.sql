-- Migrazione 025: Feedback agganciati ai consulti
ALTER TABLE site_reviews ADD COLUMN IF NOT EXISTS consult_id UUID REFERENCES consults(id);
ALTER TABLE site_reviews ADD COLUMN IF NOT EXISTS title TEXT;

-- Indice per ricerca rapida delle recensioni di un consulto
CREATE INDEX IF NOT EXISTS idx_site_reviews_consult_id ON site_reviews (consult_id);

-- Regola: ogni cliente può lasciare al massimo una recensione per consulto
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_reviews_clerk_consult ON site_reviews (clerk_user_id, consult_id) 
WHERE clerk_user_id IS NOT NULL AND consult_id IS NOT NULL;

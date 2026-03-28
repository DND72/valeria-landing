-- Recensioni sul sito (moderazione staff, risposta Valeria)

CREATE TABLE IF NOT EXISTS site_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  author_display_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL CHECK (char_length(body) >= 20 AND char_length(body) <= 8000),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'hidden')),
  staff_response TEXT,
  staff_responded_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_reviews_status ON site_reviews (status);
CREATE INDEX IF NOT EXISTS idx_site_reviews_published ON site_reviews (published_at DESC NULLS LAST);

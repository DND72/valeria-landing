-- Neon / PostgreSQL — schema base per Control Room e spazio cliente
-- Esegui con: npm run migrate (dalla cartella backend)

CREATE TABLE IF NOT EXISTS client_billing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  codice_fiscale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT,
  calendly_event_uri TEXT UNIQUE,
  calendly_invitee_uri TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'pending_payment', 'done', 'cancelled')),
  is_free_consult BOOLEAN NOT NULL DEFAULT false,
  meeting_join_url TEXT,
  meeting_provider TEXT,
  invitee_email TEXT,
  invitee_name TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  paypal_order_id TEXT UNIQUE,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consults_clerk_user ON consults(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_consults_invitee_email ON consults(invitee_email);
CREATE INDEX IF NOT EXISTS idx_consults_start ON consults(start_at DESC);
CREATE INDEX IF NOT EXISTS idx_consults_status ON consults(status);

CREATE TABLE IF NOT EXISTS consult_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consult_id UUID NOT NULL REFERENCES consults(id) ON DELETE CASCADE,
  staff_clerk_user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consult_notes_consult ON consult_notes(consult_id);

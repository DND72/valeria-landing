-- CRM leggero: note su cliente e tracciamento ultima fatturazione (manuale)

CREATE TABLE IF NOT EXISTS client_profiles (
  email_normalized TEXT PRIMARY KEY,
  general_notes TEXT,
  last_invoiced_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

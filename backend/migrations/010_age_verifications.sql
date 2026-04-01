-- Migrazione 010: Verifica età e conformità minori
-- Aggiunge tabella audit log delle verifiche età + colonne di stato su client_billing_profiles

-- 1. Tabella registro verifiche età (audit trail per tutela legale)
CREATE TABLE IF NOT EXISTS age_verifications (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id        TEXT        NOT NULL,
  -- Dati dichiarati dall'utente (Strato 1: registrazione)
  declared_birthday    DATE,
  declared_age         INTEGER,
  -- Dati verificati tramite Codice Fiscale (Strato 3: Stripe)
  cf_used              TEXT,
  cf_birth_date        DATE,
  cf_age               INTEGER,
  -- Esito della verifica
  outcome              TEXT        NOT NULL
    CHECK (outcome IN ('verified_major', 'rejected_minor', 'rejected_cf_invalid', 'rejected_cf_anomaly', 'declaration_only')),
  -- Dettaglio aggiuntivo libero per il log
  detail               TEXT,
  -- IP e user-agent per audit completo
  ip_address           TEXT,
  user_agent           TEXT,
  -- Timestamp
  verified_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_age_ver_clerk ON age_verifications(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_age_ver_at    ON age_verifications(verified_at DESC);

-- 2. Aggiunge colonne di stato VM18 a client_billing_profiles
ALTER TABLE client_billing_profiles
  ADD COLUMN IF NOT EXISTS age_verified         BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS age_verified_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS declared_birthday    DATE,
  ADD COLUMN IF NOT EXISTS legal_declaration_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legal_declaration_ip TEXT;

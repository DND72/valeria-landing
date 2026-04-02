-- 011_legal_consent.sql
-- Aggiunta campi per il log del consenso legale

ALTER TABLE client_billing_profiles
ADD COLUMN IF NOT EXISTS legal_consent_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS legal_consent_version TEXT;

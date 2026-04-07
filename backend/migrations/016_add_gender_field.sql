-- Migrazione 016: Aggiunta campo gender a client_billing_profiles e natal_charts
ALTER TABLE client_billing_profiles
  ADD COLUMN IF NOT EXISTS gender TEXT;

ALTER TABLE natal_charts
  ADD COLUMN IF NOT EXISTS gender TEXT;

-- Nota: il campo rimarrà NULL per i record esistenti fino all'aggiornamento manuale o tramite UI.

-- Migrazione 015: Aggiunge campi nascita a client_billing_profiles per CF e Tema Natale
ALTER TABLE client_billing_profiles
  ADD COLUMN IF NOT EXISTS birth_time TEXT,
  ADD COLUMN IF NOT EXISTS birth_city TEXT;

-- Nota: birth_date è già presente come 'declared_birthday' (DATE)

-- Migrazione: Overrides manuali per CRM Clienti
-- Aggiunge campi per i crediti regalo e le recensioni forzate.

ALTER TABLE client_profiles
ADD COLUMN IF NOT EXISTS manual_bonus_credits INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS unlock_review_override BOOLEAN NOT NULL DEFAULT false;

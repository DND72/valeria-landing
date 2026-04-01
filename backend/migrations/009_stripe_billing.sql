-- Migrazione 009: dati di fatturazione completi raccolti tramite Stripe Checkout
-- Idempotente: usa ADD COLUMN IF NOT EXISTS / DO $$ ... $$

-- 1. Aggiunge colonne indirizzo e Stripe customer a client_billing_profiles
ALTER TABLE client_billing_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id   TEXT,
  ADD COLUMN IF NOT EXISTS tax_id               TEXT,
  ADD COLUMN IF NOT EXISTS address_line1        TEXT,
  ADD COLUMN IF NOT EXISTS address_line2        TEXT,
  ADD COLUMN IF NOT EXISTS address_city         TEXT,
  ADD COLUMN IF NOT EXISTS address_state        TEXT,
  ADD COLUMN IF NOT EXISTS address_postal_code  TEXT,
  ADD COLUMN IF NOT EXISTS address_country      TEXT;

-- Indice per lookup rapido da stripe_customer_id
CREATE UNIQUE INDEX IF NOT EXISTS billing_profiles_stripe_customer_uq
  ON client_billing_profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- 2. Aggiunge colonne Stripe ai consulti (idempotente se migrate-stripe.mjs è già stato eseguito)
ALTER TABLE consults
  ADD COLUMN IF NOT EXISTS stripe_session_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT,
  ADD COLUMN IF NOT EXISTS consult_kind          TEXT,
  ADD COLUMN IF NOT EXISTS amount_cents          INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS consults_stripe_session_id_uq
  ON consults (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- 3. Estende il CHECK constraint su consults.status per includere pending_booking
--    PostgreSQL non supporta ALTER CONSTRAINT direttamente: drop + recreate.
DO $$
BEGIN
  -- Rimuove il vecchio vincolo se esiste
  ALTER TABLE consults DROP CONSTRAINT IF EXISTS consults_status_check;

  -- Aggiunge il vincolo aggiornato con tutti i valori validi
  ALTER TABLE consults ADD CONSTRAINT consults_status_check
    CHECK (status IN ('scheduled', 'pending_payment', 'pending_booking', 'done', 'cancelled'));
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Impossibile aggiornare constraint status: %', SQLERRM;
END;
$$;

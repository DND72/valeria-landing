-- Migrazione 013: Wallet System (Crediti e Ledger)

DO $$
BEGIN

-- 1. Tabella wallets
CREATE TABLE IF NOT EXISTS wallets (
  clerk_user_id TEXT PRIMARY KEY,
  balance_available INTEGER NOT NULL DEFAULT 0,
  balance_locked INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabella wallet_transactions (Ledger)
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL REFERENCES wallets(clerk_user_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  tx_type TEXT NOT NULL, 
  -- ('top_up', 'lock_for_consult', 'unlock_refund', 'staff_claim', 'no_show_penalty', 'timeout_refund')
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions(clerk_user_id);

-- 3. Modifiche a consults (idempotenti con DO)
ALTER TABLE consults ADD COLUMN IF NOT EXISTS cost_credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE consults ADD COLUMN IF NOT EXISTS reschedule_count INTEGER NOT NULL DEFAULT 0;

-- Modifica o aggiunta check_status_billing
ALTER TABLE consults ADD COLUMN IF NOT EXISTS status_billing TEXT NOT NULL DEFAULT 'unbilled';

END;
$$;

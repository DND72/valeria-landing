
-- 022_synastry_limit.sql
-- Limit compatibility previews and crystallize personal data

ALTER TABLE wallets ADD COLUMN IF NOT EXISTS free_synastry_used BOOLEAN DEFAULT FALSE;

-- Ensure email uniqueness in billing profiles to deter duplicate accounts (beyond Clerk)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_email_normalized') THEN 
    ALTER TABLE client_billing_profiles ADD CONSTRAINT unique_email_normalized UNIQUE (email_normalized); 
  END IF; 
END $$;

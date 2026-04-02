-- Aggiunta email per sincronizzazione Webhook Calendly
ALTER TABLE client_billing_profiles 
ADD COLUMN IF NOT EXISTS email_normalized TEXT;

CREATE INDEX IF NOT EXISTS idx_billing_email ON client_billing_profiles(email_normalized);

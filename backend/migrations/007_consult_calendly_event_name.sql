ALTER TABLE consults ADD COLUMN IF NOT EXISTS calendly_event_name TEXT;

UPDATE consults
SET calendly_event_name = COALESCE(
  calendly_event_name,
  raw_payload->'payload'->'event'->>'name',
  raw_payload->'event'->>'name'
)
WHERE raw_payload IS NOT NULL
  AND (calendly_event_name IS NULL OR calendly_event_name = '');

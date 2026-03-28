-- Stato presenza Valeria (online / occupata / offline) visibile alle clienti

CREATE TABLE IF NOT EXISTS staff_presence_singleton (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'offline')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO staff_presence_singleton (id, status) VALUES (1, 'offline')
ON CONFLICT (id) DO NOTHING;

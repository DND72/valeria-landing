-- Migrazione 017: Sistema di Booking Interno
-- Aggiunge il supporto per gestire la disponibilità di Valeria senza Calendly

CREATE TABLE IF NOT EXISTS booking_availability (
    day_of_week INT PRIMARY KEY, -- 0 (Dom) a 6 (Sab)
    is_active BOOLEAN DEFAULT false,
    start_time TIME NOT NULL, -- HH:MM:SS
    end_time TIME NOT NULL,   -- HH:MM:SS
    slot_duration_minutes INT DEFAULT 60,
    updated_at TIMESTAMP DEFAULT now()
);

-- Inizializzazione orari standard (es. Lun-Ven 10-18)
INSERT INTO booking_availability (day_of_week, is_active, start_time, end_time) VALUES
(1, true, '10:00:00', '18:00:00'),
(2, true, '10:00:00', '18:00:00'),
(3, true, '10:00:00', '18:00:00'),
(4, true, '10:00:00', '18:00:00'),
(5, true, '10:00:00', '18:00:00')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS booking_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    override_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT false, -- Se false = Chiuso/Ferie
    start_time TIME, -- Se is_available=true, orario speciale
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Indice per velocizzare la ricerca degli override per data
CREATE INDEX IF NOT EXISTS idx_booking_overrides_date ON booking_overrides(override_date);

-- Aggiunta campi a consults per supportare il booking interno
-- status può rimanere quello attuale, ma useremo 'confirmed' invece di 'pending_booking_calendly'
-- aggiungiamo link per la chiamata se vogliamo gestirli noi (es. Google Meet o Zoom link diretto)
ALTER TABLE consults ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE consults ADD COLUMN IF NOT EXISTS internal_notes TEXT;

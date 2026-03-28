-- ============================================================
-- Auto-Cuidado App — Schema PostgreSQL
-- ============================================================

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Tabela: medications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medications (
  id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name      VARCHAR(100) NOT NULL,
  dosage    VARCHAR(50)  NOT NULL,
  frequency VARCHAR(5)   NOT NULL CHECK (frequency IN ('1x', '2x', '3x', '4x')),
  times     TEXT[]       NOT NULL,
  notes     TEXT
);

-- ------------------------------------------------------------
-- Tabela: medication_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medication_logs (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id  UUID         NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  date           DATE         NOT NULL,
  time           VARCHAR(5)   NOT NULL,
  status         VARCHAR(10)  NOT NULL CHECK (status IN ('taken', 'missed'))
);

-- Índices úteis para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_logs_date          ON medication_logs(date DESC);


-- ANDERSON - Tabela de registros de peso (Antropometria)
CREATE TABLE IF NOT EXISTS weight_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value NUMERIC NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT
);

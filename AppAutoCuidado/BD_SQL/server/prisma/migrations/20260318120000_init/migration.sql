-- Migration inicial do AutoCuidado (gerenciada pelo Prisma)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "medications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "dosage" VARCHAR(50) NOT NULL,
    "frequency" VARCHAR(5) NOT NULL,
    "times" TEXT[] NOT NULL,
    "notes" TEXT,
    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "medication_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "medication_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "time" VARCHAR(5) NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    CONSTRAINT "medication_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "medication_logs_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_logs_medication_id" ON "medication_logs"("medication_id");
CREATE INDEX IF NOT EXISTS "idx_logs_date" ON "medication_logs"("date" DESC);

CREATE TABLE IF NOT EXISTS "weight_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "value" DECIMAL NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "notes" TEXT,
    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

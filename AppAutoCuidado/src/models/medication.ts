/**
 * Modelo de dados para medicação.
 * Os dados são persistidos em PostgreSQL via API REST (BD_SQL/server).
 */
export interface Medication {
  id: string;
  name: string;
  dosage: string; // ex: "500mg"
  frequency: MedicationFrequency;
  times: string[]; // horários no formato "HH:mm"
  notes?: string; // anotações opcionais
}

/**
 * Frequência de uso da medicação
 */
export type MedicationFrequency = '1x' | '2x' | '3x' | '4x';

/**
 * Status do registro de uso
 */
export type MedicationStatus = 'taken' | 'missed';

/**
 * Registro de uso de medicação
 */
export interface MedicationLog {
  id: string;
  medicationId: string;
  date: string; // ISO date string
  time: string; // "HH:mm"
  status: MedicationStatus;
}

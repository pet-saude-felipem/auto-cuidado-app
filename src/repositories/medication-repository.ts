import { Medication, MedicationLog } from '@/src/models';

/**
 * Contrato do repositório de medicações.
 * As operações são assíncronas pois os dados vêm da API REST
 * que se comunica com o banco de dados PostgreSQL.
 */
export interface IMedicationRepository {
  getAllMedications(): Promise<Medication[]>;
  getMedicationById(id: string): Promise<Medication | undefined>;
  createMedication(data: Omit<Medication, 'id'>): Promise<Medication>;
  updateMedication(id: string, data: Partial<Medication>): Promise<Medication | undefined>;
  removeMedication(id: string): Promise<boolean>;

  getLogs(medicationId?: string, days?: number): Promise<MedicationLog[]>;
  createLog(data: Omit<MedicationLog, 'id'>): Promise<MedicationLog>;
}

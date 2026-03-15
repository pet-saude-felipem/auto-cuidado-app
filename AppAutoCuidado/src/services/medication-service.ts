import { Medication, MedicationLog, MedicationStatus } from '@/src/models';

/**
 * Contrato do serviço de medicações.
 * As operações são assíncronas pois a camada de repositório
 * se comunica com a API REST / PostgreSQL.
 */
export interface IMedicationService {
  getAllMedications(): Promise<Medication[]>;
  addMedication(data: Omit<Medication, 'id'>): Promise<Medication>;
  removeMedication(id: string): Promise<boolean>;
  registerUse(medicationId: string, time: string, status: MedicationStatus): Promise<MedicationLog>;
  getRecentLogs(days?: number): Promise<MedicationLog[]>;
}

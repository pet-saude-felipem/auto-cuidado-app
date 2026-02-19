import { Medication, MedicationLog } from '@/src/models';

/**
 * Contrato do repositório de medicações
 * O Gustavo implementará a lógica concreta
 */
export interface IMedicationRepository {
  getAllMedications(): Medication[];
  getMedicationById(id: string): Medication | undefined;
  createMedication(data: Omit<Medication, 'id'>): Medication;
  updateMedication(id: string, data: Partial<Medication>): Medication | undefined;
  removeMedication(id: string): boolean;

  getLogs(medicationId?: string): MedicationLog[];
  createLog(data: Omit<MedicationLog, 'id'>): MedicationLog;
}

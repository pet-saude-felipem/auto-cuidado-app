import { Medication, MedicationLog, MedicationStatus } from '@/src/models';

/**
 * Contrato do serviço de medicações
 * Regras de negócio — Gustavo implementa
 */
export interface IMedicationService {
  getAllMedications(): Medication[];
  addMedication(data: Omit<Medication, 'id'>): Medication;
  removeMedication(id: string): boolean;
  registerUse(medicationId: string, time: string, status: MedicationStatus): MedicationLog;
  getRecentLogs(days?: number): MedicationLog[];
}

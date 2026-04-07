import { Medication, MedicationLog, MedicationStatus } from '@/src/models';

export interface IMedicationService {
  getAllMedications(): Promise<Medication[]>;
  addMedication(data: Omit<Medication, 'id'>): Promise<Medication>;
  removeMedication(id: string): Promise<boolean>;
  registerUse(medicationId: string, time: string, status: MedicationStatus): Promise<MedicationLog>;
  getRecentLogs(days?: number): Promise<MedicationLog[]>;
}

import { Medication, MedicationLog, MedicationStatus } from '@/src/models';
import { IMedicationService } from './medication-service';
import { medicationRepository } from '@/src/repositories/medication-repository-impl';

/**
 * Implementação concreta do serviço de medicações.
 * Aplica regras de negócio e delega persistência ao repositório.
 */
export class MedicationService implements IMedicationService {
  async getAllMedications(): Promise<Medication[]> {
    return medicationRepository.getAllMedications();
  }

  async addMedication(data: Omit<Medication, 'id'>): Promise<Medication> {
    if (!data.name?.trim())   throw new Error('Nome da medicação é obrigatório.');
    if (!data.dosage?.trim()) throw new Error('Dosagem é obrigatória.');
    if (!data.times?.length)  throw new Error('Informe ao menos um horário.');
    return medicationRepository.createMedication(data);
  }

  async removeMedication(id: string): Promise<boolean> {
    return medicationRepository.removeMedication(id);
  }

  async registerUse(
    medicationId: string,
    time: string,
    status: MedicationStatus,
  ): Promise<MedicationLog> {
    const today = new Date().toISOString().split('T')[0];
    return medicationRepository.createLog({ medicationId, date: today, time, status });
  }

  async getRecentLogs(days = 7): Promise<MedicationLog[]> {
    return medicationRepository.getLogs(undefined, days);
  }
}

/** Instância singleton pronta para usar nas telas */
export const medicationService = new MedicationService();

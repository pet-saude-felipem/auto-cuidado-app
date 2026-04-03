import { Medication, MedicationLog } from '@/src/models';
import { IMedicationRepository } from './medication-repository';
import { medicationApi, medicationLogApi } from '@/src/api/medication-api';

/**
 * Implementação concreta do repositório de medicações.
 * Delega todas as operações para a API REST (BD_SQL/server)
 * que persiste os dados no PostgreSQL.
 */
export class MedicationRepository implements IMedicationRepository {
  async getAllMedications(): Promise<Medication[]> {
    return medicationApi.getAll();
  }

  async getMedicationById(id: string): Promise<Medication | undefined> {
    try {
      return await medicationApi.getById(id);
    } catch {
      return undefined;
    }
  }

  async createMedication(data: Omit<Medication, 'id'>): Promise<Medication> {
    return medicationApi.create(data);
  }

  async updateMedication(
    id: string,
    data: Partial<Medication>,
  ): Promise<Medication | undefined> {
    try {
      return await medicationApi.update(id, data);
    } catch {
      return undefined;
    }
  }

  async removeMedication(id: string): Promise<boolean> {
    try {
      await medicationApi.remove(id);
      return true;
    } catch {
      return false;
    }
  }

  async getLogs(medicationId?: string, days?: number): Promise<MedicationLog[]> {
    return medicationLogApi.getAll({ medicationId, days });
  }

  async createLog(data: Omit<MedicationLog, 'id'>): Promise<MedicationLog> {
    return medicationLogApi.create(data);
  }
}

/** Instância singleton pronta para usar nos serviços */
export const medicationRepository = new MedicationRepository();

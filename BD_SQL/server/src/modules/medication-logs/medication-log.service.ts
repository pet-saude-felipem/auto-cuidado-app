import { medicationRepository } from '../medications/medication.repository';
import { NotFoundError } from '../../shared/errors/app-error';
import { medicationLogRepository } from './medication-log.repository';
import {
  CreateMedicationLogInput,
  MedicationLogQuery,
  MedicationLogResponse,
} from './medication-log.schema';

export class MedicationLogService {
  async list(filters: MedicationLogQuery): Promise<MedicationLogResponse[]> {
    return medicationLogRepository.findAll(filters);
  }

  async create(data: CreateMedicationLogInput): Promise<MedicationLogResponse> {
    const medication = await medicationRepository.findById(data.medicationId);
    if (!medication) {
      throw new NotFoundError('Medicação não encontrada.');
    }

    return medicationLogRepository.create(data);
  }
}

export const medicationLogService = new MedicationLogService();

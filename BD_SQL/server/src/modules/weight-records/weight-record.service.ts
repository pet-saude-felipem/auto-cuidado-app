import { NotFoundError } from '../../shared/errors/app-error';
import { weightRecordRepository } from './weight-record.repository';
import {
  CreateWeightRecordInput,
  UpdateWeightRecordInput,
  WeightRecordResponse,
} from './weight-record.schema';

export class WeightRecordService {
  async list(): Promise<WeightRecordResponse[]> {
    return weightRecordRepository.findAll();
  }

  async getById(id: string): Promise<WeightRecordResponse> {
    const record = await weightRecordRepository.findById(id);
    if (!record) {
      throw new NotFoundError('Registro de peso não encontrado.');
    }
    return record;
  }

  async create(data: CreateWeightRecordInput): Promise<WeightRecordResponse> {
    return weightRecordRepository.create(data);
  }

  async update(id: string, data: UpdateWeightRecordInput): Promise<WeightRecordResponse> {
    await this.getById(id);
    return weightRecordRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await weightRecordRepository.delete(id);
  }
}

export const weightRecordService = new WeightRecordService();

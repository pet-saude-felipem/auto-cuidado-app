import { IWeightRepository, WeightRecord } from '../models/weight';
import { weightApi } from '@/src/api/weight-api';

class WeightRepository implements IWeightRepository {
  async getAll(): Promise<WeightRecord[]> {
    const records = await weightApi.getAll();
    return records.sort((a, b) => b.date.localeCompare(a.date));
  }

  async getById(id: string): Promise<WeightRecord | undefined> {
    return weightApi.getById(id);
  }

  async create(record: Omit<WeightRecord, 'id'>): Promise<WeightRecord> {
    return weightApi.create(record);
  }

  async update(id: string, data: Partial<WeightRecord>): Promise<WeightRecord | undefined> {
    return weightApi.update(id, data);
  }

  async remove(id: string): Promise<boolean> {
    await weightApi.remove(id);
    return true;
  }
}

export const weightRepository = new WeightRepository();

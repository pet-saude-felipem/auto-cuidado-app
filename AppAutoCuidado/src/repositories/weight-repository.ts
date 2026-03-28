import { mockWeightRecords } from '../mocks/weight-mocks';
import { IWeightRepository, WeightRecord } from '../models/weight';

/**
 * Contrato do serviço de peso
 * implementado a logica - "Anderson"
 */

class WeightRepository implements IWeightRepository {
  private data: WeightRecord[] = [...mockWeightRecords];

  getAll(): WeightRecord[] {
    return [...this.data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getById(id: string) { return this.data.find(r => r.id === id); }

  create(record: Omit<WeightRecord, 'id'>): WeightRecord {
    const newRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
    this.data.push(newRecord);
    return newRecord;
  }

  update(id: string, data: Partial<WeightRecord>) {
    const index = this.data.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.data[index] = { ...this.data[index], ...data };
    return this.data[index];
  }

  remove(id: string): boolean {
    const initialLength = this.data.length;
    this.data = this.data.filter(r => r.id !== id);
    return this.data.length < initialLength;
  }
}

export const weightRepository = new WeightRepository();
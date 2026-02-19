import { WeightRecord } from '@/src/models';

/**
 * Contrato do repositório de peso
 * O Anderson implementará a lógica concreta
 */
export interface IWeightRepository {
  getAll(): WeightRecord[];
  getById(id: string): WeightRecord | undefined;
  create(record: Omit<WeightRecord, 'id'>): WeightRecord;
  update(id: string, data: Partial<WeightRecord>): WeightRecord | undefined;
  remove(id: string): boolean;
}

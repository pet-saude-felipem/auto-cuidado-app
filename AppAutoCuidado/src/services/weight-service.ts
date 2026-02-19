import { WeightRecord, WeightChartData, WeightSummary } from '@/src/models';

/**
 * Contrato do serviço de peso
 * Regras de negócio — Anderson implementa
 */
export interface IWeightService {
  getAllRecords(): WeightRecord[];
  addRecord(value: number, date: string, notes?: string): WeightRecord;
  removeRecord(id: string): boolean;
  getChartData(): WeightChartData[];
  getSummary(): WeightSummary | null;
}

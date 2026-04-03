import { mockWeightRecords } from '../mocks/weight-mocks';
import { IWeightRepository, WeightRecord } from '../models/weight';
import { weightApi } from '@/src/api/weight-api';

/**
 * Implementação do repositório de peso.
 * Delega todas as operações para a API REST (BD_SQL/server)
 * que persiste os dados no PostgreSQL.
 * Fallback para mocks se a API não estiver disponível.
 */
class WeightRepository implements IWeightRepository {
  private useMocks = false;
  private data: WeightRecord[] = [...mockWeightRecords];

  async getAll(): Promise<WeightRecord[]> {
    try {
      const records = await weightApi.getAll();
      return records.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.warn('Erro ao buscar pesos da API, usando mocks:', error);
      this.useMocks = true;
      return [...this.data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  }

  async getById(id: string): Promise<WeightRecord | undefined> {
    try {
      return await weightApi.getById(id);
    } catch (error) {
      console.warn('Erro ao buscar peso da API:', error);
      return this.data.find((r) => r.id === id);
    }
  }

  async create(record: Omit<WeightRecord, 'id'>): Promise<WeightRecord> {
    try {
      return await weightApi.create(record);
    } catch (error) {
      console.warn('Erro ao criar peso via API, usando mocks:', error);
      const newRecord = {
        ...record,
        id: Math.random().toString(36).substr(2, 9),
      };
      this.data.push(newRecord);
      return newRecord;
    }
  }

  async update(
    id: string,
    data: Partial<WeightRecord>
  ): Promise<WeightRecord | undefined> {
    try {
      return await weightApi.update(id, data);
    } catch (error) {
      console.warn('Erro ao atualizar peso via API:', error);
      const index = this.data.findIndex((r) => r.id === id);
      if (index === -1) return undefined;
      this.data[index] = { ...this.data[index], ...data };
      return this.data[index];
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await weightApi.remove(id);
      return true;
    } catch (error) {
      console.warn('Erro ao remover peso via API:', error);
      const initialLength = this.data.length;
      this.data = this.data.filter((r) => r.id !== id);
      return this.data.length < initialLength;
    }
  }
}

export const weightRepository = new WeightRepository();
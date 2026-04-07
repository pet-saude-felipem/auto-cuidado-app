import {
  WeightChartData,
  WeightRecord,
  WeightSummary,
  WeightTrend,
} from "../models/weight";
import { weightRepository } from "../repositories/weight-repository";

/**
 * Implementação do serviço de peso.
 * Aplica regras de negócio e delega persistência ao repositório.
 */
class WeightService {
  /**
   * Retorna todos os registros ordenados do mais recente para o mais antigo
   */
  async getAllRecords(): Promise<WeightRecord[]> {
    return await weightRepository.getAll();
  }

  /**
   * Adiciona um novo registro e dispara a atualização dos dados
   */
  async addRecord(value: number, date: string, notes?: string): Promise<WeightRecord> {
    if (value <= 0) {
      throw new Error('Peso deve ser maior que zero');
    }
    return await weightRepository.create({ value, date, notes });
  }

  /**
   * Remove um registro de peso
   */
  async removeRecord(id: string): Promise<boolean> {
    return await weightRepository.remove(id);
  }

  /**
   * Formata os dados para o componente de gráfico (Ordem cronológica)
   * Checklist: Estrutura para gráficos temporais
   */
  async getChartData(): Promise<WeightChartData[]> {
    const records = await weightRepository.getAll();
    return records
      .map((r) => ({
        label: new Date(r.date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        value: r.value,
      }))
      .reverse(); // Inverte para que o gráfico flua da esquerda para a direita
  }

  /**
   * Calcula o resumo e a tendência (ganho/perda)
   * Checklist: Cálculo de tendência
   */
  async getSummary(): Promise<WeightSummary | null> {
    const records = await weightRepository.getAll();
    if (records.length === 0) return null;

    const current = records[0].value;
    const previous = records.length > 1 ? records[1].value : current;
    const difference = Number((current - previous).toFixed(2));

    let trend: WeightTrend = "stable";
    if (difference < 0) trend = "loss";
    else if (difference > 0) trend = "gain";

    return { current, previous, difference, trend };
  }

  /**
   * Lógica para o lembrete mensal
   * Checklist: Lembrete mensal de pesagem
   */
  async checkMonthlyReminder(): Promise<{ shouldRemind: boolean; lastDays: number }> {
    const records = await weightRepository.getAll();
    if (records.length === 0) return { shouldRemind: true, lastDays: 0 };

    const lastDate = new Date(records[0].date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      shouldRemind: diffDays >= 30, // Lembrete após 30 dias
      lastDays: diffDays,
    };
  }
}

export const weightService = new WeightService();

import {
  WeightChartData,
  WeightRecord,
  WeightSummary,
  WeightTrend,
} from "../models/weight";
import { weightRepository } from "../repositories/weight-repository";

class WeightService {
  /**
   * Retorna todos os registros ordenados do mais recente para o mais antigo
   */
  getAllRecords(): WeightRecord[] {
    return weightRepository.getAll();
  }

  /**
   * Adiciona um novo registro e dispara a atualização dos dados
   */
  addRecord(value: number, date: string, notes?: string): WeightRecord {
    return weightRepository.create({ value, date, notes });
  }

  /**
   * Formata os dados para o componente de gráfico (Ordem cronológica)
   * Checklist: Estrutura para gráficos temporais
   */
  getChartData(): WeightChartData[] {
    const records = weightRepository.getAll();
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
  getSummary(): WeightSummary | null {
    const records = weightRepository.getAll();
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
  checkMonthlyReminder(): { shouldRemind: boolean; lastDays: number } {
    const records = weightRepository.getAll();
    if (records.length === 0) return { shouldRemind: true, lastDays: 0 };

    const lastDate = new Date(records[0].date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      shouldRemind:
        diffDays >= 0 /** se quiser mudar o tempo de aviso na tela */,
      lastDays: diffDays,
    };
  }
}

export const weightService = new WeightService();

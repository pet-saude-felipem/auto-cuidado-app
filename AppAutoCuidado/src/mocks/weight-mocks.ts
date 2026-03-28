import { WeightChartData, WeightRecord } from '../models/weight';

/**
 * Contrato do serviço de peso
 * implementado a logica - "Anderson"
 */

export const mockWeightRecords: WeightRecord[] = [
  { id: '1', value: 82.5, date: '2026-01-05', notes: 'Início do acompanhamento' },
  { id: '2', value: 81.8, date: '2026-01-12' },
  { id: '3', value: 82.0, date: '2026-01-19', notes: 'Semana com pouco exercício' },
  { id: '4', value: 81.2, date: '2026-01-26' },
  { id: '5', value: 80.5, date: '2026-02-02', notes: 'Dieta ajustada' },
  { id: '6', value: 80.0, date: '2026-02-09' },
  { id: '7', value: 79.6, date: '2026-02-16' },
];

export const getMockChartData = (): WeightChartData[] => 
  mockWeightRecords.map((r) => ({
    label: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    value: r.value,
  }));
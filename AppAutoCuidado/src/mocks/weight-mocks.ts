import { WeightRecord, WeightChartData, WeightSummary } from '@/src/models';

/**
 * Dados mockados de registros de peso
 * Criados para testes e desenvolvimento da interface
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

/**
 * Dados formatados para gráfico
 */
export const mockWeightChartData: WeightChartData[] = mockWeightRecords.map((r) => ({
  label: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  value: r.value,
}));

/**
 * Resumo mockado
 */
export const mockWeightSummary: WeightSummary = {
  current: 79.6,
  previous: 80.0,
  difference: -0.4,
  trend: 'loss',
};

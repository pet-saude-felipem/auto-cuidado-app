/**
 * Modelo de dados para registro de peso
 */
export interface WeightRecord {
  id: string;
  value: number; // peso em kg
  date: string; // ISO date string
  notes?: string; // anotações opcionais
}

/**
 * Dados formatados para exibição em gráfico
 */
export interface WeightChartData {
  label: string; // data formatada
  value: number; // peso
}

/**
 * Tendência de peso (ganho, perda ou estável)
 */
export type WeightTrend = 'gain' | 'loss' | 'stable';

/**
 * Resumo do monitoramento de peso
 */
export interface WeightSummary {
  current: number;
  previous: number;
  difference: number;
  trend: WeightTrend;
}

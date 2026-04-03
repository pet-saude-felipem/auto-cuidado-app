import { Medication, MedicationLog } from '@/src/models';

/**
 * Dados mockados de medicações
 */
export const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Losartana',
    dosage: '50mg',
    frequency: '1x',
    times: ['08:00'],
    notes: 'Tomar em jejum',
  },
  {
    id: '2',
    name: 'Metformina',
    dosage: '500mg',
    frequency: '2x',
    times: ['08:00', '20:00'],
  },
  {
    id: '3',
    name: 'Vitamina D',
    dosage: '2000UI',
    frequency: '1x',
    times: ['12:00'],
    notes: 'Tomar após o almoço',
  },
];

/**
 * Dados mockados do histórico de uso
 */
export const mockMedicationLogs: MedicationLog[] = [
  { id: '1', medicationId: '1', date: '2026-02-18', time: '08:00', status: 'taken' },
  { id: '2', medicationId: '2', date: '2026-02-18', time: '08:00', status: 'taken' },
  { id: '3', medicationId: '2', date: '2026-02-17', time: '20:00', status: 'missed' },
  { id: '4', medicationId: '3', date: '2026-02-17', time: '12:00', status: 'taken' },
  { id: '5', medicationId: '1', date: '2026-02-17', time: '08:00', status: 'taken' },
  { id: '6', medicationId: '2', date: '2026-02-17', time: '08:00', status: 'taken' },
  { id: '7', medicationId: '1', date: '2026-02-16', time: '08:00', status: 'taken' },
  { id: '8', medicationId: '3', date: '2026-02-16', time: '12:00', status: 'taken' },
];

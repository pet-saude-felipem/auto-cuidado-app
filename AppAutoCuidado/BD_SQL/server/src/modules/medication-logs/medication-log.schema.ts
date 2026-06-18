import { z } from 'zod';

export const MEDICATION_LOG_STATUS = ['taken', 'missed'] as const;

export const createMedicationLogSchema = z.object({
  medicationId: z.string().uuid('medicationId inválido.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM.'),
  status: z.enum(MEDICATION_LOG_STATUS),
});

export const medicationLogQuerySchema = z.object({
  days: z.coerce.number().int().positive().optional(),
  medicationId: z.string().uuid().optional(),
});

export type CreateMedicationLogInput = z.infer<typeof createMedicationLogSchema>;
export type MedicationLogQuery = z.infer<typeof medicationLogQuerySchema>;

export type MedicationLogResponse = {
  id: string;
  medicationId: string;
  date: string;
  time: string;
  status: string;
};

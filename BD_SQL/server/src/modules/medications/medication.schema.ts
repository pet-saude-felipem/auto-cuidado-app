import { z } from 'zod';

export const MEDICATION_FREQUENCIES = ['1x', '2x', '3x', '4x'] as const;

export const createMedicationSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.').max(100),
  dosage: z.string().trim().min(1, 'Dosagem é obrigatória.').max(50),
  frequency: z.enum(MEDICATION_FREQUENCIES),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM.')).min(1),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const updateMedicationSchema = createMedicationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Nenhum campo válido para atualizar.' },
);

export const medicationIdParamSchema = z.object({
  id: z.string().uuid('ID inválido.'),
});

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;

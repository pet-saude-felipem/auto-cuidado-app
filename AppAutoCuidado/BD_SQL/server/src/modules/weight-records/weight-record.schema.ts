import { z } from 'zod';

export const createWeightRecordSchema = z.object({
  value: z.coerce.number().positive('Peso deve ser maior que zero.'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD.')
    .optional(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const updateWeightRecordSchema = z
  .object({
    value: z.coerce.number().positive('Peso deve ser maior que zero.').optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD.')
      .optional(),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Nenhum campo para atualizar.',
  });

export const weightRecordIdParamSchema = z.object({
  id: z.string().uuid('ID inválido.'),
});

export type CreateWeightRecordInput = z.infer<typeof createWeightRecordSchema>;
export type UpdateWeightRecordInput = z.infer<typeof updateWeightRecordSchema>;

export type WeightRecordResponse = {
  id: string;
  value: number;
  date: string;
  notes: string | null;
};

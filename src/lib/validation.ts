import { z } from 'zod';
import { parseCalendarDate } from './dates.js';

const isoDateSchema = z.string().datetime().or(z.string().date());

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).default('#888888'),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debes enviar al menos un campo para actualizar',
);

export const transactionCreateSchema = z.object({
  categoryId: z.number().int().positive().nullable().optional(),
  amount: z.number().int(),
  description: z.string().trim().max(240).default(''),
  date: isoDateSchema.transform((value) => parseCalendarDate(value)),
});

export const transactionUpdateSchema = z.object({
  categoryId: z.number().int().positive().nullable().optional(),
  amount: z.number().int().optional(),
  description: z.string().trim().max(240).optional(),
  date: isoDateSchema.transform((value) => parseCalendarDate(value)).optional(),
}).refine(
  (value) => Object.keys(value).length > 0,
  'Debes enviar al menos un campo para actualizar',
);

export const budgetCreateSchema = z.object({
  categoryId: z.number().int().positive(),
  amount: z.number().int().positive(),
  month: z.number().int().min(200001).max(299912),
});

export const budgetUpdateSchema = budgetCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Debes enviar al menos un campo para actualizar',
);

export const userSettingsUpdateSchema = z.object({
  currency: z.enum(['CLP', 'USD']).optional(),
  monthStart: z.coerce.number().int().refine((value) => [1, 15, 25].includes(value), {
    message: 'El inicio financiero debe ser 1, 15 o 25',
  }).optional(),
  density: z.enum(['comfortable', 'compact']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.boolean().optional(),
  sidebarCollapsed: z.boolean().optional(),
}).refine(
  (value) => Object.keys(value).length > 0,
  'Debes enviar al menos un campo para actualizar',
);

export function parseJson<TSchema extends z.ZodTypeAny>(schema: TSchema, body: unknown) {
  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      ok: false as const,
      error: result.error.flatten(),
    };
  }

  return {
    ok: true as const,
    data: result.data as z.infer<TSchema>,
  };
}

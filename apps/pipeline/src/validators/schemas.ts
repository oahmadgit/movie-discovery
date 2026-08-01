import { z } from 'zod';

export const MovieRowSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().min(1),
  overview: z.string().optional().default(''),
  tagline: z.string().optional().default(''),
  release_date: z.string().optional(),
  budget: z.coerce.number().nullable().optional().transform((v) => (!v ? null : v)),
  revenue: z.coerce.number().nullable().optional().transform((v) => (!v ? null : v)),
  runtime: z.coerce.number().nullable().optional(),
  vote_average: z.coerce.number().min(0).max(10).optional().default(0),
  vote_count: z.coerce.number().int().min(0).optional().default(0),
  popularity: z.coerce.number().optional(),
  status: z.string().optional(),
  original_language: z.string().optional(),
});

export type MovieRow = z.infer<typeof MovieRowSchema>;

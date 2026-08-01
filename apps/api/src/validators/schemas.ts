import { z } from 'zod';

export const MoviesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['title', 'release_date', 'vote_average', 'revenue']).optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
  genre: z.string().trim().min(1).optional(),
  yearFrom: z.coerce.number().int().optional(),
  yearTo: z.coerce.number().int().optional(),
  minVotes: z.coerce.number().int().min(0).optional(),
});

export type MoviesQuery = z.infer<typeof MoviesQuerySchema>;

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const SearchQuerySchema = z.object({
  q: z.string().default(''),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { MovieRowSchema, type MovieRow } from '../validators/schemas.js';

// Sanitises Python repr-style dict/list strings (single quotes, None/True/False)
// into valid JSON so they can be parsed with JSON.parse().
export function sanitiseRepr(raw: string): string {
  return raw
    .replace(/'/g, '"')
    .replace(/\bNone\b/g, 'null')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');
}

export function parseJsonColumn(value: string): unknown[] {
  if (!value || value === '[]') return [];
  try {
    return JSON.parse(sanitiseRepr(value)) as unknown[];
  } catch {
    return [];
  }
}

export interface ParsedMovie extends MovieRow {
  imdb_id: string | null;
  release_year: number | null;
  genres: { id: number; name: string }[];
}

// csv-parse yields '' for empty cells; z.coerce.number() would treat '' as 0,
// so blank cells must become undefined before validation.
function cleanRow(row: Record<string, string>): Record<string, string | undefined> {
  const cleaned: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(row)) {
    cleaned[key] = value === '' ? undefined : value;
  }
  return cleaned;
}

function extractReleaseYear(releaseDate?: string): number | null {
  if (!releaseDate) return null;
  const year = Number(releaseDate.slice(0, 4));
  return Number.isInteger(year) ? year : null;
}

export function parseMoviesCsv(filePath: string): { movies: ParsedMovie[]; skipped: number } {
  const raw = readFileSync(filePath, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const movies: ParsedMovie[] = [];
  let skipped = 0;

  for (const row of records) {
    const result = MovieRowSchema.safeParse(cleanRow(row));
    if (!result.success) {
      skipped++;
      continue;
    }

    const genres = (parseJsonColumn(row.genres) as { id?: number; name?: string }[]).filter(
      (g): g is { id: number; name: string } => typeof g?.id === 'number' && typeof g?.name === 'string'
    );

    movies.push({
      ...result.data,
      imdb_id: row.imdb_id || null,
      release_year: extractReleaseYear(result.data.release_date),
      genres,
    });
  }

  return { movies, skipped };
}

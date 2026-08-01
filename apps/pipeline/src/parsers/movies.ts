import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import JSON5 from 'json5';
import { MovieRowSchema, type MovieRow } from '../validators/schemas.js';

// Normalises the loosely-JSON literal syntax used by the genres/cast/crew/
// keywords columns so JSON5 can parse them.
const LITERAL_KEYWORDS: readonly [literal: string, json: string][] = [
  ['None', 'null'],
  ['True', 'true'],
  ['False', 'false'],
];

export function normalizeLooseJson(raw: string): string {
  let out = '';
  let i = 0;

  while (i < raw.length) {
    const ch = raw[i];

    if (ch === "'" || ch === '"') {
      const quote = ch;
      out += ch;
      i++;
      while (i < raw.length) {
        const c = raw[i];
        out += c;
        i++;
        if (c === '\\' && i < raw.length) {
          out += raw[i];
          i++;
          continue;
        }
        if (c === quote) break;
      }
      continue;
    }

    const keyword = LITERAL_KEYWORDS.find(
      ([literal]) => raw.startsWith(literal, i) && !/\w/.test(raw[i + literal.length] ?? '')
    );
    if (keyword) {
      out += keyword[1];
      i += keyword[0].length;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

export function parseJsonColumn(value: string): unknown[] {
  if (!value || value === '[]') return [];
  try {
    return JSON5.parse(normalizeLooseJson(value)) as unknown[];
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

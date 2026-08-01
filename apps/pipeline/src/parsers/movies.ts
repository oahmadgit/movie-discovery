import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { MovieRowSchema, type MovieRow } from '../validators/schemas.js';

// Sanitises Python repr-style dict/list strings into valid JSON.
//
// A blind '-to-" replace breaks the moment a value contains an apostrophe:
// Python's repr() switches a string's *own* delimiter to " when the string
// contains a ' (e.g. character names like "Ellis Boyd 'Red' Redding" are
// repr'd with double quotes precisely so the inner 's don't need escaping).
// Globally swapping every ' for " then mangles that nesting. So instead of a
// regex we scan char-by-char, track whether we're inside a string and which
// quote character opened it, and only touch None/True/False outside strings.
export function sanitiseRepr(raw: string): string {
  let out = '';
  let structural = '';
  let i = 0;

  const flushStructural = () => {
    out += structural.replace(/\bNone\b/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
    structural = '';
  };

  while (i < raw.length) {
    const ch = raw[i];

    if (ch === "'" || ch === '"') {
      flushStructural();
      const quote = ch;
      let value = '';
      i++;
      while (i < raw.length) {
        const c = raw[i];
        if (c === '\\' && i + 1 < raw.length) {
          value += raw[i + 1];
          i += 2;
          continue;
        }
        if (c === quote) {
          i++;
          break;
        }
        value += c;
        i++;
      }
      out += JSON.stringify(value);
      continue;
    }

    structural += ch;
    i++;
  }
  flushStructural();

  return out.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
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

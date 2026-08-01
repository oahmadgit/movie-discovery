import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { parseJsonColumn } from './movies.js';

export interface CastMemberRow {
  movie_id: number;
  person_id: number;
  name: string;
  character: string;
  order: number;
}

export interface CrewMemberRow {
  movie_id: number;
  person_id: number;
  name: string;
  job: string;
  department: string;
}

const RELEVANT_CREW_JOBS = new Set([
  'Director',
  'Writer',
  'Screenplay',
  'Director of Photography',
  'Producer',
]);

export function parseCastColumn(movieId: number, raw: string): CastMemberRow[] {
  return (parseJsonColumn(raw) as any[])
    .filter((c) => typeof c?.id === 'number' && typeof c?.name === 'string')
    .slice(0, 20)
    .map((c) => ({
      movie_id: movieId,
      person_id: c.id,
      name: c.name,
      character: c.character ?? '',
      order: typeof c.order === 'number' ? c.order : 0,
    }));
}

export function parseCrewColumn(movieId: number, raw: string): CrewMemberRow[] {
  return (parseJsonColumn(raw) as any[])
    .filter((c) => typeof c?.id === 'number' && typeof c?.name === 'string' && typeof c?.job === 'string')
    .map((c) => ({
      movie_id: movieId,
      person_id: c.id,
      name: c.name,
      job: c.job,
      department: c.department ?? '',
    }));
}

export function parseCreditsCsv(filePath: string): { cast: CastMemberRow[]; crew: CrewMemberRow[] } {
  const raw = readFileSync(filePath, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const cast: CastMemberRow[] = [];
  const crew: CrewMemberRow[] = [];

  for (const row of records) {
    const movieId = Number(row.id);
    if (!Number.isInteger(movieId)) continue;

    cast.push(...parseCastColumn(movieId, row.cast));
    crew.push(...parseCrewColumn(movieId, row.crew).filter((c) => RELEVANT_CREW_JOBS.has(c.job)));
  }

  return { cast, crew };
}

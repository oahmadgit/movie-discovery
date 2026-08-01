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

interface RawCastEntry {
  id?: unknown;
  name?: unknown;
  character?: unknown;
  order?: unknown;
}

interface RawCrewEntry {
  id?: unknown;
  name?: unknown;
  job?: unknown;
  department?: unknown;
}

function isCastEntry(c: RawCastEntry): c is RawCastEntry & { id: number; name: string } {
  return typeof c?.id === 'number' && typeof c?.name === 'string';
}

function isCrewEntry(c: RawCrewEntry): c is RawCrewEntry & { id: number; name: string; job: string } {
  return typeof c?.id === 'number' && typeof c?.name === 'string' && typeof c?.job === 'string';
}

export function parseCastColumn(movieId: number, raw: string): { cast: CastMemberRow[]; skipped: number } {
  const entries = parseJsonColumn(raw) as RawCastEntry[];
  const valid = entries.filter(isCastEntry);
  const cast = valid.slice(0, 20).map((c) => ({
    movie_id: movieId,
    person_id: c.id,
    name: c.name,
    character: typeof c.character === 'string' ? c.character : '',
    order: typeof c.order === 'number' ? c.order : 0,
  }));
  return { cast, skipped: entries.length - valid.length };
}

export function parseCrewColumn(movieId: number, raw: string): { crew: CrewMemberRow[]; skipped: number } {
  const entries = parseJsonColumn(raw) as RawCrewEntry[];
  const valid = entries.filter(isCrewEntry);
  const crew = valid.map((c) => ({
    movie_id: movieId,
    person_id: c.id,
    name: c.name,
    job: c.job,
    department: typeof c.department === 'string' ? c.department : '',
  }));
  return { crew, skipped: entries.length - valid.length };
}

export function parseCreditsCsv(filePath: string): { cast: CastMemberRow[]; crew: CrewMemberRow[]; skipped: number } {
  const raw = readFileSync(filePath, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const cast: CastMemberRow[] = [];
  const crew: CrewMemberRow[] = [];
  let skipped = 0;

  for (const row of records) {
    const movieId = Number(row.id);
    if (!Number.isInteger(movieId)) continue;

    const castResult = parseCastColumn(movieId, row.cast);
    const crewResult = parseCrewColumn(movieId, row.crew);

    cast.push(...castResult.cast);
    crew.push(...crewResult.crew.filter((c) => RELEVANT_CREW_JOBS.has(c.job)));
    skipped += castResult.skipped + crewResult.skipped;
  }

  return { cast, crew, skipped };
}

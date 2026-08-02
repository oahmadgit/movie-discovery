import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

// Maps the ratings file's own movie id scheme to the primary id used everywhere else.
export type LinksMap = Map<number, number>;

export function buildLinksMap(rows: Array<{ movieId: string; tmdbId: string }>): LinksMap {
  const map: LinksMap = new Map();
  for (const row of rows) {
    const ratingsId = Number(row.movieId);
    const primaryId = Number(row.tmdbId);
    if (Number.isFinite(ratingsId) && Number.isFinite(primaryId) && row.tmdbId !== '') {
      map.set(ratingsId, primaryId);
    }
  }
  return map;
}

export function parseLinksCsv(filePath: string): LinksMap {
  const raw = readFileSync(filePath, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Array<{ movieId: string; tmdbId: string }>;

  return buildLinksMap(records);
}

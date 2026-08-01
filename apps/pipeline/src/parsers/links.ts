import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

// links.csv columns: movieId (MovieLens id), imdbId, tmdbId (TMDB id, sometimes blank)
export type LinksMap = Map<number, number>;

export function buildLinksMap(rows: Array<{ movieId: string; tmdbId: string }>): LinksMap {
  const map: LinksMap = new Map();
  for (const row of rows) {
    const movieLensId = Number(row.movieId);
    const tmdbId = Number(row.tmdbId);
    if (Number.isFinite(movieLensId) && Number.isFinite(tmdbId) && row.tmdbId !== '') {
      map.set(movieLensId, tmdbId);
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

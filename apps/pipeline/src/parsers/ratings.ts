import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import type { LinksMap } from './links.js';

export interface RatingRow {
  user_id: number;
  movie_id: number;
  rating: number;
  timestamp: number;
}

// ratings_small.csv's movieId is a MovieLens id, not a TMDB id — must be
// translated via the links.csv-derived map before it can reference movies(id).
export function translateRating(
  row: { userId: string; movieId: string; rating: string; timestamp: string },
  linksMap: LinksMap
): RatingRow | null {
  const tmdbId = linksMap.get(Number(row.movieId));
  if (tmdbId === undefined) return null;

  return {
    user_id: Number(row.userId),
    movie_id: tmdbId,
    rating: Number(row.rating),
    timestamp: Number(row.timestamp),
  };
}

export function parseRatingsCsv(filePath: string, linksMap: LinksMap): RatingRow[] {
  const raw = readFileSync(filePath, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Array<{ userId: string; movieId: string; rating: string; timestamp: string }>;

  const ratings: RatingRow[] = [];
  for (const row of records) {
    const rating = translateRating(row, linksMap);
    if (rating) ratings.push(rating);
  }

  return ratings;
}

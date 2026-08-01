import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import type { LinksMap } from './links.js';

export interface RatingRow {
  user_id: number;
  movie_id: number;
  rating: number;
  timestamp: number;
}

// movieId here uses ratings' own id scheme, translated via linksMap before it can reference movies(id).
export function translateRating(
  row: { userId: string; movieId: string; rating: string; timestamp: string },
  linksMap: LinksMap
): RatingRow | null {
  const primaryId = linksMap.get(Number(row.movieId));
  if (primaryId === undefined) return null;

  return {
    user_id: Number(row.userId),
    movie_id: primaryId,
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

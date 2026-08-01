import type Database from 'better-sqlite3';
import type { Genre } from '../types/index.js';

export function genresForMovies(db: Database.Database, ids: number[]): Map<number, Genre[]> {
  const map = new Map<number, Genre[]>();
  if (ids.length === 0) return map;

  const placeholders = ids.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT movie_id, genre_id, name FROM genres WHERE movie_id IN (${placeholders})`)
    .all(...ids) as { movie_id: number; genre_id: number; name: string }[];

  for (const row of rows) {
    const list = map.get(row.movie_id) ?? [];
    list.push({ genre_id: row.genre_id, name: row.name });
    map.set(row.movie_id, list);
  }
  return map;
}

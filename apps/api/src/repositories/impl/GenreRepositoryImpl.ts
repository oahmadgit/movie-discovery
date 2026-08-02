import type Database from 'better-sqlite3';
import type { Genre } from '../../types/domain.js';
import type { GenreRepository } from '../GenreRepository.js';

export class GenreRepositoryImpl implements GenreRepository {
  constructor(private db: Database.Database) {}

  findByMovieIds(movieIds: number[]): Map<number, Genre[]> {
    const map = new Map<number, Genre[]>();
    if (movieIds.length === 0) return map;

    const placeholders = movieIds.map(() => '?').join(',');
    const rows = this.db
      .prepare(`SELECT movie_id, genre_id, name FROM genres WHERE movie_id IN (${placeholders})`)
      .all(...movieIds) as { movie_id: number; genre_id: number; name: string }[];

    for (const row of rows) {
      const list = map.get(row.movie_id) ?? [];
      list.push({ genre_id: row.genre_id, name: row.name });
      map.set(row.movie_id, list);
    }
    return map;
  }

  findGenreIdsByMovieIds(movieIds: number[]): Map<number, Set<number>> {
    const map = new Map<number, Set<number>>();
    if (movieIds.length === 0) return map;

    const placeholders = movieIds.map(() => '?').join(',');
    const rows = this.db
      .prepare(`SELECT movie_id, genre_id FROM genres WHERE movie_id IN (${placeholders})`)
      .all(...movieIds) as { movie_id: number; genre_id: number }[];

    for (const row of rows) {
      const set = map.get(row.movie_id) ?? new Set<number>();
      set.add(row.genre_id);
      map.set(row.movie_id, set);
    }
    return map;
  }

  findDistinctNames(): string[] {
    const rows = this.db.prepare('SELECT DISTINCT name FROM genres ORDER BY name').all() as { name: string }[];
    return rows.map((r) => r.name);
  }
}

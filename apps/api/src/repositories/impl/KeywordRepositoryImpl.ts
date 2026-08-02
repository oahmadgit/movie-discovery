import type Database from 'better-sqlite3';
import type { Keyword } from '../../types/domain.js';
import type { KeywordRepository } from '../KeywordRepository.js';

export class KeywordRepositoryImpl implements KeywordRepository {
  constructor(private db: Database.Database) {}

  findByMovieId(movieId: number): Keyword[] {
    return this.db.prepare('SELECT keyword_id, name FROM keywords WHERE movie_id = ?').all(movieId) as Keyword[];
  }

  findKeywordIdsByMovieIds(movieIds: number[]): Map<number, Set<number>> {
    const map = new Map<number, Set<number>>();
    if (movieIds.length === 0) return map;

    const placeholders = movieIds.map(() => '?').join(',');
    const rows = this.db
      .prepare(`SELECT movie_id, keyword_id FROM keywords WHERE movie_id IN (${placeholders})`)
      .all(...movieIds) as { movie_id: number; keyword_id: number }[];

    for (const row of rows) {
      const set = map.get(row.movie_id) ?? new Set<number>();
      set.add(row.keyword_id);
      map.set(row.movie_id, set);
    }
    return map;
  }
}

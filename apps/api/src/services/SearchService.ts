import type Database from 'better-sqlite3';
import type { MovieRow, SearchResult } from '../types/index.js';
import { genresForMovies } from '../repositories/genres.js';

export class SearchService {
  constructor(private db: Database.Database) {}

  search(query: string, limit = 20): SearchResult[] {
    if (!query.trim()) return [];

    // Strip FTS5 operator syntax so user input can't be read as a query language.
    const sanitised = query.replace(/["*\-():^]/g, ' ').trim().replace(/\s+/g, ' ');
    if (!sanitised) return [];

    const rows = this.db
      .prepare(
        `SELECT m.*, (-fts.rank) AS relevance_score
         FROM movies_fts fts
         JOIN movies m ON m.id = fts.rowid
         WHERE movies_fts MATCH ?
         ORDER BY fts.rank
         LIMIT ?`
      )
      .all(`${sanitised}*`, limit) as (MovieRow & { relevance_score: number })[];

    const genresByMovie = genresForMovies(this.db, rows.map((r) => r.id));
    return rows.map((row) => ({ ...row, genres: genresByMovie.get(row.id) ?? [] }));
  }
}

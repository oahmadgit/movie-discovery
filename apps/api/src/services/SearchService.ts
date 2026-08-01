import type Database from 'better-sqlite3';

interface MovieRecord {
  id: number;
  [key: string]: unknown;
}

export class SearchService {
  constructor(private db: Database.Database) {}

  search(query: string, limit = 20): unknown[] {
    if (!query.trim()) return [];

    // Strip FTS5 syntax characters (", *, -, (, ), :, ^) so user input can't
    // be interpreted as query operators — this is a search box, not a query language.
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
      .all(`${sanitised}*`, limit) as MovieRecord[];

    const genresByMovie = this.genresForMovies(rows.map((r) => r.id));
    return rows.map((row) => ({ ...row, genres: genresByMovie.get(row.id) ?? [] }));
  }

  // Mirrors MovieService's batch genre lookup — kept local rather than shared
  // since the two services intentionally have no other coupling.
  private genresForMovies(ids: number[]): Map<number, { genre_id: number; name: string }[]> {
    const map = new Map<number, { genre_id: number; name: string }[]>();
    if (ids.length === 0) return map;

    const placeholders = ids.map(() => '?').join(',');
    const rows = this.db
      .prepare(`SELECT movie_id, genre_id, name FROM genres WHERE movie_id IN (${placeholders})`)
      .all(...ids) as { movie_id: number; genre_id: number; name: string }[];

    for (const row of rows) {
      const list = map.get(row.movie_id) ?? [];
      list.push({ genre_id: row.genre_id, name: row.name });
      map.set(row.movie_id, list);
    }
    return map;
  }
}

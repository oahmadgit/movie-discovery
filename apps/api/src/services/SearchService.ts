import type Database from 'better-sqlite3';

export class SearchService {
  constructor(private db: Database.Database) {}

  search(query: string, limit = 20): unknown[] {
    if (!query.trim()) return [];

    // Strip FTS5 syntax characters (", *, -, (, ), :, ^) so user input can't
    // be interpreted as query operators — this is a search box, not a query language.
    const sanitised = query.replace(/["*\-():^]/g, ' ').trim().replace(/\s+/g, ' ');
    if (!sanitised) return [];

    return this.db
      .prepare(
        `SELECT m.*, (-fts.rank) AS relevance_score
         FROM movies_fts fts
         JOIN movies m ON m.id = fts.rowid
         WHERE movies_fts MATCH ?
         ORDER BY fts.rank
         LIMIT ?`
      )
      .all(`${sanitised}*`, limit);
  }
}

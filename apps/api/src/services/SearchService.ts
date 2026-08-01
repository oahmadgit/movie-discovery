import type Database from 'better-sqlite3';

export class SearchService {
  constructor(private db: Database.Database) {}

  // TODO(api): sanitise FTS special characters (", *, -) before MATCH.
  search(query: string, limit = 20): unknown[] {
    if (!query.trim()) return [];

    const sanitised = query.replace(/["*]/g, '').trim();
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

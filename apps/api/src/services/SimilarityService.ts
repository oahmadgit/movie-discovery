import type Database from 'better-sqlite3';

function jaccardScore(a: Set<number>, b: Set<number>, weight: number): number {
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : (intersection / union) * weight;
}

export class SimilarityService {
  constructor(private db: Database.Database) {}

  private genreIds(movieId: number): Set<number> {
    const rows = this.db.prepare('SELECT genre_id FROM genres WHERE movie_id = ?').all(movieId) as { genre_id: number }[];
    return new Set(rows.map((r) => r.genre_id));
  }

  private keywordIds(movieId: number): Set<number> {
    const rows = this.db.prepare('SELECT keyword_id FROM keywords WHERE movie_id = ?').all(movieId) as { keyword_id: number }[];
    return new Set(rows.map((r) => r.keyword_id));
  }

  getSimilar(movieId: number, limit = 10): unknown[] {
    const sourceGenres = this.genreIds(movieId);
    const sourceKeywords = this.keywordIds(movieId);
    if (sourceGenres.size === 0 && sourceKeywords.size === 0) return [];

    const candidates = this.db
      .prepare(
        `SELECT DISTINCT m.* FROM movies m
         JOIN genres g ON g.movie_id = m.id
         WHERE g.genre_id IN (${[...sourceGenres].map(() => '?').join(',') || 'NULL'})
         AND m.id != ?`
      )
      .all(...sourceGenres, movieId) as { id: number }[];

    const results = candidates
      .map((c) => ({
        ...c,
        score:
          jaccardScore(sourceGenres, this.genreIds(c.id), 0.6) +
          jaccardScore(sourceKeywords, this.keywordIds(c.id), 0.4),
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Every Movie-shaped API response includes `genres` (list, search); the
    // client's MovieCard relies on it unconditionally, so this must too.
    const genresByMovie = this.genresForMovies(results.map((r) => r.id));
    return results.map((r) => ({ ...r, genres: genresByMovie.get(r.id) ?? [] }));
  }

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

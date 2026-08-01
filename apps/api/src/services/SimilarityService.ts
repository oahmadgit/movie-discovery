import type Database from 'better-sqlite3';
import type { MovieRow, SimilarMovie } from '../types/index.js';
import { genresForMovies } from '../repositories/genres.js';

function jaccardScore(a: Set<number>, b: Set<number>, weight: number): number {
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : (intersection / union) * weight;
}

function idSetsByMovie(rows: { movie_id: number; id: number }[]): Map<number, Set<number>> {
  const map = new Map<number, Set<number>>();
  for (const row of rows) {
    const set = map.get(row.movie_id) ?? new Set<number>();
    set.add(row.id);
    map.set(row.movie_id, set);
  }
  return map;
}

export class SimilarityService {
  constructor(private db: Database.Database) {}

  private genreIdsByMovie(movieIds: number[]): Map<number, Set<number>> {
    if (movieIds.length === 0) return new Map();
    const placeholders = movieIds.map(() => '?').join(',');
    const rows = this.db
      .prepare(`SELECT movie_id, genre_id AS id FROM genres WHERE movie_id IN (${placeholders})`)
      .all(...movieIds) as { movie_id: number; id: number }[];
    return idSetsByMovie(rows);
  }

  private keywordIdsByMovie(movieIds: number[]): Map<number, Set<number>> {
    if (movieIds.length === 0) return new Map();
    const placeholders = movieIds.map(() => '?').join(',');
    const rows = this.db
      .prepare(`SELECT movie_id, keyword_id AS id FROM keywords WHERE movie_id IN (${placeholders})`)
      .all(...movieIds) as { movie_id: number; id: number }[];
    return idSetsByMovie(rows);
  }

  getSimilar(movieId: number, limit = 10): SimilarMovie[] {
    const sourceGenres = this.genreIdsByMovie([movieId]).get(movieId) ?? new Set<number>();
    const sourceKeywords = this.keywordIdsByMovie([movieId]).get(movieId) ?? new Set<number>();
    if (sourceGenres.size === 0 && sourceKeywords.size === 0) return [];

    const candidates = this.db
      .prepare(
        `SELECT DISTINCT m.* FROM movies m
         JOIN genres g ON g.movie_id = m.id
         WHERE g.genre_id IN (${[...sourceGenres].map(() => '?').join(',') || 'NULL'})
         AND m.id != ?`
      )
      .all(...sourceGenres, movieId) as MovieRow[];

    const candidateIds = candidates.map((c) => c.id);
    const candidateGenres = this.genreIdsByMovie(candidateIds);
    const candidateKeywords = this.keywordIdsByMovie(candidateIds);

    const results = candidates
      .map((c) => ({
        ...c,
        score:
          jaccardScore(sourceGenres, candidateGenres.get(c.id) ?? new Set(), 0.6) +
          jaccardScore(sourceKeywords, candidateKeywords.get(c.id) ?? new Set(), 0.4),
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // MovieCard on the client assumes every result has `genres`
    const genresByMovie = genresForMovies(this.db, results.map((r) => r.id));
    return results.map((r) => ({ ...r, genres: genresByMovie.get(r.id) ?? [] }));
  }
}

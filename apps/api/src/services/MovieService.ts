import type Database from 'better-sqlite3';
import type { MoviesQuery } from '../validators/schemas.js';
import type { Pagination } from '../types/index.js';

const SORT_COLUMNS: Record<string, string> = {
  title: 'm.title',
  release_date: 'm.release_date',
  vote_average: 'm.vote_average',
  revenue: 'm.revenue',
};

const DETAIL_CREW_JOBS = ['Director', 'Writer', 'Screenplay', 'Director of Photography', 'Producer'];

interface MovieRecord {
  id: number;
  [key: string]: unknown;
}

export class MovieService {
  constructor(private db: Database.Database) {}

  list(query: MoviesQuery): { data: unknown[]; pagination: Pagination } {
    const col = SORT_COLUMNS[query.sort ?? 'title'] ?? 'm.title';
    const dir = query.order === 'desc' ? 'DESC' : 'ASC';

    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (query.genre) {
      conditions.push('EXISTS (SELECT 1 FROM genres g WHERE g.movie_id = m.id AND LOWER(g.name) = LOWER(@genre))');
      params.genre = query.genre;
    }
    if (query.yearFrom != null) {
      conditions.push('m.release_year >= @yearFrom');
      params.yearFrom = query.yearFrom;
    }
    if (query.yearTo != null) {
      conditions.push('m.release_year <= @yearTo');
      params.yearTo = query.yearTo;
    }
    if (query.minVotes != null) {
      conditions.push('m.vote_count >= @minVotes');
      params.minVotes = query.minVotes;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT m.* FROM movies m ${where} ORDER BY ${col} ${dir} LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit: query.limit, offset: (query.page - 1) * query.limit }) as MovieRecord[];

    const { total } = this.db.prepare(`SELECT COUNT(*) as total FROM movies m ${where}`).get(params) as {
      total: number;
    };

    const genresByMovie = this.genresForMovies(rows.map((r) => r.id));
    const data = rows.map((row) => ({ ...row, genres: genresByMovie.get(row.id) ?? [] }));

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  getById(id: number): unknown | null {
    const movie = this.db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as MovieRecord | undefined;
    if (!movie) return null;

    const genres = this.db.prepare('SELECT genre_id, name FROM genres WHERE movie_id = ?').all(id);

    const cast = this.db
      .prepare(
        `SELECT person_id, name, character, "order"
         FROM cast_members WHERE movie_id = ?
         ORDER BY "order" LIMIT 20`
      )
      .all(id);

    const crew = this.db
      .prepare(
        `SELECT person_id, name, job, department
         FROM crew_members WHERE movie_id = ?
         AND job IN (${DETAIL_CREW_JOBS.map(() => '?').join(',')})`
      )
      .all(id, ...DETAIL_CREW_JOBS);

    const keywords = this.db.prepare('SELECT keyword_id, name FROM keywords WHERE movie_id = ?').all(id);

    const ratingStats = this.db
      .prepare(
        `SELECT COUNT(*) as rating_count, ROUND(AVG(rating), 2) as avg_rating
         FROM ratings WHERE movie_id = ?`
      )
      .get(id);

    return { ...movie, genres, cast, crew, keywords, ratingStats };
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

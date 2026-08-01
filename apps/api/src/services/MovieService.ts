import type Database from 'better-sqlite3';
import type { MoviesQuery } from '../validators/schemas.js';
import type { Pagination, MovieRow, MovieListItem, MovieDetail, CastMember, CrewMember, Keyword, RatingStats } from '../types/index.js';
import { genresForMovies } from '../repositories/genres.js';

const SORT_COLUMNS: Record<string, string> = {
  title: 'm.title',
  release_date: 'm.release_date',
  vote_average: 'm.vote_average',
  revenue: 'm.revenue',
};

const DETAIL_CREW_JOBS = ['Director', 'Writer', 'Screenplay', 'Director of Photography', 'Producer'];

export class MovieService {
  constructor(private db: Database.Database) {}

  list(query: MoviesQuery): { data: MovieListItem[]; pagination: Pagination } {
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
      .all({ ...params, limit: query.limit, offset: (query.page - 1) * query.limit }) as MovieRow[];

    const { total } = this.db.prepare(`SELECT COUNT(*) as total FROM movies m ${where}`).get(params) as {
      total: number;
    };

    const genresByMovie = genresForMovies(this.db, rows.map((r) => r.id));
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

  getById(id: number): MovieDetail | null {
    const movie = this.db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as MovieRow | undefined;
    if (!movie) return null;

    const genres = this.db.prepare('SELECT genre_id, name FROM genres WHERE movie_id = ?').all(id) as MovieDetail['genres'];

    const cast = this.db
      .prepare(
        `SELECT person_id, name, character, "order"
         FROM cast_members WHERE movie_id = ?
         ORDER BY "order" LIMIT 20`
      )
      .all(id) as CastMember[];

    const crew = this.db
      .prepare(
        `SELECT person_id, name, job, department
         FROM crew_members WHERE movie_id = ?
         AND job IN (${DETAIL_CREW_JOBS.map(() => '?').join(',')})`
      )
      .all(id, ...DETAIL_CREW_JOBS) as CrewMember[];

    const keywords = this.db.prepare('SELECT keyword_id, name FROM keywords WHERE movie_id = ?').all(id) as Keyword[];

    const ratingStats = this.db
      .prepare(
        `SELECT COUNT(*) as rating_count, ROUND(AVG(rating), 2) as avg_rating
         FROM ratings WHERE movie_id = ?`
      )
      .get(id) as RatingStats;

    return { ...movie, genres, cast, crew, keywords, ratingStats };
  }
}

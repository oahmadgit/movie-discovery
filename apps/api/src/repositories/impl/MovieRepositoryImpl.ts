import type Database from 'better-sqlite3';
import type { MovieRow } from '../../types/domain.js';
import type { MovieRepository, MovieFilter, MovieSort, MoviePage } from '../MovieRepository.js';

const SORT_COLUMNS: Record<MovieSort['column'], string> = {
  title: 'm.title',
  release_date: 'm.release_date',
  vote_average: 'm.vote_average',
  revenue: 'm.revenue',
};

function buildWhere(filter: MovieFilter): { where: string; params: Record<string, unknown> } {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filter.genre) {
    conditions.push('EXISTS (SELECT 1 FROM genres g WHERE g.movie_id = m.id AND LOWER(g.name) = LOWER(@genre))');
    params.genre = filter.genre;
  }
  if (filter.yearFrom != null) {
    conditions.push('m.release_year >= @yearFrom');
    params.yearFrom = filter.yearFrom;
  }
  if (filter.yearTo != null) {
    conditions.push('m.release_year <= @yearTo');
    params.yearTo = filter.yearTo;
  }
  if (filter.minVotes != null) {
    conditions.push('m.vote_count >= @minVotes');
    params.minVotes = filter.minVotes;
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

export class MovieRepositoryImpl implements MovieRepository {
  constructor(private db: Database.Database) {}

  findMany(filter: MovieFilter, sort: MovieSort, page: MoviePage): MovieRow[] {
    const { where, params } = buildWhere(filter);
    const col = SORT_COLUMNS[sort.column];
    const dir = sort.direction === 'desc' ? 'DESC' : 'ASC';

    return this.db
      .prepare(`SELECT m.* FROM movies m ${where} ORDER BY ${col} ${dir} LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit: page.limit, offset: page.offset }) as MovieRow[];
  }

  count(filter: MovieFilter): number {
    const { where, params } = buildWhere(filter);
    const { total } = this.db.prepare(`SELECT COUNT(*) as total FROM movies m ${where}`).get(params) as {
      total: number;
    };
    return total;
  }

  findById(id: number): MovieRow | null {
    const row = this.db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as MovieRow | undefined;
    return row ?? null;
  }

  searchFullText(sanitisedQuery: string, limit: number): (MovieRow & { relevance_score: number })[] {
    return this.db
      .prepare(
        `SELECT m.*, (-fts.rank) AS relevance_score
         FROM movies_fts fts
         JOIN movies m ON m.id = fts.rowid
         WHERE movies_fts MATCH ?
         ORDER BY fts.rank
         LIMIT ?`
      )
      .all(`${sanitisedQuery}*`, limit) as (MovieRow & { relevance_score: number })[];
  }

  findByGenreIds(genreIds: number[], excludeId: number): MovieRow[] {
    return this.db
      .prepare(
        `SELECT DISTINCT m.* FROM movies m
         JOIN genres g ON g.movie_id = m.id
         WHERE g.genre_id IN (${genreIds.map(() => '?').join(',') || 'NULL'})
         AND m.id != ?`
      )
      .all(...genreIds, excludeId) as MovieRow[];
  }
}

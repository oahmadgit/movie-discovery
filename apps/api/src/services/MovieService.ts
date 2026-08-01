import type Database from 'better-sqlite3';
import type { MoviesQuery, Pagination } from '../types/index.js';

const SORT_COLUMNS: Record<string, string> = {
  title: 'm.title',
  release_date: 'm.release_date',
  vote_average: 'm.vote_average',
  revenue: 'm.revenue',
};

export class MovieService {
  constructor(private db: Database.Database) {}

  // TODO(api): implement filtering (genre, year range, min votes) and pagination.
  list(query: MoviesQuery): { data: unknown[]; pagination: Pagination } {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const col = SORT_COLUMNS[query.sort ?? 'title'] ?? 'm.title';
    const dir = query.order === 'desc' ? 'DESC' : 'ASC';

    const rows = this.db
      .prepare(`SELECT * FROM movies m ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`)
      .all(limit, (page - 1) * limit);

    const { total } = this.db.prepare('SELECT COUNT(*) as total FROM movies').get() as { total: number };

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // TODO(api): join cast, crew, keywords, and rating stats per IMPLEMENTATION_PLAN.md #5.
  getById(id: number): unknown | null {
    const movie = this.db.prepare('SELECT * FROM movies WHERE id = ?').get(id);
    return movie ?? null;
  }
}

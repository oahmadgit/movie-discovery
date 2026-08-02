import type Database from 'better-sqlite3';
import type { RatingStats } from '../../types/domain.js';
import type { RatingRepository } from '../RatingRepository.js';

export class RatingRepositoryImpl implements RatingRepository {
  constructor(private db: Database.Database) {}

  statsByMovieId(movieId: number): RatingStats {
    return this.db
      .prepare(
        `SELECT COUNT(*) as rating_count, ROUND(AVG(rating), 2) as avg_rating
         FROM ratings WHERE movie_id = ?`
      )
      .get(movieId) as RatingStats;
  }
}

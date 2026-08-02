import type { RatingStats } from '../types/domain.js';

export interface RatingRepository {
  statsByMovieId(movieId: number): RatingStats;
}

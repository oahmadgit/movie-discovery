import type { Keyword } from '../types/domain.js';

export interface KeywordRepository {
  findByMovieId(movieId: number): Keyword[];
  findKeywordIdsByMovieIds(movieIds: number[]): Map<number, Set<number>>;
}

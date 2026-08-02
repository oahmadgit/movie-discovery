import type { Genre } from '../types/domain.js';

export interface GenreRepository {
  findByMovieIds(movieIds: number[]): Map<number, Genre[]>;
  findGenreIdsByMovieIds(movieIds: number[]): Map<number, Set<number>>;
  findDistinctNames(): string[];
}

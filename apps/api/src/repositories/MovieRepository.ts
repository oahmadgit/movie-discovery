import type { MovieRow } from '../types/domain.js';

export interface MovieFilter {
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  minVotes?: number;
}

export interface MovieSort {
  column: 'title' | 'release_date' | 'vote_average' | 'revenue';
  direction: 'asc' | 'desc';
}

export interface MoviePage {
  limit: number;
  offset: number;
}

export interface MovieRepository {
  findMany(filter: MovieFilter, sort: MovieSort, page: MoviePage): MovieRow[];
  count(filter: MovieFilter): number;
  findById(id: number): MovieRow | null;
  searchFullText(sanitisedQuery: string, limit: number): (MovieRow & { relevance_score: number })[];
  findByGenreIds(genreIds: number[], excludeId: number): MovieRow[];
}

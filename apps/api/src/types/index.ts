export interface MoviesQuery {
  page?: number;
  limit?: number;
  sort?: 'title' | 'release_date' | 'vote_average' | 'revenue';
  order?: 'asc' | 'desc';
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  minVotes?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

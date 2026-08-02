export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Genre {
  genre_id: number;
  name: string;
}

export interface MovieRow {
  id: number;
  title: string;
  overview: string | null;
  tagline: string | null;
  release_date: string | null;
  release_year: number | null;
  vote_average: number | null;
  vote_count: number | null;
  revenue?: number | null;
  [key: string]: unknown;
}

export interface MovieListItem extends MovieRow {
  genres: Genre[];
}

export interface CastMember {
  person_id: number;
  name: string;
  character: string;
  order: number;
}

export interface CrewMember {
  person_id: number;
  name: string;
  job: string;
  department: string;
}

export interface Keyword {
  keyword_id: number;
  name: string;
}

export interface RatingStats {
  rating_count: number;
  avg_rating: number | null;
}

export interface MovieDetail extends MovieRow {
  genres: Genre[];
  cast: CastMember[];
  crew: CrewMember[];
  keywords: Keyword[];
  ratingStats: RatingStats;
}

export interface SearchResult extends MovieRow {
  genres: Genre[];
  relevance_score: number;
}

export interface SimilarMovie extends MovieRow {
  genres: Genre[];
  score: number;
}

export interface TopGenreStat {
  genre: string;
  decade: string;
  movie_count: number;
  avg_rating: number | null;
  avg_revenue: number | null;
}

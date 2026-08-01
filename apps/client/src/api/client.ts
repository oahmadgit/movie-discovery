const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface Genre {
  genre_id: number;
  name: string;
}

export interface Movie {
  id: number;
  imdb_id: string | null;
  title: string;
  overview: string | null;
  tagline: string | null;
  release_date: string | null;
  release_year: number | null;
  budget: number | null;
  revenue: number | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  popularity: number | null;
  status: string | null;
  original_language: string | null;
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

export interface MovieDetail extends Movie {
  cast: CastMember[];
  crew: CrewMember[];
  keywords: Keyword[];
  ratingStats: RatingStats;
}

export interface SimilarMovie extends Movie {
  score: number;
}

export interface MoviesResponse {
  data: Movie[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface GenreAnalytics {
  genre: string;
  decade: string;
  movie_count: number;
  avg_rating: number;
  avg_revenue: number | null;
}

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  movies: (params: Record<string, string>) => apiFetch<MoviesResponse>('/api/movies', params),
  movie: (id: number) => apiFetch<MovieDetail>(`/api/movies/${id}`),
  similar: (id: number) => apiFetch<SimilarMovie[]>(`/api/movies/${id}/similar`),
  search: (q: string) => apiFetch<Movie[]>('/api/search', { q }),
  analytics: () => apiFetch<GenreAnalytics[]>('/api/analytics/top-genres'),
};

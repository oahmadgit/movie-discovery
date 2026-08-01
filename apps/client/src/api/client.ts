const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface Movie {
  id: number;
  title: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  [key: string]: unknown;
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
  movie: (id: number) => apiFetch<Movie>(`/api/movies/${id}`),
  similar: (id: number) => apiFetch<Movie[]>(`/api/movies/${id}/similar`),
  search: (q: string) => apiFetch<Movie[]>('/api/search', { q }),
  analytics: () => apiFetch<GenreAnalytics[]>('/api/analytics/top-genres'),
};

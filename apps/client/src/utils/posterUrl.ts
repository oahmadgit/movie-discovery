const POSTER_CDN_BASE = 'https://image.tmdb.org/t/p/w342';

export function posterUrl(posterPath: string | null | undefined): string | null {
  return posterPath ? `${POSTER_CDN_BASE}${posterPath}` : null;
}

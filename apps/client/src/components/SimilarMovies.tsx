import type { Movie } from '../api/client';
import { MovieGrid } from './MovieGrid';

export function SimilarMovies({ movies }: { movies: Movie[] }) {
  if (!movies?.length) return <p>No similar movies found.</p>;
  return <MovieGrid movies={movies} />;
}

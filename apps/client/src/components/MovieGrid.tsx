import type { Movie } from '../api/client';
import { MovieCard } from './MovieCard';

export function MovieGrid({ movies }: { movies: Movie[] }) {
  if (movies.length === 0) return <p>No movies found.</p>;

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

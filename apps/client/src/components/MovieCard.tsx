import { Link } from 'react-router-dom';
import type { Movie } from '../api/client';

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <h3>{movie.title}</h3>
      {movie.release_date && <p>{movie.release_date.slice(0, 4)}</p>}
      {movie.vote_average != null && <p>★ {movie.vote_average}</p>}
    </Link>
  );
}

import { Link } from 'react-router-dom';
import type { Movie } from '../api/client';

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <h3>{movie.title}</h3>
      {movie.release_year != null && <p>{movie.release_year}</p>}
      {movie.vote_average != null && <p>★ {movie.vote_average.toFixed(1)}</p>}
      {movie.genres?.length > 0 && (
        <div className="genre-tags">
          {movie.genres.slice(0, 3).map((g) => (
            <span key={g.genre_id} className="genre-tag">
              {g.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

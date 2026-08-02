import { Link } from 'react-router-dom';
import type { Movie } from '../api/client';
import { Poster } from './Poster';

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <div className="movie-card-poster">
        <Poster posterPath={movie.poster_path} title={movie.title} />
      </div>
      <div className="movie-card-body">
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
      </div>
    </Link>
  );
}

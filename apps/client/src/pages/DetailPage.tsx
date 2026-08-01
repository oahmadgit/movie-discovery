import { Link, useParams } from 'react-router-dom';
import { useMovie } from '../hooks/useMovie';
import { useSimilar } from '../hooks/useSimilar';
import { CastList } from '../components/CastList';
import { CrewList } from '../components/CrewList';
import { KeywordList } from '../components/KeywordList';
import { SimilarMovies } from '../components/SimilarMovies';

export function DetailPage() {
  const { id } = useParams();
  const movieId = Number(id);
  const { data: movie, isLoading, isError, error } = useMovie(movieId);
  const { data: similar } = useSimilar(movieId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p role="alert">{(error as Error).message}</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div className="detail-page">
      <Link to="/">&larr; Back</Link>
      <h1>
        {movie.title} {movie.release_year != null && `(${movie.release_year})`}
      </h1>

      <div className="detail-meta">
        {movie.vote_average != null && <span>★ {movie.vote_average.toFixed(1)}</span>}
        {movie.runtime != null && <span>{movie.runtime} min</span>}
        {movie.genres.length > 0 && <span>{movie.genres.map((g) => g.name).join(', ')}</span>}
        {movie.ratingStats.rating_count > 0 && (
          <span>
            {movie.ratingStats.avg_rating} avg from {movie.ratingStats.rating_count} ratings
          </span>
        )}
      </div>

      {movie.tagline && <p className="tagline">{movie.tagline}</p>}
      <p>{movie.overview}</p>

      <section>
        <h2>Cast</h2>
        <CastList cast={movie.cast} />
      </section>

      <section>
        <h2>Crew</h2>
        <CrewList crew={movie.crew} />
      </section>

      <section>
        <h2>Keywords</h2>
        <KeywordList keywords={movie.keywords} />
      </section>

      <section>
        <h2>Similar Movies</h2>
        <SimilarMovies movies={similar ?? []} />
      </section>
    </div>
  );
}

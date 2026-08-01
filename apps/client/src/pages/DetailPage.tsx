import { Link, useParams } from 'react-router-dom';
import { useMovie } from '../hooks/useMovie';
import { useSimilar } from '../hooks/useSimilar';
import { CastList } from '../components/CastList';
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
        {movie.title} {movie.release_date && `(${movie.release_date.slice(0, 4)})`}
      </h1>
      {movie.vote_average != null && <p>★ {movie.vote_average}</p>}
      <p>{movie.overview}</p>

      <section>
        <h2>Cast</h2>
        <CastList cast={(movie as any).cast ?? []} />
      </section>

      <section>
        <h2>Similar Movies</h2>
        <SimilarMovies movies={similar ?? []} />
      </section>
    </div>
  );
}

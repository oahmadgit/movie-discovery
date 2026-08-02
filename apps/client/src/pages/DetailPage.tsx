import { Link, useParams } from 'react-router-dom';
import { useMovie } from '../hooks/useMovie';
import { useSimilar } from '../hooks/useSimilar';
import { AppHeader } from '../components/AppHeader';
import { CastList } from '../components/CastList';
import { CrewList } from '../components/CrewList';
import { KeywordList } from '../components/KeywordList';
import { SimilarMovies } from '../components/SimilarMovies';
import { PosterPlaceholder } from '../components/placeholders/PosterPlaceholder';

export function DetailPage() {
  const { id } = useParams();
  const movieId = Number(id);
  const { data: movie, isLoading, isError, error } = useMovie(movieId);
  const { data: similar } = useSimilar(movieId);

  return (
    <div className="detail-shell">
      <AppHeader showSearch={false} />

      {isLoading && (
        <p className="status-message detail-status">Loading...</p>
      )}
      {isError && (
        <p className="status-message detail-status" role="alert">
          {(error as Error).message}
        </p>
      )}
      {!isLoading && !isError && !movie && <p className="status-message detail-status">Movie not found.</p>}

      {movie && (
        <div className="detail-page">
          <Link to="/" className="back-link">
            &larr; Back to Browse
          </Link>

          <div className="detail-body">
            <main className="detail-main">
              <div className="detail-hero">
                <div className="detail-poster">
                  <PosterPlaceholder />
                </div>

                <div className="detail-hero-info">
                  <h1 className="detail-title">
                    {movie.title}{' '}
                    {movie.release_year != null && <span className="detail-year">({movie.release_year})</span>}
                  </h1>

                  <div className="detail-meta">
                    {movie.vote_average != null && (
                      <span className="detail-rating">★ {movie.vote_average.toFixed(1)}</span>
                    )}
                    {movie.runtime != null && <span>{movie.runtime} min</span>}
                    {movie.genres.length > 0 && <span>{movie.genres.map((g) => g.name).join(', ')}</span>}
                    {movie.ratingStats.rating_count > 0 && (
                      <span>
                        {movie.ratingStats.avg_rating} avg from {movie.ratingStats.rating_count} ratings
                      </span>
                    )}
                  </div>

                  {movie.tagline && <p className="tagline">{movie.tagline}</p>}
                  <p className="overview">{movie.overview}</p>
                </div>
              </div>

              <section className="detail-section">
                <h2>Cast</h2>
                <CastList cast={movie.cast} />
              </section>

              <section className="detail-section">
                <h2>Crew</h2>
                <CrewList crew={movie.crew} />
              </section>

              <section className="detail-section">
                <h2>Keywords</h2>
                <KeywordList keywords={movie.keywords} />
              </section>
            </main>

            <aside className="detail-rail">
              <h2>More Like This</h2>
              <SimilarMovies movies={similar ?? []} />
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}

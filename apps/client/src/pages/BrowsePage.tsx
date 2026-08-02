import { useSearchParams } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';
import { useSearch } from '../hooks/useSearch';
import { MovieGrid } from '../components/MovieGrid';
import { AppHeader } from '../components/AppHeader';
import { FilterPanel } from '../components/FilterPanel';
import { Pagination } from '../components/Pagination';

export function BrowsePage() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const isSearching = q.length > 0;

  const moviesQuery = useMovies({ enabled: !isSearching });
  const searchQuery = useSearch(q, { enabled: isSearching });

  const isLoading = isSearching ? searchQuery.isLoading : moviesQuery.isLoading;
  const isError = isSearching ? searchQuery.isError : moviesQuery.isError;
  const error = isSearching ? searchQuery.error : moviesQuery.error;

  return (
    <div className="browse-page">
      <AppHeader />
      <div className="browse-layout">
        <FilterPanel disabled={isSearching} />
        <main>
          {isLoading && <p className="status-message">Loading...</p>}
          {isError && (
            <p className="status-message" role="alert">
              {(error as Error).message}
            </p>
          )}

          {isSearching && searchQuery.data && (
            <>
              <p className="results-summary">
                {searchQuery.data.length} result{searchQuery.data.length === 1 ? '' : 's'} for &ldquo;{q}&rdquo;
              </p>
              <MovieGrid movies={searchQuery.data} />
            </>
          )}

          {!isSearching && moviesQuery.data && (
            <>
              <MovieGrid movies={moviesQuery.data.data} />
              <Pagination
                page={moviesQuery.data.pagination.page}
                totalPages={moviesQuery.data.pagination.totalPages}
                limit={moviesQuery.data.pagination.limit}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

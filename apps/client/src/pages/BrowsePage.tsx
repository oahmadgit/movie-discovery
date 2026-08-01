import { useMovies } from '../hooks/useMovies';
import { MovieGrid } from '../components/MovieGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { Pagination } from '../components/Pagination';

export function BrowsePage() {
  const { data, isLoading, isError, error } = useMovies();

  return (
    <div className="browse-page">
      <header>
        <h1>🎬 Movie Discovery</h1>
        <SearchBar />
      </header>
      <div className="browse-layout">
        <FilterPanel />
        <main>
          {isLoading && <p>Loading...</p>}
          {isError && <p role="alert">{(error as Error).message}</p>}
          {data && (
            <>
              <MovieGrid movies={data.data} />
              <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGenres } from '../hooks/useGenres';

const MIN_YEAR = 1874;
const MAX_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);

const MIN_RATING = 0;
const MAX_RATING = 10;

interface PendingFilters {
  genres: string[];
  yearFrom: string;
  yearTo: string;
  minRating: string;
}

function readFilters(params: URLSearchParams): PendingFilters {
  const genresParam = params.get('genres') ?? '';
  return {
    genres: genresParam ? genresParam.split(',').filter(Boolean) : [],
    yearFrom: params.get('yearFrom') ?? '',
    yearTo: params.get('yearTo') ?? '',
    minRating: params.get('minRating') ?? '',
  };
}

function sameGenres(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((g) => setB.has(g));
}

export function FilterPanel({ disabled = false }: { disabled?: boolean }) {
  const [params, setParams] = useSearchParams();
  const { data: genres, isLoading: genresLoading } = useGenres();
  const [pending, setPending] = useState<PendingFilters>(() => readFilters(params));
  const applied = readFilters(params);

  useEffect(() => {
    setPending(applied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied.genres.join(','), applied.yearFrom, applied.yearTo, applied.minRating]);

  const isDirty =
    !sameGenres(pending.genres, applied.genres) ||
    pending.yearFrom !== applied.yearFrom ||
    pending.yearTo !== applied.yearTo ||
    pending.minRating !== applied.minRating;

  function toggleGenre(genre: string) {
    setPending((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre) ? prev.genres.filter((g) => g !== genre) : [...prev.genres, genre],
    }));
  }

  function setPendingField(key: 'yearFrom' | 'yearTo' | 'minRating', value: string) {
    setPending((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters() {
    const next = new URLSearchParams(params);
    if (pending.genres.length > 0) next.set('genres', pending.genres.join(','));
    else next.delete('genres');
    (['yearFrom', 'yearTo', 'minRating'] as const).forEach((key) => {
      const value = pending[key];
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.set('page', '1');
    setParams(next);
  }

  function resetFilters() {
    const cleared: PendingFilters = { genres: [], yearFrom: '', yearTo: '', minRating: '' };
    setPending(cleared);
    const next = new URLSearchParams(params);
    next.delete('genres');
    next.delete('yearFrom');
    next.delete('yearTo');
    next.delete('minRating');
    next.set('page', '1');
    setParams(next);
  }

  const yearToOptions = YEARS.filter((year) => pending.yearFrom === '' || year >= Number(pending.yearFrom));
  const yearFromOptions = YEARS.filter((year) => pending.yearTo === '' || year <= Number(pending.yearTo));
  const ratingValue = pending.minRating === '' ? MIN_RATING : Number(pending.minRating);

  return (
    <aside className={`filter-panel${disabled ? ' filter-panel-disabled' : ''}`}>
      {disabled && <p className="filter-hint filter-disabled-note">Filters apply to Browse, not search results.</p>}

      <div className="filter-apply-row">
        <button className="filter-apply-btn" disabled={disabled || !isDirty} onClick={applyFilters}>
          Apply filters{isDirty && !disabled && <span className="filter-pending-badge" aria-hidden="true" />}
        </button>
        <button className="filter-reset-btn" disabled={disabled} onClick={resetFilters}>
          Reset
        </button>
      </div>

      <div className="filter-section">
        <h2 className="filter-heading">Genre</h2>
        <div className="genre-checkbox-list" role="group" aria-label="Genre">
          <label className="genre-checkbox">
            <input
              type="checkbox"
              disabled={disabled}
              checked={pending.genres.length === 0}
              onChange={() => setPending((prev) => ({ ...prev, genres: [] }))}
            />
            <span>All</span>
          </label>
          {genresLoading && <p className="filter-hint">Loading genres…</p>}
          {genres?.map((genre) => (
            <label key={genre} className="genre-checkbox">
              <input
                type="checkbox"
                disabled={disabled}
                checked={pending.genres.includes(genre)}
                onChange={() => toggleGenre(genre)}
              />
              <span>{genre}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h2 className="filter-heading">Release year</h2>
        <div className="year-range">
          <label className="filter-field">
            <span>From</span>
            <select
              disabled={disabled}
              value={pending.yearFrom}
              onChange={(e) => setPendingField('yearFrom', e.target.value)}
            >
              <option value="">Any</option>
              {yearFromOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>To</span>
            <select
              disabled={disabled}
              value={pending.yearTo}
              onChange={(e) => setPendingField('yearTo', e.target.value)}
            >
              <option value="">Any</option>
              {yearToOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h2 className="filter-heading">Minimum rating</h2>
        <div className="rating-slider">
          <input
            type="range"
            min={MIN_RATING}
            max={MAX_RATING}
            step={0.5}
            disabled={disabled}
            value={ratingValue}
            onChange={(e) => setPendingField('minRating', e.target.value)}
          />
          <span className="rating-value">★ {ratingValue.toFixed(1)}+</span>
        </div>
      </div>
    </aside>
  );
}

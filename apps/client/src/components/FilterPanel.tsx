import { useSearchParams } from 'react-router-dom';
import { useGenres } from '../hooks/useGenres';

const MIN_YEAR = 1874;
const MAX_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);

const MIN_VOTES_CAP = 50000;

export function FilterPanel({ disabled = false }: { disabled?: boolean }) {
  const [params, setParams] = useSearchParams();
  const { data: genres, isLoading: genresLoading } = useGenres();

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  }

  const selectedGenre = params.get('genre') ?? '';
  const yearFrom = params.get('yearFrom') ?? '';
  const yearTo = params.get('yearTo') ?? '';
  const minVotes = params.get('minVotes') ?? '';

  return (
    <aside className={`filter-panel${disabled ? ' filter-panel-disabled' : ''}`}>
      {disabled && <p className="filter-hint filter-disabled-note">Filters apply to Browse, not search results.</p>}

      <div className="filter-section">
        <h2 className="filter-heading">Genre</h2>
        <div className="genre-radio-list" role="radiogroup" aria-label="Genre">
          <label className="genre-radio">
            <input
              type="radio"
              name="genre"
              disabled={disabled}
              checked={selectedGenre === ''}
              onChange={() => updateParam('genre', '')}
            />
            <span>All genres</span>
          </label>
          {genresLoading && <p className="filter-hint">Loading genres…</p>}
          {genres?.map((genre) => (
            <label key={genre} className="genre-radio">
              <input
                type="radio"
                name="genre"
                disabled={disabled}
                checked={selectedGenre === genre}
                onChange={() => updateParam('genre', genre)}
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
            <select disabled={disabled} value={yearFrom} onChange={(e) => updateParam('yearFrom', e.target.value)}>
              <option value="">Any</option>
              {YEARS.map((year) => (
                <option key={year} value={year} disabled={yearTo !== '' && year > Number(yearTo)}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>To</span>
            <select disabled={disabled} value={yearTo} onChange={(e) => updateParam('yearTo', e.target.value)}>
              <option value="">Any</option>
              {YEARS.map((year) => (
                <option key={year} value={year} disabled={yearFrom !== '' && year < Number(yearFrom)}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h2 className="filter-heading">Minimum votes</h2>
        <label className="filter-field">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={MIN_VOTES_CAP}
            step={100}
            placeholder="0"
            disabled={disabled}
            defaultValue={minVotes}
            onBlur={(e) => {
              const clamped = Math.min(Math.max(Number(e.target.value) || 0, 0), MIN_VOTES_CAP);
              e.target.value = e.target.value === '' ? '' : String(clamped);
              updateParam('minVotes', e.target.value);
            }}
          />
        </label>
      </div>
    </aside>
  );
}

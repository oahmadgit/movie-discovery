import { useSearchParams } from 'react-router-dom';

export function FilterPanel() {
  const [params, setParams] = useSearchParams();

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  }

  return (
    <div className="filter-panel">
      <label>
        Genre
        <input
          type="text"
          defaultValue={params.get('genre') ?? ''}
          onBlur={(e) => updateParam('genre', e.target.value)}
        />
      </label>
      <label>
        Year from
        <input
          type="number"
          defaultValue={params.get('yearFrom') ?? ''}
          onBlur={(e) => updateParam('yearFrom', e.target.value)}
        />
      </label>
      <label>
        Year to
        <input
          type="number"
          defaultValue={params.get('yearTo') ?? ''}
          onBlur={(e) => updateParam('yearTo', e.target.value)}
        />
      </label>
      <label>
        Min votes
        <input
          type="number"
          defaultValue={params.get('minVotes') ?? ''}
          onBlur={(e) => updateParam('minVotes', e.target.value)}
        />
      </label>
    </div>
  );
}

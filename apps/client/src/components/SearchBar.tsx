import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function SearchBar() {
  const [params, setParams] = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (value) next.set('q', value);
      else next.delete('q');
      setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="search-bar">
      <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21 20.3l-5.4-5.4a7.5 7.5 0 1 0-1.4 1.4l5.4 5.4zM4.5 10.5a6 6 0 1 1 12 0 6 6 0 0 1-12 0z"
        />
      </svg>
      <input
        type="search"
        placeholder="Search movies by title or overview…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search movies"
      />
    </div>
  );
}

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
    <input
      type="search"
      placeholder="Search movies..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

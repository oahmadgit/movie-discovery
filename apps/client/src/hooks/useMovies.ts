import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export function useMovies(options: { enabled: boolean } = { enabled: true }) {
  const [params] = useSearchParams();

  return useQuery({
    queryKey: ['movies', params.toString()],
    queryFn: () => api.movies(Object.fromEntries(params)),
    enabled: options.enabled,
    staleTime: 60_000,
  });
}

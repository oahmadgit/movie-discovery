import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useSearch(q: string, options: { enabled: boolean }) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => api.search(q),
    enabled: options.enabled,
    staleTime: 30_000,
  });
}

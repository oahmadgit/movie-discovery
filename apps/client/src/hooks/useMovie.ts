import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useMovie(id: number) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => api.movie(id),
    enabled: Number.isFinite(id),
  });
}

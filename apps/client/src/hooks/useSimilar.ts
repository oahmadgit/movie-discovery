import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useSimilar(id: number) {
  return useQuery({
    queryKey: ['similar', id],
    queryFn: () => api.similar(id),
    enabled: Number.isFinite(id),
  });
}

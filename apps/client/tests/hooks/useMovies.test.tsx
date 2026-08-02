import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useMovies } from '../../src/hooks/useMovies';
import { renderHookWithProviders } from '../helpers/renderHookWithProviders';
import { api } from '../../src/api/client';

vi.mock('../../src/api/client', () => ({
  api: { movies: vi.fn() },
}));

const mockedMovies = vi.mocked(api.movies);

describe('useMovies', () => {
  beforeEach(() => {
    mockedMovies.mockReset();
    mockedMovies.mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('calls api.movies with the current URL search params', async () => {
    const { result } = renderHookWithProviders(() => useMovies(), { route: '/?genres=Action&page=2' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedMovies).toHaveBeenCalledWith({ genres: 'Action', page: '2' });
  });

  it('does not fetch when enabled is false', async () => {
    renderHookWithProviders(() => useMovies({ enabled: false }), { route: '/?genres=Action' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockedMovies).not.toHaveBeenCalled();
  });
});

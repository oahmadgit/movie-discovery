import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useMovie } from '../../src/hooks/useMovie';
import { renderHookWithProviders } from '../helpers/renderHookWithProviders';
import { api } from '../../src/api/client';
import { makeMovieDetail } from '../helpers/fixtures';

vi.mock('../../src/api/client', () => ({
  api: { movie: vi.fn() },
}));

const mockedMovie = vi.mocked(api.movie);

describe('useMovie', () => {
  beforeEach(() => {
    mockedMovie.mockReset();
    mockedMovie.mockResolvedValue(makeMovieDetail());
  });

  it('fetches the movie by id when id is a valid number', async () => {
    const { result } = renderHookWithProviders(() => useMovie(278));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedMovie).toHaveBeenCalledWith(278);
    expect(result.current.data?.title).toBe('The Shawshank Redemption');
  });

  it('does not fetch when id is NaN', async () => {
    renderHookWithProviders(() => useMovie(NaN));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockedMovie).not.toHaveBeenCalled();
  });
});

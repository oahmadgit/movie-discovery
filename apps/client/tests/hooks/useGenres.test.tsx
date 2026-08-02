import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useGenres } from '../../src/hooks/useGenres';
import { renderHookWithProviders } from '../helpers/renderHookWithProviders';
import { api } from '../../src/api/client';

vi.mock('../../src/api/client', () => ({
  api: { genres: vi.fn() },
}));

const mockedGenres = vi.mocked(api.genres);

describe('useGenres', () => {
  it('fetches the distinct genre list', async () => {
    mockedGenres.mockResolvedValue(['Action', 'Drama']);
    const { result } = renderHookWithProviders(() => useGenres());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(['Action', 'Drama']);
  });
});

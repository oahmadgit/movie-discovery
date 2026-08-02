import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useSimilar } from '../../src/hooks/useSimilar';
import { renderHookWithProviders } from '../helpers/renderHookWithProviders';
import { api } from '../../src/api/client';
import { makeSimilarMovie } from '../helpers/fixtures';

vi.mock('../../src/api/client', () => ({
  api: { similar: vi.fn() },
}));

const mockedSimilar = vi.mocked(api.similar);

describe('useSimilar', () => {
  beforeEach(() => {
    mockedSimilar.mockReset();
    mockedSimilar.mockResolvedValue([makeSimilarMovie()]);
  });

  it('fetches similar movies by id when id is a valid number', async () => {
    const { result } = renderHookWithProviders(() => useSimilar(278));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSimilar).toHaveBeenCalledWith(278);
    expect(result.current.data).toHaveLength(1);
  });

  it('does not fetch when id is NaN', async () => {
    renderHookWithProviders(() => useSimilar(NaN));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockedSimilar).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useSearch } from '../../src/hooks/useSearch';
import { renderHookWithProviders } from '../helpers/renderHookWithProviders';
import { api } from '../../src/api/client';
import { makeMovie } from '../helpers/fixtures';

vi.mock('../../src/api/client', () => ({
  api: { search: vi.fn() },
}));

const mockedSearch = vi.mocked(api.search);

describe('useSearch', () => {
  beforeEach(() => {
    mockedSearch.mockReset();
    mockedSearch.mockResolvedValue([makeMovie()]);
  });

  it('fetches search results for the given query when enabled', async () => {
    const { result } = renderHookWithProviders(() => useSearch('shawshank', { enabled: true }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSearch).toHaveBeenCalledWith('shawshank');
    expect(result.current.data).toHaveLength(1);
  });

  it('does not fetch when enabled is false', async () => {
    renderHookWithProviders(() => useSearch('shawshank', { enabled: false }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockedSearch).not.toHaveBeenCalled();
  });
});

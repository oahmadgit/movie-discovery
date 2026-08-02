import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../../src/api/client';

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = init;
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('api client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches movies with query params appended to the URL', async () => {
    const fetchMock = mockFetchOnce({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    global.fetch = fetchMock as unknown as typeof fetch;

    await api.movies({ genres: 'Action,Comedy', page: '2' });

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/api/movies');
    expect(calledUrl.searchParams.get('genres')).toBe('Action,Comedy');
    expect(calledUrl.searchParams.get('page')).toBe('2');
  });

  it('fetches a single movie by id', async () => {
    const fetchMock = mockFetchOnce({ id: 278, title: 'The Shawshank Redemption' });
    global.fetch = fetchMock as unknown as typeof fetch;

    await api.movie(278);

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/api/movies/278');
  });

  it('fetches similar movies for an id', async () => {
    const fetchMock = mockFetchOnce([]);
    global.fetch = fetchMock as unknown as typeof fetch;

    await api.similar(278);

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/api/movies/278/similar');
  });

  it('fetches search results with the q param', async () => {
    const fetchMock = mockFetchOnce([]);
    global.fetch = fetchMock as unknown as typeof fetch;

    await api.search('shawshank');

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/api/search');
    expect(calledUrl.searchParams.get('q')).toBe('shawshank');
  });

  it('fetches genre analytics', async () => {
    const fetchMock = mockFetchOnce([]);
    global.fetch = fetchMock as unknown as typeof fetch;

    await api.analytics();

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/api/analytics/top-genres');
  });

  it('fetches the distinct genre list', async () => {
    const fetchMock = mockFetchOnce(['Action', 'Drama']);
    global.fetch = fetchMock as unknown as typeof fetch;

    const genres = await api.genres();

    expect(genres).toEqual(['Action', 'Drama']);
    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/api/genres');
  });

  it('throws an error with the server-provided message on a non-ok response', async () => {
    global.fetch = mockFetchOnce({ error: 'Movie not found' }, { ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(api.movie(999999)).rejects.toThrow('Movie not found');
  });

  it('falls back to a generic HTTP error message when the error body cannot be parsed', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    }) as unknown as typeof fetch;

    await expect(api.movie(1)).rejects.toThrow('HTTP 500');
  });
});

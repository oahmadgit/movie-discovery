import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowsePage } from '../../src/pages/BrowsePage';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { api } from '../../src/api/client';
import { makeMovie } from '../helpers/fixtures';

vi.mock('../../src/api/client', () => ({
  api: { movies: vi.fn(), search: vi.fn(), genres: vi.fn() },
}));

const mockedMovies = vi.mocked(api.movies);
const mockedSearch = vi.mocked(api.search);
const mockedGenres = vi.mocked(api.genres);

describe('BrowsePage', () => {
  beforeEach(() => {
    mockedMovies.mockReset();
    mockedSearch.mockReset();
    mockedGenres.mockReset();
    mockedGenres.mockResolvedValue(['Action', 'Drama']);
    mockedMovies.mockResolvedValue({
      data: [makeMovie({ id: 1, title: 'Movie One' }), makeMovie({ id: 2, title: 'Movie Two' })],
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });
  });

  it('shows the browse grid and filter panel by default', async () => {
    renderWithProviders(<BrowsePage />);

    await waitFor(() => expect(screen.getByText('Movie One')).toBeInTheDocument());
    expect(screen.getByText('Movie Two')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Genre' })).toBeInTheDocument();
    expect(mockedSearch).not.toHaveBeenCalled();
  });

  it('switches to search results and a disabled filter panel when a query is present', async () => {
    mockedSearch.mockResolvedValue([makeMovie({ id: 3, title: 'Searched Movie' })]);
    renderWithProviders(<BrowsePage />, { route: '/?q=searched' });

    await waitFor(() => expect(screen.getByText('Searched Movie')).toBeInTheDocument());
    expect(screen.getByText(/1 result for/)).toBeInTheDocument();
    expect(mockedMovies).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Action')).toBeDisabled();
  });

  it('shows an error message when the movies query fails', async () => {
    mockedMovies.mockRejectedValue(new Error('Internal server error'));
    renderWithProviders(<BrowsePage />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Internal server error'));
  });

  it('applying a genre filter re-fetches movies with the new params', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BrowsePage />);
    await waitFor(() => expect(screen.getByText('Movie One')).toBeInTheDocument());

    await user.click(screen.getByLabelText('Action'));
    await user.click(screen.getByRole('button', { name: /Apply filters/ }));

    await waitFor(() => expect(mockedMovies).toHaveBeenLastCalledWith({ genres: 'Action', page: '1' }));
  });

  it('renders pagination controls driven by the response', async () => {
    mockedMovies.mockResolvedValue({
      data: [makeMovie()],
      pagination: { page: 2, limit: 20, total: 100, totalPages: 5 },
    });
    renderWithProviders(<BrowsePage />, { route: '/?page=2' });

    await waitFor(() => expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page'));
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
  });
});

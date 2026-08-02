import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { DetailPage } from '../../src/pages/DetailPage';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { api } from '../../src/api/client';
import { makeMovieDetail, makeSimilarMovie } from '../helpers/fixtures';

vi.mock('../../src/api/client', () => ({
  api: { movie: vi.fn(), similar: vi.fn() },
}));

const mockedMovie = vi.mocked(api.movie);
const mockedSimilar = vi.mocked(api.similar);

function renderDetail(route = '/movies/278') {
  return renderWithProviders(<DetailPage />, { route, path: '/movies/:id' });
}

describe('DetailPage', () => {
  beforeEach(() => {
    mockedMovie.mockReset();
    mockedSimilar.mockReset();
    mockedSimilar.mockResolvedValue([makeSimilarMovie()]);
  });

  it('shows a loading state before the movie loads', () => {
    mockedMovie.mockReturnValue(new Promise(() => {}));
    renderDetail();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the header without a search bar', async () => {
    mockedMovie.mockResolvedValue(makeMovieDetail());
    renderDetail();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Movie Discovery/ })).toBeInTheDocument();
  });

  it('renders movie title, meta, cast, crew, keywords, and similar movies once loaded', async () => {
    mockedMovie.mockResolvedValue(makeMovieDetail());
    renderDetail();

    await waitFor(() => expect(screen.getByRole('heading', { name: /The Shawshank Redemption/ })).toBeInTheDocument());
    expect(screen.getByText('Tim Robbins')).toBeInTheDocument();
    expect(screen.getByText(/Frank Darabont/)).toBeInTheDocument();
    expect(screen.getByText('prison')).toBeInTheDocument();
    expect(screen.getByText('The Godfather')).toBeInTheDocument();
  });

  it('shows a 404-style message when the movie is not found', async () => {
    mockedMovie.mockResolvedValue(null as never);
    renderDetail();

    await waitFor(() => expect(screen.getByText('Movie not found.')).toBeInTheDocument());
  });

  it('shows an error message when the movie query fails', async () => {
    mockedMovie.mockRejectedValue(new Error('Internal server error'));
    renderDetail();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Internal server error'));
  });

  it('renders a "Back to Browse" link pointing home', async () => {
    mockedMovie.mockResolvedValue(makeMovieDetail());
    renderDetail();

    await waitFor(() => expect(screen.getByText(/Back to Browse/)).toBeInTheDocument());
    expect(screen.getByText(/Back to Browse/)).toHaveAttribute('href', '/');
  });
});

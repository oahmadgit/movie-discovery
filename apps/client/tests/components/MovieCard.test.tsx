import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MovieCard } from '../../src/components/MovieCard';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { makeMovie } from '../helpers/fixtures';

describe('MovieCard', () => {
  it('renders title, year, rating, and up to 3 genre tags', () => {
    const movie = makeMovie({
      genres: [
        { genre_id: 1, name: 'Drama' },
        { genre_id: 2, name: 'Crime' },
        { genre_id: 3, name: 'Thriller' },
        { genre_id: 4, name: 'Mystery' },
      ],
    });
    renderWithProviders(<MovieCard movie={movie} />);

    expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
    expect(screen.getByText('1994')).toBeInTheDocument();
    expect(screen.getByText('★ 8.7')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Crime')).toBeInTheDocument();
    expect(screen.getByText('Thriller')).toBeInTheDocument();
    expect(screen.queryByText('Mystery')).not.toBeInTheDocument();
  });

  it('links to the movie detail page', () => {
    renderWithProviders(<MovieCard movie={makeMovie({ id: 550 })} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/movies/550');
  });

  it('omits release year and rating when null', () => {
    renderWithProviders(<MovieCard movie={makeMovie({ release_year: null, vote_average: null as unknown as number })} />);
    expect(screen.queryByText('1994')).not.toBeInTheDocument();
    expect(screen.queryByText(/^★ \d/)).not.toBeInTheDocument();
  });

  it('renders no genre tags when genres is empty', () => {
    const { container } = renderWithProviders(<MovieCard movie={makeMovie({ genres: [] })} />);
    expect(container.querySelector('.genre-tags')).not.toBeInTheDocument();
  });
});

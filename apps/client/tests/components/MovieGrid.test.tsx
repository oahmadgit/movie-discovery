import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MovieGrid } from '../../src/components/MovieGrid';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { makeMovie } from '../helpers/fixtures';

describe('MovieGrid', () => {
  it('renders a card for each movie', () => {
    renderWithProviders(
      <MovieGrid movies={[makeMovie({ id: 1, title: 'Movie One' }), makeMovie({ id: 2, title: 'Movie Two' })]} />
    );
    expect(screen.getByText('Movie One')).toBeInTheDocument();
    expect(screen.getByText('Movie Two')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('shows a fallback message when there are no movies', () => {
    renderWithProviders(<MovieGrid movies={[]} />);
    expect(screen.getByText('No movies found.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

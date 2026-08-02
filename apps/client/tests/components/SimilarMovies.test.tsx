import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { SimilarMovies } from '../../src/components/SimilarMovies';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { makeSimilarMovie } from '../helpers/fixtures';

describe('SimilarMovies', () => {
  it('renders a movie grid when movies are provided', () => {
    renderWithProviders(<SimilarMovies movies={[makeSimilarMovie({ title: 'The Godfather' })]} />);
    expect(screen.getByText('The Godfather')).toBeInTheDocument();
  });

  it('shows an empty-state message when there are no similar movies', () => {
    renderWithProviders(<SimilarMovies movies={[]} />);
    expect(screen.getByText('No similar movies found.')).toBeInTheDocument();
  });

  it('shows an empty-state message when movies is undefined', () => {
    renderWithProviders(<SimilarMovies movies={undefined as unknown as []} />);
    expect(screen.getByText('No similar movies found.')).toBeInTheDocument();
  });
});

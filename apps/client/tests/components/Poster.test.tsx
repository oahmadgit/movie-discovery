import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Poster } from '../../src/components/Poster';

describe('Poster', () => {
  it('renders an img pointing at the CDN when posterPath is set', () => {
    render(<Poster posterPath="/abc123.jpg" title="The Shawshank Redemption" />);
    const img = screen.getByRole('img', { name: 'The Shawshank Redemption poster' });
    expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w342/abc123.jpg');
  });

  it('renders the placeholder when posterPath is null', () => {
    render(<Poster posterPath={null} title="Untitled" />);
    expect(screen.getByRole('img', { name: 'No poster available' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Untitled poster' })).not.toBeInTheDocument();
  });

  it('renders the placeholder when posterPath is undefined', () => {
    render(<Poster posterPath={undefined} title="Untitled" />);
    expect(screen.getByRole('img', { name: 'No poster available' })).toBeInTheDocument();
  });

  it('falls back to the placeholder if the image fails to load', () => {
    render(<Poster posterPath="/broken.jpg" title="Broken Poster Movie" />);
    const img = screen.getByRole('img', { name: 'Broken Poster Movie poster' });

    fireEvent.error(img);

    expect(screen.getByRole('img', { name: 'No poster available' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Broken Poster Movie poster' })).not.toBeInTheDocument();
  });
});

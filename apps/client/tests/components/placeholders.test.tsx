import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PosterPlaceholder } from '../../src/components/placeholders/PosterPlaceholder';
import { PersonPlaceholder } from '../../src/components/placeholders/PersonPlaceholder';

describe('PosterPlaceholder', () => {
  it('renders an svg with an accessible label', () => {
    const { getByRole } = render(<PosterPlaceholder />);
    expect(getByRole('img', { name: 'No poster available' })).toBeInTheDocument();
  });
});

describe('PersonPlaceholder', () => {
  it('renders an svg with an accessible label', () => {
    const { getByRole } = render(<PersonPlaceholder />);
    expect(getByRole('img', { name: 'No photo available' })).toBeInTheDocument();
  });
});

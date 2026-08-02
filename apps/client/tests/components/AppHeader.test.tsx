import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { AppHeader } from '../../src/components/AppHeader';
import { renderWithProviders } from '../helpers/renderWithProviders';

describe('AppHeader', () => {
  it('shows the search bar by default', () => {
    renderWithProviders(<AppHeader />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('hides the search bar when showSearch is false', () => {
    renderWithProviders(<AppHeader showSearch={false} />);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('always shows the brand link pointing to the home page', () => {
    renderWithProviders(<AppHeader showSearch={false} />);
    expect(screen.getByRole('link', { name: /Movie Discovery/ })).toHaveAttribute('href', '/');
  });
});

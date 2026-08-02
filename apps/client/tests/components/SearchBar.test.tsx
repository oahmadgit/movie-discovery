import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../../src/components/SearchBar';
import { renderWithProviders } from '../helpers/renderWithProviders';

describe('SearchBar', () => {
  it('initializes its value from the ?q= URL param', () => {
    renderWithProviders(<SearchBar />, { route: '/?q=shawshank' });
    expect(screen.getByRole('searchbox')).toHaveValue('shawshank');
  });

  it(
    'debounces typing before writing ?q= to the URL',
    async () => {
      const user = userEvent.setup();
      renderWithProviders(<SearchBar />, { withLocationProbe: true });

      await user.type(screen.getByRole('searchbox'), 'love');

      await waitFor(() => {
        expect(screen.getByTestId('location-probe')).toHaveTextContent('/?q=love');
      });
    },
    10000
  );

  it(
    'removes the ?q= param when the input is cleared',
    async () => {
      const user = userEvent.setup();
      renderWithProviders(<SearchBar />, { route: '/?q=love', withLocationProbe: true });

      await user.clear(screen.getByRole('searchbox'));

      await waitFor(() => {
        expect(screen.getByTestId('location-probe')).not.toHaveTextContent('q=');
      });
    },
    10000
  );
});

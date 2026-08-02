import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '../../src/components/FilterPanel';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { api } from '../../src/api/client';

vi.mock('../../src/api/client', () => ({
  api: { genres: vi.fn() },
}));

const mockedGenres = vi.mocked(api.genres);

async function renderPanel(options?: Parameters<typeof renderWithProviders>[1]) {
  const result = renderWithProviders(<FilterPanel />, { withLocationProbe: true, ...options });
  await waitFor(() => expect(screen.getByText('Action')).toBeInTheDocument());
  return result;
}

describe('FilterPanel', () => {
  beforeEach(() => {
    mockedGenres.mockResolvedValue(['Action', 'Comedy', 'Drama']);
  });

  it('checks "All" by default when no genre filter is applied', async () => {
    await renderPanel();
    expect(screen.getByLabelText('All')).toBeChecked();
    expect(screen.getByLabelText('Action')).not.toBeChecked();
  });

  it('reflects genres already present in the URL', async () => {
    await renderPanel({ route: '/?genres=Action,Drama' });
    expect(screen.getByLabelText('All')).not.toBeChecked();
    expect(screen.getByLabelText('Action')).toBeChecked();
    expect(screen.getByLabelText('Drama')).toBeChecked();
    expect(screen.getByLabelText('Comedy')).not.toBeChecked();
  });

  it('unchecks "All" when a specific genre is selected, and does not touch the URL until Apply', async () => {
    const user = userEvent.setup();
    await renderPanel();

    await user.click(screen.getByLabelText('Action'));

    expect(screen.getByLabelText('All')).not.toBeChecked();
    expect(screen.getByLabelText('Action')).toBeChecked();
    expect(screen.getByTestId('location-probe')).toHaveTextContent('/');
  });

  it('re-checking "All" clears specific genre selections', async () => {
    const user = userEvent.setup();
    await renderPanel();

    await user.click(screen.getByLabelText('Action'));
    await user.click(screen.getByLabelText('Comedy'));
    await user.click(screen.getByLabelText('All'));

    expect(screen.getByLabelText('Action')).not.toBeChecked();
    expect(screen.getByLabelText('Comedy')).not.toBeChecked();
    expect(screen.getByLabelText('All')).toBeChecked();
  });

  it('writes selected genres as a comma-joined URL param on Apply', async () => {
    const user = userEvent.setup();
    await renderPanel();

    await user.click(screen.getByLabelText('Action'));
    await user.click(screen.getByLabelText('Comedy'));
    await user.click(screen.getByRole('button', { name: /Apply filters/ }));

    const probe = screen.getByTestId('location-probe');
    expect(probe).toHaveTextContent('genres=Action%2CComedy');
    expect(probe).toHaveTextContent('page=1');
  });

  it('disables the Apply button until a filter changes', async () => {
    await renderPanel();
    expect(screen.getByRole('button', { name: /Apply filters/ })).toBeDisabled();
  });

  it('excludes years before "From" from the "To" dropdown', async () => {
    const user = userEvent.setup();
    await renderPanel();

    await user.selectOptions(screen.getByLabelText('From'), '2010');

    const toOptions = screen.getByLabelText('To').querySelectorAll('option');
    const values = Array.from(toOptions).map((o) => o.textContent);
    expect(values).not.toContain('2009');
    expect(values).toContain('2010');
  });

  it('excludes years after "To" from the "From" dropdown', async () => {
    const user = userEvent.setup();
    await renderPanel();

    await user.selectOptions(screen.getByLabelText('To'), '2000');

    const fromOptions = screen.getByLabelText('From').querySelectorAll('option');
    const values = Array.from(fromOptions).map((o) => o.textContent);
    expect(values).not.toContain('2001');
    expect(values).toContain('2000');
  });

  it('moves the rating slider and shows the updated value', async () => {
    await renderPanel();

    fireEvent.change(screen.getByRole('slider'), { target: { value: '7' } });

    expect(screen.getByText('★ 7.0+')).toBeInTheDocument();
  });

  it('resets all filters and clears the URL immediately on Reset', async () => {
    const user = userEvent.setup();
    await renderPanel({ route: '/?genres=Action&yearFrom=2000&minRating=8' });

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByLabelText('All')).toBeChecked();
    const probe = screen.getByTestId('location-probe');
    expect(probe).not.toHaveTextContent('genres=');
    expect(probe).not.toHaveTextContent('yearFrom=');
    expect(probe).not.toHaveTextContent('minRating=');
  });

  it('shows a search-mode hint and disables all inputs when disabled', async () => {
    renderWithProviders(<FilterPanel disabled />, { withLocationProbe: true });
    await waitFor(() => expect(screen.getByText('Action')).toBeInTheDocument());

    expect(screen.getByText(/Filters apply to Browse, not search results/)).toBeInTheDocument();
    expect(screen.getByLabelText('Action')).toBeDisabled();
    expect(screen.getByRole('button', { name: /Apply filters/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });
});

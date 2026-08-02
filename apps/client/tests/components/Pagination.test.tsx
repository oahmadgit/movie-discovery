import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../../src/components/Pagination';
import { renderWithProviders } from '../helpers/renderWithProviders';

describe('Pagination', () => {
  it('renders page 1..10 and disables Prev on the first page', () => {
    renderWithProviders(<Pagination page={1} totalPages={25} limit={20} />);
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Prev/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '11' })).not.toBeInTheDocument();
  });

  it('shows the correct 10-page window for a page in the middle', () => {
    renderWithProviders(<Pagination page={15} totalPages={25} limit={20} />);
    expect(screen.getByRole('button', { name: '11' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '10' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '21' })).not.toBeInTheDocument();
  });

  it('disables Next on the last page', () => {
    renderWithProviders(<Pagination page={25} totalPages={25} limit={20} />);
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled();
  });

  it('navigates to the clicked page number', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Pagination page={1} totalPages={25} limit={20} />, { withLocationProbe: true });

    await user.click(screen.getByRole('button', { name: '3' }));

    expect(screen.getByTestId('location-probe')).toHaveTextContent('page=3');
  });

  it('jumps forward a full window when Next is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Pagination page={1} totalPages={25} limit={20} />, { withLocationProbe: true });

    await user.click(screen.getByRole('button', { name: /Next/ }));

    expect(screen.getByTestId('location-probe')).toHaveTextContent('page=11');
  });

  it('updates the limit and resets to page 1 when page size changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Pagination page={3} totalPages={25} limit={20} />, {
      route: '/?page=3',
      withLocationProbe: true,
    });

    await user.selectOptions(screen.getByLabelText('Per page'), '50');

    const probe = screen.getByTestId('location-probe');
    expect(probe).toHaveTextContent('limit=50');
    expect(probe).toHaveTextContent('page=1');
  });
});

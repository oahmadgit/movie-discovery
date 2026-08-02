import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

function Bomb(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders the default fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('renders a custom fallback when provided', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('resets error state and re-renders children when Retry is clicked', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;
    function MaybeBomb() {
      if (shouldThrow) throw new Error('boom');
      return <p>Recovered</p>;
    }

    render(
      <ErrorBoundary>
        <MaybeBomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Recovered')).toBeInTheDocument();
    consoleError.mockRestore();
  });
});

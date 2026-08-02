import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './renderWithProviders';

export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: { route?: string } = {}
) {
  const queryClient = createTestQueryClient();
  const { route = '/' } = options;

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return { ...renderHook(hook, { wrapper }), queryClient };
}

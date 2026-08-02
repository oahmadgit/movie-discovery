import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocationProbe } from './LocationProbe';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  options: { route?: string; path?: string; queryClient?: QueryClient; withLocationProbe?: boolean } = {}
) {
  const { route = '/', path = '/', queryClient = createTestQueryClient(), withLocationProbe = false } = options;

  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[route]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {withLocationProbe && <LocationProbe />}
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { ...result, queryClient };
}

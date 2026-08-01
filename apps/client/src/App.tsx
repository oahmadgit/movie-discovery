import { Routes, Route } from 'react-router-dom';
import { BrowsePage } from './pages/BrowsePage';
import { DetailPage } from './pages/DetailPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<BrowsePage />} />
        <Route path="/movies/:id" element={<DetailPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

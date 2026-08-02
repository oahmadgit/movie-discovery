import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar';

export function AppHeader() {
  return (
    <header className="top-bar">
      <Link to="/" className="top-bar-brand">
        🎬 Movie Discovery
      </Link>
      <SearchBar />
      <div className="top-bar-spacer" aria-hidden="true" />
    </header>
  );
}

import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar';

export function AppHeader({ showSearch = true }: { showSearch?: boolean }) {
  return (
    <header className="top-bar">
      <Link to="/" className="top-bar-brand">
        🎬 Movie Discovery
      </Link>
      {showSearch ? <SearchBar /> : <div />}
      <div className="top-bar-spacer" aria-hidden="true" />
    </header>
  );
}

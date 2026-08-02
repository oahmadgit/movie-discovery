import type { SearchResult } from '../types/domain.js';
import type { MovieRepository } from '../repositories/MovieRepository.js';
import type { GenreRepository } from '../repositories/GenreRepository.js';

export class SearchService {
  constructor(
    private movies: MovieRepository,
    private genres: GenreRepository
  ) {}

  search(query: string, limit = 20): SearchResult[] {
    if (!query.trim()) return [];

    // Strip FTS5 operator syntax so user input can't be read as a query language.
    const sanitised = query.replace(/["*\-():^]/g, ' ').trim().replace(/\s+/g, ' ');
    if (!sanitised) return [];

    const rows = this.movies.searchFullText(sanitised, limit);

    const genresByMovie = this.genres.findByMovieIds(rows.map((r) => r.id));
    return rows.map((row) => ({ ...row, genres: genresByMovie.get(row.id) ?? [] }));
  }
}

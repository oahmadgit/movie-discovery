import type { SimilarMovie } from '../types/domain.js';
import type { MovieRepository } from '../repositories/MovieRepository.js';
import type { GenreRepository } from '../repositories/GenreRepository.js';
import type { KeywordRepository } from '../repositories/KeywordRepository.js';

function jaccardScore(a: Set<number>, b: Set<number>, weight: number): number {
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : (intersection / union) * weight;
}

export class SimilarityService {
  constructor(
    private movies: MovieRepository,
    private genres: GenreRepository,
    private keywords: KeywordRepository
  ) {}

  getSimilar(movieId: number, limit = 10): SimilarMovie[] {
    const sourceGenres = this.genres.findGenreIdsByMovieIds([movieId]).get(movieId) ?? new Set<number>();
    const sourceKeywords = this.keywords.findKeywordIdsByMovieIds([movieId]).get(movieId) ?? new Set<number>();
    if (sourceGenres.size === 0 && sourceKeywords.size === 0) return [];

    const candidates = this.movies.findByGenreIds([...sourceGenres], movieId);

    const candidateIds = candidates.map((c) => c.id);
    const candidateGenres = this.genres.findGenreIdsByMovieIds(candidateIds);
    const candidateKeywords = this.keywords.findKeywordIdsByMovieIds(candidateIds);

    const results = candidates
      .map((c) => ({
        ...c,
        score:
          jaccardScore(sourceGenres, candidateGenres.get(c.id) ?? new Set(), 0.6) +
          jaccardScore(sourceKeywords, candidateKeywords.get(c.id) ?? new Set(), 0.4),
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // MovieCard on the client assumes every result has `genres`
    const genresByMovie = this.genres.findByMovieIds(results.map((r) => r.id));
    return results.map((r) => ({ ...r, genres: genresByMovie.get(r.id) ?? [] }));
  }
}

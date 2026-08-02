import type { MoviesQuery } from '../validators/schemas.js';
import type { Pagination, MovieListItem, MovieDetail } from '../types/domain.js';
import type { MovieRepository } from '../repositories/MovieRepository.js';
import type { GenreRepository } from '../repositories/GenreRepository.js';
import type { KeywordRepository } from '../repositories/KeywordRepository.js';
import type { CastCrewRepository } from '../repositories/CastCrewRepository.js';
import type { RatingRepository } from '../repositories/RatingRepository.js';

const DETAIL_CREW_JOBS = ['Director', 'Writer', 'Screenplay', 'Director of Photography', 'Producer'];
const DETAIL_CAST_LIMIT = 20;

export class MovieService {
  constructor(
    private movies: MovieRepository,
    private genres: GenreRepository,
    private keywords: KeywordRepository,
    private castCrew: CastCrewRepository,
    private ratings: RatingRepository
  ) {}

  list(query: MoviesQuery): { data: MovieListItem[]; pagination: Pagination } {
    const filter = { genre: query.genre, yearFrom: query.yearFrom, yearTo: query.yearTo, minVotes: query.minVotes };
    const sort = { column: query.sort ?? 'title', direction: query.order ?? 'asc' } as const;
    const page = { limit: query.limit, offset: (query.page - 1) * query.limit };

    const rows = this.movies.findMany(filter, sort, page);
    const total = this.movies.count(filter);

    const genresByMovie = this.genres.findByMovieIds(rows.map((r) => r.id));
    const data = rows.map((row) => ({ ...row, genres: genresByMovie.get(row.id) ?? [] }));

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  getById(id: number): MovieDetail | null {
    const movie = this.movies.findById(id);
    if (!movie) return null;

    const genres = this.genres.findByMovieIds([id]).get(id) ?? [];
    const cast = this.castCrew.findCastByMovieId(id, DETAIL_CAST_LIMIT);
    const crew = this.castCrew.findCrewByMovieId(id, DETAIL_CREW_JOBS);
    const keywords = this.keywords.findByMovieId(id);
    const ratingStats = this.ratings.statsByMovieId(id);

    return { ...movie, genres, cast, crew, keywords, ratingStats };
  }
}

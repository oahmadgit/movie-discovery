import type Database from 'better-sqlite3';
import { MovieRepositoryImpl } from './impl/MovieRepositoryImpl.js';
import { GenreRepositoryImpl } from './impl/GenreRepositoryImpl.js';
import { KeywordRepositoryImpl } from './impl/KeywordRepositoryImpl.js';
import { CastCrewRepositoryImpl } from './impl/CastCrewRepositoryImpl.js';
import { RatingRepositoryImpl } from './impl/RatingRepositoryImpl.js';
import { AnalyticsRepositoryImpl } from './impl/AnalyticsRepositoryImpl.js';

export * from './MovieRepository.js';
export * from './GenreRepository.js';
export * from './KeywordRepository.js';
export * from './CastCrewRepository.js';
export * from './RatingRepository.js';
export * from './AnalyticsRepository.js';

export interface Repositories {
  movies: MovieRepositoryImpl;
  genres: GenreRepositoryImpl;
  keywords: KeywordRepositoryImpl;
  castCrew: CastCrewRepositoryImpl;
  ratings: RatingRepositoryImpl;
  analytics: AnalyticsRepositoryImpl;
}

export function createRepositories(db: Database.Database): Repositories {
  return {
    movies: new MovieRepositoryImpl(db),
    genres: new GenreRepositoryImpl(db),
    keywords: new KeywordRepositoryImpl(db),
    castCrew: new CastCrewRepositoryImpl(db),
    ratings: new RatingRepositoryImpl(db),
    analytics: new AnalyticsRepositoryImpl(db),
  };
}

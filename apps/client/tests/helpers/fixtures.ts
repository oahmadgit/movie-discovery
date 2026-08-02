import type { Movie, MovieDetail, SimilarMovie } from '../../src/api/client';

export function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 278,
    imdb_id: 'tt0111161',
    title: 'The Shawshank Redemption',
    overview: 'Two imprisoned men bond over a number of years.',
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    release_date: '1994-09-23',
    release_year: 1994,
    budget: 25000000,
    revenue: 28341469,
    runtime: 142,
    vote_average: 8.7,
    vote_count: 21000,
    popularity: 51.6,
    status: 'Released',
    original_language: 'en',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    genres: [
      { genre_id: 18, name: 'Drama' },
      { genre_id: 80, name: 'Crime' },
    ],
    ...overrides,
  };
}

export function makeMovieDetail(overrides: Partial<MovieDetail> = {}): MovieDetail {
  return {
    ...makeMovie(),
    cast: [{ person_id: 1, name: 'Tim Robbins', character: 'Andy Dufresne', order: 0 }],
    crew: [{ person_id: 2, name: 'Frank Darabont', job: 'Director', department: 'Directing' }],
    keywords: [{ keyword_id: 1, name: 'prison' }],
    ratingStats: { rating_count: 311, avg_rating: 4.49 },
    ...overrides,
  };
}

export function makeSimilarMovie(overrides: Partial<SimilarMovie> = {}): SimilarMovie {
  return { ...makeMovie({ id: 238, title: 'The Godfather' }), score: 0.68, ...overrides };
}

import type Database from 'better-sqlite3';
import type { MovieRow } from '../validators/schemas.js';
import type { CastMemberRow, CrewMemberRow } from '../parsers/credits.js';
import type { KeywordRow } from '../parsers/keywords.js';
import type { RatingRow } from '../parsers/ratings.js';

export function upsertMovie(
  db: Database.Database,
  row: MovieRow & { release_year: number | null; imdb_id?: string | null }
) {
  db.prepare(`
    INSERT INTO movies (id, imdb_id, title, overview, tagline, release_date, release_year,
      budget, revenue, runtime, vote_average, vote_count, popularity, status, original_language, poster_path)
    VALUES (@id, @imdb_id, @title, @overview, @tagline, @release_date, @release_year,
      @budget, @revenue, @runtime, @vote_average, @vote_count, @popularity, @status, @original_language, @poster_path)
    ON CONFLICT(id) DO UPDATE SET
      title             = excluded.title,
      overview          = excluded.overview,
      tagline           = excluded.tagline,
      release_date      = excluded.release_date,
      release_year      = excluded.release_year,
      budget            = excluded.budget,
      revenue           = excluded.revenue,
      runtime           = excluded.runtime,
      vote_average      = excluded.vote_average,
      vote_count        = excluded.vote_count,
      popularity        = excluded.popularity,
      status            = excluded.status,
      original_language = excluded.original_language,
      poster_path       = excluded.poster_path
  `).run(nullifyUndefined(row));
}

// better-sqlite3 rejects `undefined` bind params, so optional fields need coercing to null first.
function nullifyUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj } as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    if (out[key] === undefined) out[key] = null;
  }
  return out as T;
}

export function upsertGenre(db: Database.Database, movieId: number, genreId: number, name: string) {
  db.prepare(`
    INSERT INTO genres (movie_id, genre_id, name) VALUES (?, ?, ?)
    ON CONFLICT(movie_id, genre_id) DO UPDATE SET name = excluded.name
  `).run(movieId, genreId, name);
}

export function upsertCastMember(db: Database.Database, row: CastMemberRow) {
  db.prepare(`
    INSERT INTO cast_members (movie_id, person_id, name, character, "order")
    VALUES (@movie_id, @person_id, @name, @character, @order)
    ON CONFLICT(movie_id, person_id) DO UPDATE SET
      name = excluded.name, character = excluded.character, "order" = excluded."order"
  `).run(row);
}

export function upsertCrewMember(db: Database.Database, row: CrewMemberRow) {
  db.prepare(`
    INSERT INTO crew_members (movie_id, person_id, name, job, department)
    VALUES (@movie_id, @person_id, @name, @job, @department)
    ON CONFLICT(movie_id, person_id, job) DO UPDATE SET
      name = excluded.name, department = excluded.department
  `).run(row);
}

export function upsertKeyword(db: Database.Database, row: KeywordRow) {
  db.prepare(`
    INSERT INTO keywords (movie_id, keyword_id, name) VALUES (@movie_id, @keyword_id, @name)
    ON CONFLICT(movie_id, keyword_id) DO UPDATE SET name = excluded.name
  `).run(row);
}

export function upsertRating(db: Database.Database, row: RatingRow) {
  db.prepare(`
    INSERT INTO ratings (user_id, movie_id, rating, timestamp) VALUES (@user_id, @movie_id, @rating, @timestamp)
    ON CONFLICT(user_id, movie_id) DO UPDATE SET rating = excluded.rating, timestamp = excluded.timestamp
  `).run(row);
}

export function rebuildFtsIndex(db: Database.Database) {
  db.exec(`INSERT INTO movies_fts(movies_fts) VALUES('rebuild')`);
}

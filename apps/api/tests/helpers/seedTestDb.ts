import type Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCHEMA_PATH = path.resolve(__dirname, '../../../pipeline/src/db/schema.sql');

export function seedTestDb(db: Database.Database) {
  db.exec(readFileSync(SCHEMA_PATH, 'utf-8'));

  const insertMovie = db.prepare(
    `INSERT INTO movies (id, title, overview, tagline, release_date, release_year, vote_average, vote_count)
     VALUES (@id, @title, @overview, @tagline, @release_date, @release_year, @vote_average, @vote_count)`
  );

  insertMovie.run({
    id: 278,
    title: 'The Shawshank Redemption',
    overview: 'Two imprisoned men bond over a number of years.',
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    release_date: '1994-09-23',
    release_year: 1994,
    vote_average: 8.7,
    vote_count: 21000,
  });
  insertMovie.run({
    id: 238,
    title: 'The Godfather',
    overview: 'The aging patriarch of an organized crime dynasty.',
    tagline: "An offer you can't refuse.",
    release_date: '1972-03-14',
    release_year: 1972,
    vote_average: 8.7,
    vote_count: 16000,
  });
  insertMovie.run({
    id: 550,
    title: 'Fight Club',
    overview: 'An insomniac office worker and a devil-may-care soap maker.',
    tagline: 'Mischief. Mayhem. Soap.',
    release_date: '1999-10-15',
    release_year: 1999,
    vote_average: 8.4,
    vote_count: 26000,
  });

  const insertGenre = db.prepare('INSERT INTO genres (movie_id, genre_id, name) VALUES (?, ?, ?)');
  insertGenre.run(278, 18, 'Drama');
  insertGenre.run(238, 18, 'Drama');
  insertGenre.run(238, 80, 'Crime');
  insertGenre.run(550, 18, 'Drama');

  db.prepare(
    `INSERT INTO cast_members (movie_id, person_id, name, character, "order") VALUES (278, 1, 'Tim Robbins', 'Andy Dufresne', 0)`
  ).run();
  db.prepare(
    `INSERT INTO crew_members (movie_id, person_id, name, job, department) VALUES (278, 2, 'Frank Darabont', 'Director', 'Directing')`
  ).run();
  db.prepare(`INSERT INTO keywords (movie_id, keyword_id, name) VALUES (278, 1, 'prison')`).run();
  db.prepare(`INSERT INTO ratings (user_id, movie_id, rating, timestamp) VALUES (1, 278, 5.0, 1000)`).run();

  db.exec(`INSERT INTO movies_fts(movies_fts) VALUES('rebuild')`);
}

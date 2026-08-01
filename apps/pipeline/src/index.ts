import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import { getDb } from './db/connection.js';
import { parseLinksCsv } from './parsers/links.js';
import { parseMoviesCsv } from './parsers/movies.js';
import { parseCreditsCsv } from './parsers/credits.js';
import { parseKeywordsCsv } from './parsers/keywords.js';
import { parseRatingsCsv } from './parsers/ratings.js';
import {
  upsertMovie,
  upsertGenre,
  upsertCastMember,
  upsertCrewMember,
  upsertKeyword,
  upsertRating,
  rebuildFtsIndex,
} from './loaders/upsert.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../../data');

const FILES = {
  links: path.join(DATA_DIR, 'links.csv'),
  movies: path.join(DATA_DIR, 'movies_metadata.csv'),
  credits: path.join(DATA_DIR, 'credits.csv'),
  keywords: path.join(DATA_DIR, 'keywords.csv'),
  ratings: path.join(DATA_DIR, 'ratings_small.csv'),
};

// Hashes file size + mtime (not contents) — cheap enough to run on every
// invocation and sufficient to detect "the CSVs were replaced".
function computeFilesHash(paths: string[]): string {
  const hash = createHash('sha256');
  for (const filePath of paths) {
    if (existsSync(filePath)) {
      const stat = statSync(filePath);
      hash.update(`${filePath}:${stat.size}:${stat.mtimeMs}`);
    } else {
      hash.update(`${filePath}:missing`);
    }
  }
  return hash.digest('hex');
}

function assertDataFilesPresent() {
  const missing = Object.entries(FILES).filter(([, filePath]) => !existsSync(filePath));
  if (missing.length > 0) {
    console.error('Missing required dataset file(s):');
    for (const [name, filePath] of missing) {
      console.error(`  - ${name}: ${filePath}`);
    }
    console.error('\nDownload "The Movies Dataset" from Kaggle and place the CSVs in ./data before running the pipeline.');
    process.exit(1);
  }
}

function main() {
  assertDataFilesPresent();

  const db = getDb();
  const filesHash = computeFilesHash(Object.values(FILES));

  const lastRun = db
    .prepare('SELECT files_hash FROM pipeline_runs ORDER BY id DESC LIMIT 1')
    .get() as { files_hash: string } | undefined;

  if (lastRun?.files_hash === filesHash) {
    console.log('Dataset unchanged since last run — skipping ingestion.');
    db.close();
    return;
  }

  const started = Date.now();

  console.log('[1/6] Loading links map...');
  const linksMap = parseLinksCsv(FILES.links);
  console.log(`      -> ${linksMap.size} entries`);

  console.log('[2/6] Parsing movies_metadata...');
  const { movies, skipped: skippedMovies } = parseMoviesCsv(FILES.movies);
  db.transaction(() => {
    for (const movie of movies) {
      const { genres, ...movieRow } = movie;
      upsertMovie(db, movieRow);
      for (const genre of genres) {
        upsertGenre(db, movie.id, genre.id, genre.name);
      }
    }
  })();
  console.log(`      -> ${movies.length} valid | ${skippedMovies} skipped (malformed)`);

  // credits/keywords/ratings reference movie ids by their own CSVs' "id" columns,
  // which can include ids that movies_metadata skipped as malformed — filter
  // those out so foreign key inserts don't fail rather than crashing the pipeline.
  const validMovieIds = new Set(movies.map((m) => m.id));

  console.log('[3/6] Parsing credits...');
  const { cast, crew } = parseCreditsCsv(FILES.credits);
  const validCast = cast.filter((c) => validMovieIds.has(c.movie_id));
  const validCrew = crew.filter((c) => validMovieIds.has(c.movie_id));
  db.transaction(() => {
    for (const c of validCast) upsertCastMember(db, c);
    for (const c of validCrew) upsertCrewMember(db, c);
  })();
  console.log(`      -> ${validCast.length}/${cast.length} cast rows | ${validCrew.length}/${crew.length} crew rows`);

  console.log('[4/6] Parsing keywords...');
  const keywords = parseKeywordsCsv(FILES.keywords);
  const validKeywords = keywords.filter((k) => validMovieIds.has(k.movie_id));
  db.transaction(() => {
    for (const k of validKeywords) upsertKeyword(db, k);
  })();
  console.log(`      -> ${validKeywords.length}/${keywords.length} keyword rows`);

  console.log('[5/6] Parsing ratings...');
  const ratings = parseRatingsCsv(FILES.ratings, linksMap);
  const validRatings = ratings.filter((r) => validMovieIds.has(r.movie_id));
  db.transaction(() => {
    for (const r of validRatings) upsertRating(db, r);
  })();
  console.log(`      -> ${validRatings.length}/${ratings.length} ratings loaded`);

  console.log('[6/6] Rebuilding FTS index...');
  rebuildFtsIndex(db);
  console.log('      -> done');

  db.prepare('INSERT INTO pipeline_runs (files_hash) VALUES (?)').run(filesHash);

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\nPipeline complete in ${elapsed}s`);
  console.log('Database: ./database/movies.db');

  db.close();
}

main();

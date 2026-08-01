import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import type Database from 'better-sqlite3';
import { createLogger } from '@movie-discovery/shared';
import { getDb } from './db/connection.js';
import { parseLinksCsv, type LinksMap } from './parsers/links.js';
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

const logger = createLogger('pipeline');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../../data');

const FILES = {
  links: path.join(DATA_DIR, 'links.csv'),
  movies: path.join(DATA_DIR, 'movies_metadata.csv'),
  credits: path.join(DATA_DIR, 'credits.csv'),
  keywords: path.join(DATA_DIR, 'keywords.csv'),
  ratings: path.join(DATA_DIR, 'ratings_small.csv'),
};

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

function assertDataFilesPresent(): void {
  const missing = Object.entries(FILES).filter(([, filePath]) => !existsSync(filePath));
  if (missing.length > 0) {
    logger.error(
      { missing: missing.map(([name, filePath]) => ({ name, filePath })) },
      'Missing required dataset file(s). Place the dataset CSVs in ./data before running the pipeline.'
    );
    process.exit(1);
  }
}

function hasUnchangedDataset(db: Database.Database, filesHash: string): boolean {
  const lastRun = db
    .prepare('SELECT files_hash FROM pipeline_runs ORDER BY id DESC LIMIT 1')
    .get() as { files_hash: string } | undefined;
  return lastRun?.files_hash === filesHash;
}

function loadLinks(): LinksMap {
  logger.info('[1/6] Loading links map...');
  const linksMap = parseLinksCsv(FILES.links);
  logger.info({ entries: linksMap.size }, '[1/6] Links map loaded');
  return linksMap;
}

function ingestMovies(db: Database.Database): Set<number> {
  logger.info('[2/6] Parsing movies_metadata...');
  const { movies, skipped } = parseMoviesCsv(FILES.movies);

  for (const movie of movies) {
    const { genres, ...movieRow } = movie;
    upsertMovie(db, movieRow);
    for (const genre of genres) {
      upsertGenre(db, movie.id, genre.id, genre.name);
    }
  }

  logger.info({ valid: movies.length, skipped }, '[2/6] Movies ingested');
  return new Set(movies.map((m) => m.id));
}

function ingestCredits(db: Database.Database, validMovieIds: Set<number>): void {
  logger.info('[3/6] Parsing credits...');
  const { cast, crew } = parseCreditsCsv(FILES.credits);
  const validCast = cast.filter((c) => validMovieIds.has(c.movie_id));
  const validCrew = crew.filter((c) => validMovieIds.has(c.movie_id));

  for (const c of validCast) upsertCastMember(db, c);
  for (const c of validCrew) upsertCrewMember(db, c);

  logger.info(
    { cast: `${validCast.length}/${cast.length}`, crew: `${validCrew.length}/${crew.length}` },
    '[3/6] Credits ingested'
  );
}

function ingestKeywords(db: Database.Database, validMovieIds: Set<number>): void {
  logger.info('[4/6] Parsing keywords...');
  const keywords = parseKeywordsCsv(FILES.keywords);
  const validKeywords = keywords.filter((k) => validMovieIds.has(k.movie_id));

  for (const k of validKeywords) upsertKeyword(db, k);

  logger.info({ keywords: `${validKeywords.length}/${keywords.length}` }, '[4/6] Keywords ingested');
}

function ingestRatings(db: Database.Database, validMovieIds: Set<number>, linksMap: LinksMap): void {
  logger.info('[5/6] Parsing ratings...');
  const ratings = parseRatingsCsv(FILES.ratings, linksMap);
  const validRatings = ratings.filter((r) => validMovieIds.has(r.movie_id));

  for (const r of validRatings) upsertRating(db, r);

  logger.info({ ratings: `${validRatings.length}/${ratings.length}` }, '[5/6] Ratings ingested');
}

function rebuildSearchIndex(db: Database.Database): void {
  logger.info('[6/6] Rebuilding FTS index...');
  rebuildFtsIndex(db);
  logger.info('[6/6] FTS index rebuilt');
}

function recordPipelineRun(db: Database.Database, filesHash: string): void {
  db.prepare('INSERT INTO pipeline_runs (files_hash) VALUES (?)').run(filesHash);
}

// All six phases run inside one outer transaction rather than one each.
function runIngestion(db: Database.Database, filesHash: string): void {
  const ingest = db.transaction(() => {
    const linksMap = loadLinks();
    const validMovieIds = ingestMovies(db);
    ingestCredits(db, validMovieIds);
    ingestKeywords(db, validMovieIds);
    ingestRatings(db, validMovieIds, linksMap);
    rebuildSearchIndex(db);
    recordPipelineRun(db, filesHash);
  });
  ingest();
}

function main(): void {
  assertDataFilesPresent();

  const db = getDb();
  try {
    const filesHash = computeFilesHash(Object.values(FILES));

    if (hasUnchangedDataset(db, filesHash)) {
      logger.info('Dataset unchanged since last run skipping ingestion.');
      return;
    }

    const started = Date.now();
    runIngestion(db, filesHash);

    const elapsedSeconds = (Date.now() - started) / 1000;
    logger.info({ elapsedSeconds, database: './database/movies.db' }, 'Pipeline complete');
  } finally {
    db.close();
  }
}

main();

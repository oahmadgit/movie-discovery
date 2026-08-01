CREATE TABLE IF NOT EXISTS movies (
  id                INTEGER PRIMARY KEY,   -- primary id used throughout the source dataset
  imdb_id           TEXT,
  title             TEXT NOT NULL,
  overview          TEXT,
  tagline           TEXT,
  release_date      TEXT,
  release_year      INTEGER,               -- extracted for fast year-range filtering
  budget            INTEGER,               -- NULL when source is 0 (not $0)
  revenue           INTEGER,               -- NULL when source is 0
  runtime           INTEGER,
  vote_average      REAL,
  vote_count        INTEGER,
  popularity        REAL,
  status            TEXT,
  original_language TEXT
);

CREATE TABLE IF NOT EXISTS genres (
  movie_id  INTEGER REFERENCES movies(id),
  genre_id  INTEGER,
  name      TEXT NOT NULL,
  PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE IF NOT EXISTS cast_members (
  movie_id   INTEGER REFERENCES movies(id),
  person_id  INTEGER,
  name       TEXT,
  character  TEXT,
  "order"    INTEGER,
  PRIMARY KEY (movie_id, person_id)
);

CREATE TABLE IF NOT EXISTS crew_members (
  movie_id   INTEGER REFERENCES movies(id),
  person_id  INTEGER,
  name       TEXT,
  job        TEXT,
  department TEXT,
  PRIMARY KEY (movie_id, person_id, job)
);

CREATE TABLE IF NOT EXISTS keywords (
  movie_id   INTEGER REFERENCES movies(id),
  keyword_id INTEGER,
  name       TEXT,
  PRIMARY KEY (movie_id, keyword_id)
);

CREATE TABLE IF NOT EXISTS ratings (
  user_id   INTEGER,
  movie_id  INTEGER REFERENCES movies(id),
  rating    REAL,
  timestamp INTEGER,
  PRIMARY KEY (user_id, movie_id)
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  files_hash TEXT NOT NULL,
  ran_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- FTS5 virtual table — powers /api/search with BM25 relevance ranking
CREATE VIRTUAL TABLE IF NOT EXISTS movies_fts USING fts5(
  title, overview, tagline,
  content='movies',
  content_rowid='id'
);

CREATE INDEX IF NOT EXISTS idx_movies_year  ON movies(release_year);
CREATE INDEX IF NOT EXISTS idx_movies_vote  ON movies(vote_average);
CREATE INDEX IF NOT EXISTS idx_movies_rev   ON movies(revenue);
CREATE INDEX IF NOT EXISTS idx_genres_name  ON genres(name);
CREATE INDEX IF NOT EXISTS idx_genres_movie ON genres(movie_id);
CREATE INDEX IF NOT EXISTS idx_cast_movie   ON cast_members(movie_id);
CREATE INDEX IF NOT EXISTS idx_crew_movie   ON crew_members(movie_id);
CREATE INDEX IF NOT EXISTS idx_kw_movie     ON keywords(movie_id);

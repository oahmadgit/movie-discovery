# Movie Content Discovery Platform

A movie discovery app with three parts:

1. A **pipeline** reads movie data from CSV files and loads it into a SQLite database.
2. An **API** (Express) reads that database and serves it over HTTP.
3. A **client** (React) calls the API and lets you browse, search, and view movie details.

```
[CSV files] → pipeline (apps/pipeline) → database/movies.db
                                                  │
                                       API (apps/api)
                                                  │
                                     Client (apps/client)
```

See [ADR.md](ADR.md) for why things were built this way, and what would
need to change to support many more users.

## Stack

- **Pipeline**: Node.js + TypeScript, `csv-parse` (reads CSVs), `json5` (parses the loosely-formatted JSON in some columns), `zod` (validation), `better-sqlite3` (writes to SQLite)
- **API**: Express.js, `better-sqlite3`, `zod`
- **Database**: SQLite — one file, with full-text search built in (FTS5)
- **Frontend**: React + Vite, React Router, TanStack Query (data fetching/caching)
- **Tests**: Vitest + Supertest

## Repository structure

```
movie-discovery/
├── data/                  # put the source CSVs here (not checked into git)
├── database/              # movies.db is created here by the pipeline
└── apps/
    ├── pipeline/          # reads the CSVs and writes to SQLite
    ├── api/                # Express API that reads from SQLite
    ├── client/             # React frontend
    └── shared/             # small bits of code shared by pipeline/api (currently just logging)
```

Inside `apps/api/src`, data access follows a repository pattern:

```
repositories/
├── MovieRepository.ts       # interface — what a movie repository can do
├── GenreRepository.ts       # (one interface per data type)
├── impl/
│   └── MovieRepositoryImpl.ts   # the actual SQLite implementation
└── index.ts                  # wires the implementations together
```

Services (`apps/api/src/services/`) contain the business logic and only
talk to repositories through their interfaces — never to SQL directly.
This keeps the SQL in one place and makes the services easy to test with
a fake repository instead of a real database.

## Prerequisites

- Node.js 20+
- The dataset CSVs: `movies_metadata.csv`, `credits.csv`, `keywords.csv`,
  `links.csv`, `ratings_small.csv`

## Setup

1. **Install dependencies** (this is an npm workspaces project — one
   install covers the pipeline, API, and client):

   ```bash
   npm install
   ```

2. **Put the dataset CSVs in `data/`**:

   ```
   data/
   ├── movies_metadata.csv
   ├── credits.csv
   ├── keywords.csv
   ├── links.csv
   └── ratings_small.csv
   ```

3. **Run the pipeline.** This reads the CSVs, checks the data is valid,
   and writes everything into `database/movies.db`:

   ```bash
   npm run pipeline
   ```

   Takes about 25–50 seconds. If you run it again without changing the
   CSVs, it skips the work instead of redoing it — it checks file size
   and modified time to decide.

4. **Start the API** (runs on port 3001 by default):

   ```bash
   npm run api
   ```

5. **Start the client** (runs on port 5173 by default), in a separate
   terminal:

   ```bash
   npm run client
   ```

   Then open http://localhost:5173.

### Environment variables

The client reads `VITE_API_URL` (see `apps/client/.env.example`). If it's
not set, it defaults to `http://localhost:3001`, so you don't need a
`.env` file for local development. The API reads `PORT` (defaults to
`3001`).

Both the pipeline and the API log using [`pino`](https://getpino.io), and
both read `LOG_LEVEL` (defaults to `info`). By default the API prints
colourised, human-readable logs; set `NODE_ENV=production` to make it
print structured JSON instead (useful for log collectors). The pipeline
works the other way around — pretty output by default, structured JSON
if you set `LOG_FORMAT=json`.

## Running tests

```bash
npm test
```

This runs every workspace's test suite (Vitest): pipeline, API, shared,
and client. It covers CSV parsing/validation, movie filtering and
pagination, search, similarity, and the main UI flows (browsing,
filtering, and viewing a movie's details).

## API reference

All endpoints are mounted under `/api`.

| Endpoint | Description |
|---|---|
| `GET /api/movies` | Paginated, filterable, sortable movie list. Query params: `page`, `limit` (max 100), `sort` (`title`\|`release_date`\|`vote_average`\|`revenue`), `order` (`asc`\|`desc`), `genres` (comma-separated, matches any), `yearFrom`, `yearTo`, `minRating` (0–10) |
| `GET /api/movies/:id` | Full movie detail — genres, cast (top 20), crew (key roles), keywords, rating stats, poster image |
| `GET /api/movies/:id/similar` | Up to 10 similar movies, ranked by shared genres and keywords |
| `GET /api/search?q=` | Full-text search over title/overview/tagline, best matches first |
| `GET /api/genres` | List of all genre names, used to build the genre filter in the UI |
| `GET /api/analytics/top-genres` | Movie count / average rating / average revenue per genre, grouped by decade |

Invalid query params or ids return `400`. A movie that doesn't exist
returns `404`. If the database can't be reached, every `/api/*` route
returns `500` instead of crashing the server.

Movie posters are served as a relative path (`poster_path`) that the
client resolves against an image CDN; if a movie has no poster, the
client shows a placeholder instead.

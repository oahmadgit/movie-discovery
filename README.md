# Movie Content Discovery Platform

A three-layer movie discovery app: a CSV ingestion pipeline loads ~45K
movies into SQLite, an Express API serves search/browse/similarity/analytics
endpoints on top of it, and a React frontend lets you explore the catalog.

```
[raw CSVs] → pipeline (apps/pipeline) → database/movies.db
                                                  │
                                       Express API (apps/api)
                                                  │
                                     React + Vite client (apps/client)
```

See [ADR.md](ADR.md) for the reasoning behind the stack, the similarity
algorithm, and what would change at production scale.

## Stack

- **Pipeline**: Node.js + TypeScript, `csv-parse`, `json5`, `zod`, `better-sqlite3`
- **API**: Express.js, `better-sqlite3`, `zod`
- **Database**: SQLite (single file, FTS5 for full-text search)
- **Frontend**: React + Vite, React Router, TanStack Query
- **Tests**: Vitest + Supertest

## Repository structure

```
movie-discovery/
├── data/                  # drop the source CSVs here (gitignored)
├── database/              # movies.db is generated here by the pipeline
└── apps/
    ├── pipeline/          # CSV → SQLite ingestion CLI
    ├── api/                # Express REST API
    ├── client/             # React + Vite frontend
    └── shared/             # code shared across the Node apps (currently: the logger)
```

## Prerequisites

- Node.js 20+
- The dataset CSVs: `movies_metadata.csv`, `credits.csv`, `keywords.csv`,
  `links.csv`, `ratings_small.csv`

## Setup

1. **Install dependencies** (npm workspaces — one install covers all three apps):

   ```bash
   npm install
   ```

2. **Drop the dataset CSVs into `data/`**:

   ```
   data/
   ├── movies_metadata.csv
   ├── credits.csv
   ├── keywords.csv
   ├── links.csv
   └── ratings_small.csv
   ```

3. **Run the ingestion pipeline**. This creates `database/movies.db`,
   parses/validates every CSV, and reports what it skipped:

   ```bash
   npm run pipeline
   ```

   Expect ~25–50s. Re-running is idempotent — if the CSVs haven't changed
   (by size/mtime), it skips ingestion entirely rather than re-processing
   45K rows.

4. **Start the API** (port 3001 by default):

   ```bash
   npm run api
   ```

5. **Start the client** (port 5173 by default), in a separate terminal:

   ```bash
   npm run client
   ```

   Then open http://localhost:5173.

### Environment variables

The client reads `VITE_API_URL` (see `apps/client/.env.example`); it
defaults to `http://localhost:3001` if unset, so no `.env` file is required
for local development. The API reads `PORT` (defaults to `3001`).

Both the pipeline and the API log via [`pino`](https://getpino.io). Both
read `LOG_LEVEL` (defaults to `info`). The API prints structured JSON when
`NODE_ENV=production`, and colourised pretty output otherwise; the pipeline
prints colourised pretty output by default and switches to structured JSON
when `LOG_FORMAT=json` is set (useful if something else is parsing its output).

## Running tests

```bash
npm test
```

Runs the pipeline and API test suites (Vitest) — 34 tests covering CSV
normalisation, Zod validation, movie filtering/pagination, search, and
failure conditions (bad DB path, malformed query params, FTS special
characters). See `IMPLEMENTATION_PLAN.md` for what's deliberately *not*
tested and why.

## API reference

All endpoints are mounted under `/api`.

| Endpoint | Description |
|---|---|
| `GET /api/movies` | Paginated, filterable, sortable movie list. Query params: `page`, `limit` (max 100), `sort` (`title`\|`release_date`\|`vote_average`\|`revenue`), `order` (`asc`\|`desc`), `genre`, `yearFrom`, `yearTo`, `minVotes` |
| `GET /api/movies/:id` | Full movie detail — genres, cast (top 20), crew (key roles), keywords, rating stats |
| `GET /api/movies/:id/similar` | Up to 10 movies ranked by weighted genre + keyword Jaccard similarity |
| `GET /api/search?q=` | Full-text search over title/overview/tagline (SQLite FTS5, BM25-ranked) |
| `GET /api/analytics/top-genres` | Movie count / avg rating / avg revenue per genre, grouped by decade |

Invalid query params or ids return `400`; a missing movie returns `404`; an
unreachable database degrades every `/api/*` route to `500` rather than
crashing the process.
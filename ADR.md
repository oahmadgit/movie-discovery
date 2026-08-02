# Architecture Decision Record

## 1. Storage: SQLite via `better-sqlite3`

**Decision:** SQLite, accessed synchronously through `better-sqlite3`.

**Why:** The whole database is a single file. There's no server to run and
no login to set up — a reviewer only needs `npm install`. It's also just a
good fit for this data: we write once (during the pipeline run) and read
many times, the data isn't huge (~45K movies, ~1M rows across all tables),
and SQLite's FTS5 extension gives us ranked full-text search for free.

**Tradeoff:** SQLite can't handle multiple things writing to it at once.
That's fine here — only the pipeline writes, and it always finishes before
the API starts reading — but it's the first thing that would need to
change if this grew into a real production system (see §4).

## 2. Similarity: shared genres + keywords

**Decision:** Two movies are considered similar based on how many genres
and keywords they have in common:

```
score = (shared genres   / total distinct genres)   × 0.6
      + (shared keywords / total distinct keywords) × 0.4
```

**Why:** It's fast (no heavy computation per request), needs no training
data or extra infrastructure, and it's easy to explain — "these movies are
similar because they share genres/keywords."

**Alternatives considered:**

| Approach | Pro | Con |
|---|---|---|
| Shared genres/keywords (chosen) | Fast, easy to explain, no extra infrastructure | Doesn't use how users actually rated movies |
| Collaborative filtering (based on ratings) | Uses real user behaviour | Needs a huge precomputed table (~45K × 45K) that's expensive to build and keep fresh |
| Comparing movie descriptions (TF-IDF) | Captures similarity in the actual plot | Needs a search index; slower per request |
| A mix of the above | Best results | 3–5× more work to build |

If there were more time, the next improvement would be a nightly job that
precomputes similarity from real ratings data — see §4.

## 3. Reading the CSV data: JSON5 plus a small custom fix

**Decision:** Before parsing, `normalizeLooseJson()`
(`apps/pipeline/src/parsers/movies.ts`) walks through the raw text and
swaps `None`/`True`/`False` for `null`/`true`/`false` — but only outside
of quoted strings, so it doesn't touch actual text values. The result is
then parsed using [`json5`](https://www.npmjs.com/package/json5) instead
of the standard `JSON.parse`.

**Why:** The `genres`/`cast`/`crew`/`keywords` columns in the source data
aren't valid JSON — they use Python-style formatting: strings can be
wrapped in single or double quotes, lists can have a trailing comma, and
`None`/`True`/`False` are capitalised. JSON5 already understands single
quotes, double quotes, and trailing commas, so it handles almost all of
this out of the box. The only thing it doesn't understand is the
capitalised `None`/`True`/`False`, which is why that one small fix is
still done by hand.

**What we tried first, and why it broke:** The very first version did
this fix with a simple find-and-replace — swapping every `'` for a `"`.
That works until a value itself contains an apostrophe, like the
character name `Ellis Boyd 'Red' Redding`. The source data quotes that
value with double quotes to avoid escaping the apostrophe, but a blind
`'`→`"` replace doesn't know that, and turns it into
`"Ellis Boyd "Red" Redding"` — which then fails to parse, and the whole
row gets silently dropped.

This wasn't caught by tests using made-up sample data — it only showed up
once the pipeline ran against the real dataset and *The Shawshank
Redemption* came back with an empty cast list. Fixing it recovered about
198,000 cast rows (roughly 42% of all cast rows) and 13,000 crew rows that
were being silently dropped. There's now a regression test for this exact
case in `apps/pipeline/tests/parsers.test.ts`, plus general tests
confirming the loosely-formatted columns parse correctly.

## 4. Repository pattern in the API

**Decision:** Each data type (movies, genres, keywords, cast/crew,
ratings, analytics) has an interface describing what it can do
(`apps/api/src/repositories/MovieRepository.ts`, etc.) and a matching
implementation that talks to SQLite
(`apps/api/src/repositories/impl/MovieRepositoryImpl.ts`, etc.). Services
only depend on the interfaces, never on SQL directly.

**Why:** This keeps every raw SQL query in one place per data type,
instead of scattered across services and routes. It also means a service
can be tested with a fake repository instead of a real database, and the
storage layer could be swapped out later (a different database, a cache,
etc.) without touching business logic.

## 5. Poster images: store a path, resolve it on the client

**Decision:** The pipeline stores each movie's `poster_path` as-is from
the source data — a short relative path, not a full URL. The API returns
it unchanged. The client turns it into a real image URL by prefixing it
with an image CDN base URL, and shows a placeholder graphic if the movie
has no poster or the image fails to load.

**Why:** Storing the relative path instead of a full URL keeps the CDN
choice out of the database, so it can be changed in one place (the
client) without touching stored data. The source dataset only has a
reliable poster image per movie — a per-movie backdrop image isn't
actually present in the data, so that field was left out rather than
faked.

## 6. Scaling to 10,000 concurrent users + 26M ratings

1. **Database:** Move to PostgreSQL with read replicas. Replace FTS5 with
   `pg_trgm` + `tsvector` for search.
2. **Caching:** Add Redis in front of `/api/movies/:id` and
   `/api/analytics/top-genres` (cache for 5 minutes / 1 hour).
3. **Similarity:** Precompute similarity scores in a nightly batch job and
   store them in a `movie_similarity` table, instead of computing them on
   every request.
4. **Ratings ingestion:** Replace the one-off CLI import with a streaming
   job that runs independently of the API, connected through a queue
   (SQS/RabbitMQ).
5. **Frontend:** Serve static assets from a CDN; put the API behind a load
   balancer.
6. **Search:** Move to OpenSearch/Elasticsearch for better relevance
   tuning, faceted filters, and horizontal scaling.

## 7. What was left out, and why

| Left out | Reason | What would replace it |
|---|---|---|
| Collaborative filtering for similarity | Not enough time | A precomputed similarity table based on real ratings (§6) |
| Login/authentication | Out of scope for this project | JWT-based auth with different roles (editor vs. public) |
| Rate limiting | Not needed for a local assessment environment | `express-rate-limit`, applied per IP |
| A full design system | Prioritised working features over visual polish | A proper component/design library |
| Search relevance tuning | The default ranking (BM25) is good enough | Boosting title matches over overview matches |
| An analytics page in the UI | Frontend scope was Browse + Detail; the analytics endpoint exists and is tested | A `/analytics` page charting genre/decade trends |

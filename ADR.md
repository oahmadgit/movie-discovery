# Architecture Decision Record

## 1. Storage: SQLite via `better-sqlite3`

**Decision:** SQLite, accessed synchronously through `better-sqlite3`.

**Why:** The whole database ships as a single portable `.db` file — no
server process, no auth setup, nothing for a reviewer to install beyond
`npm install`. Technically it's also a good fit on its own merits: the
workload is read-heavy (ingest once, query many times), the data volume
(~45K movies, ~1M rows across all tables) is well within SQLite's range,
and FTS5 gives BM25-ranked full-text search for free.

**Tradeoff:** SQLite doesn't support concurrent writers. Fine here — the
pipeline is the only writer and it runs to completion before the API ever
touches the file — but it's the first thing to change at production scale
(see §4).

## 2. Similarity: weighted Jaccard over genres + keywords

**Decision:**

```
score = (shared_genres   / union_genres)   × 0.6
      + (shared_keywords / union_keywords) × 0.4
```

**Why:** Sub-millisecond per query once genre/keyword sets are fetched, no
training data or model infrastructure, fully explainable, and reasonable
results for a catalog this size.

**Alternatives considered:**

| Approach | Pro | Con |
|---|---|---|
| Genre/keyword Jaccard (chosen) | Fast, explainable, zero infra | Ignores user rating behaviour |
| Item-based collaborative filtering | Uses the actual ratings signal | Needs a ~45K×45K similarity matrix — expensive to build and keep fresh |
| TF-IDF over overviews | Captures narrative similarity | Needs a vector index; slower per query |
| Hybrid (CF + content) | Best quality | 3–5× the implementation time |

With more time, a nightly-precomputed CF similarity table (cosine
similarity over the ratings matrix) would be the highest-value addition —
see §4.

## 3. CSV normalisation: JSON5, plus a minimal hand-rolled keyword pass

**Decision:** `normalizeLooseJson()` (`apps/pipeline/src/parsers/movies.ts`)
scans the source string character-by-character to swap the capitalised
`None`/`True`/`False` literals for their JS equivalents *outside* string
literals, then hands the result to
[`json5`](https://www.npmjs.com/package/json5) rather than `JSON.parse`.

**Why:** The `genres`/`cast`/`crew`/`keywords` columns hold a loosely-JSON
literal syntax, not strict JSON: string values may use single *or* double
quotes interchangeably (with backslash-escaping), lists/objects may have a
trailing comma, and booleans/null are capitalised instead of lowercase. The
first version of this function did the whole job by hand — a blind `'`→`"`
regex replace, initially, then (after that broke) a hand-rolled tokenizer
that also re-quoted every string value itself. Both were solving a problem
a well-tested library already solves: JSON5 natively accepts single- *and*
double-quoted strings, backslash-escaped quotes, and trailing commas —
exactly the syntax these columns use. The only thing JSON5 can't do is
understand the capitalised `None`/`True`/`False` literals (they aren't
valid JS/JSON5 tokens), so that's the one piece of hand-rolled logic that
has to stay. Delegating string parsing to JSON5 removed the need to track
quote characters, manually handle escape sequences, and re-serialise every
value with `JSON.stringify` — the tokenizer now only walks past string
literals without touching them.

**The bug this replaced:** the original blind `'`→`"` regex — the approach
the initial plan itself sketched — breaks the moment a value contains an
apostrophe. The source data picks a string's delimiter to minimize
escaping: a value containing a `'` (e.g. the character name `Ellis Boyd
'Red' Redding`) gets wrapped in `"` instead of escaping the apostrophe. A
global `'`→`"` replace doesn't know that and corrupts the nesting —
`"Ellis Boyd "Red" Redding"` — which then fails to parse and silently drops
the row. This wasn't caught by unit tests against synthetic fixtures; it
only showed up when the pipeline ran against the real dataset and cast/crew
counts for well-known movies (*The Shawshank Redemption*, specifically)
came back empty. Fixing it recovered ~198K previously-dropped cast rows out
of ~474K total (≈42%) and ~13K crew rows — a large enough fraction that a
regex-based approach should be treated as a known trap for this dataset.
There's a regression test for the specific case, and for JSON5-parseability
generally, in `apps/pipeline/tests/parsers.test.ts`.

## 4. Scaling to 10,000 concurrent users + 26M ratings

1. **Database:** Migrate to PostgreSQL with read replicas. Replace FTS5
   with `pg_trgm` + `tsvector`.
2. **Caching:** Redis in front of `/api/movies/:id` and
   `/api/analytics/top-genres` (5 min / 1 hour TTL respectively).
3. **Similarity:** Precompute the similarity matrix in a nightly batch job
   into a `movie_similarity` table; remove runtime computation entirely.
4. **Ratings ingestion:** Move from a synchronous CLI to a streaming ETL
   job, decoupled from serving via a queue (SQS/RabbitMQ).
5. **Frontend:** CDN for static assets; API behind a load balancer.
6. **Search:** Migrate to OpenSearch/Elasticsearch for relevance tuning,
   faceting, and horizontal scale.

## 5. What was cut, and why

| Cut | Reason | What would replace it |
|---|---|---|
| Naive similarity (no collaborative filtering) | Time budget | Precomputed item-item CF matrix (§4) |
| No authentication | Out of scope for a take-home | JWT auth, editorial vs public roles |
| No rate limiting | Assessment environment | `express-rate-limit` per IP |
| Minimal UI styling | Functionality over polish | A real design system |
| No FTS relevance tuning | BM25 defaults are reasonable | Column weights (`bm25(movies_fts, 10, 5, 1)`) to boost title matches |
| No analytics UI page | Frontend scope was Browse + Detail only; the endpoint exists and is tested | A `/analytics` page charting the genre/decade breakdown |

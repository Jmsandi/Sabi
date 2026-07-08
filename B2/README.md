# B2 - OpenAlex Integration With Rate Limiting

This solution implements a Node.js module that searches OpenAlex works for a query, follows cursor pagination, retrieves up to 500 results, rate-limits requests, applies a per-request timeout via `AbortController`, retries transient failures (HTTP 4xx/5xx *and* low-level network errors), and returns normalized records.

## Run Tests

```bash
npm install
npm test
```

## Run A Search

```bash
node src/index.js "community health workers"
```

Optionally join OpenAlex's faster **polite pool** by supplying a contact email —
it is added as a `mailto` query param and `User-Agent` header:

```bash
OPENALEX_MAILTO=you@example.org node src/index.js "malaria vaccine"
```

## Configuration

Behaviour is tunable via the `OpenAlexClient` constructor (all optional):
`maxResults` (default 500), `pageSize` (200, the OpenAlex maximum),
`requestTimeoutMs` (10s), `rateLimitIntervalMs` (request spacing, ~8 req/s),
`maxAttempts` (3), `retryBaseDelayMs` (exponential backoff base), and `mailto`.
Collaborators (`fetch`, `sleep`, `logger`) are injectable for testing.

## Returned Shape

```json
{
  "title": "Study title",
  "doi": "https://doi.org/...",
  "abstract": "Abstract text or not reported",
  "year": 2024,
  "openAccessUrl": "https://..."
}
```

## Design Notes

- `openAlexClient.js` owns OpenAlex orchestration and pagination.
- `rateLimiter.js` owns request spacing only.
- `retry.js` owns transient retry policy.
- `normalizeOpenAlexWork.js` converts OpenAlex records into the assessment shape.
- `logger.js` centralizes structured logging.

## With More Time

I would cache repeated queries, add integration tests against a recorded OpenAlex fixture, and surface partial results (with a warning) when the run is interrupted after some pages have already succeeded.

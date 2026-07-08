# B2 – OpenAlex Integration With Rate Limiting

A Node.js module that searches OpenAlex works, handles cursor pagination, spaces out requests, sets per-request timeouts, and retries on transient failures. Results come back in the normalized shape the assessment asks for. Works from the command line or as an import.

## Running it

```bash
npm install
npm test
```

Search OpenAlex directly:

```bash
node src/index.js "community health workers"
```

OpenAlex gives better service if you include a contact email:

```bash
OPENALEX_MAILTO=you@example.org node src/index.js "malaria vaccine"
```

## Output shape

Each work gets normalized to:

```json
{
  "title": "Study title",
  "doi": "https://doi.org/...",
  "abstract": "Abstract text or not reported",
  "year": 2024,
  "openAccessUrl": "https://..."
}
```

OpenAlex stores abstracts as inverted indexes — `normalizeOpenAlexWork.js` reconstructs them into plain text. Missing values come back as `"not reported"` instead of blanks.

## File structure

```text
B2/
├── src/
│   ├── index.js
│   ├── logger.js
│   ├── normalizeOpenAlexWork.js
│   ├── openAlexClient.js
│   ├── rateLimiter.js
│   └── retry.js
├── test/
│   └── openAlexClient.test.js
├── .env.example
└── package.json
```

## How it works

- Takes a search string, uses cursor pagination
- Pulls up to 500 records by default
- Per-request timeout via `AbortController`
- Retries on `429`, `500`, `502`, and network drops
- Rate limiter spaces out requests
- Supports OpenAlex polite-pool `mailto` and `User-Agent` header
- `fetch`, `sleep`, and `logger` are injectable for testing

## Configuration

```js
const client = new OpenAlexClient({
  maxResults: 500,
  pageSize: 200,
  requestTimeoutMs: 10000,
  rateLimitIntervalMs: 120,
  maxAttempts: 3,
  retryBaseDelayMs: 500,
  mailto: "you@example.org"
});
```

Defaults are set to be useful out of the box.

## What I'd improve

Fixture-based integration tests using recorded OpenAlex responses, and a simple cache for repeated queries during dev or batch runs.

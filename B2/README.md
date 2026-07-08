# B2 - OpenAlex Integration With Rate Limiting

This is my answer to the B2 backend question. It is a small Node.js module that
searches OpenAlex works, handles cursor pagination, applies request spacing,
sets a timeout on each upstream request, retries transient failures, and returns
records in the normalized shape requested by the assessment.

The module can be used from the command line or imported from another Node.js
service.

## How to run

```bash
npm install
npm test
```

Run a real OpenAlex search:

```bash
node src/index.js "community health workers"
```

OpenAlex recommends including a contact email for more predictable service.
This project supports that through `OPENALEX_MAILTO`:

```bash
OPENALEX_MAILTO=you@example.org node src/index.js "malaria vaccine"
```

## Returned record shape

Each OpenAlex work is normalized to this shape:

```json
{
  "title": "Study title",
  "doi": "https://doi.org/...",
  "abstract": "Abstract text or not reported",
  "year": 2024,
  "openAccessUrl": "https://..."
}
```

OpenAlex stores abstracts as an inverted index. `normalizeOpenAlexWork.js`
rebuilds that into normal text. Missing values are returned as `not reported`
instead of being left blank.

## File structure

```text
B2/
├── src/
│   ├── index.js                  CLI entry point and module export
│   ├── logger.js                 Small structured logger
│   ├── normalizeOpenAlexWork.js  Converts OpenAlex records to the target shape
│   ├── openAlexClient.js         Pagination, timeout, retry, and API calls
│   ├── rateLimiter.js            Spaces requests so the API is not hammered
│   └── retry.js                  Retry helpers for transient failures
├── test/
│   └── openAlexClient.test.js    Pagination, retry, timeout, and mailto tests
├── .env.example
├── package-lock.json
└── package.json
```

## Main behavior

- Accepts a search string.
- Uses cursor pagination.
- Retrieves up to 500 records by default.
- Uses a per-request timeout with `AbortController`.
- Retries transient HTTP failures such as `429`, `500`, `502`, and network
  errors such as dropped connections.
- Waits between requests using a simple rate limiter.
- Supports OpenAlex's polite-pool `mailto` parameter and `User-Agent` header.
- Allows `fetch`, `sleep`, and `logger` to be injected so tests do not need to
  call the real API.

## Configuration

Most settings are passed into the `OpenAlexClient` constructor:

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

The defaults are set to keep the module useful without needing a config file.

## With more time

I would add fixture-based integration tests using recorded OpenAlex responses,
plus a small cache for repeated queries during development or batch processing.

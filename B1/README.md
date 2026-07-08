# B1 — Document Ingestion Endpoint

A Node.js + Express endpoint that accepts a **PDF upload**, extracts its title,
abstract, authors, and year, and stores the result in **PostgreSQL via Prisma**.
If a document with the same **DOI** already exists, the existing record is
returned instead of creating a duplicate.

## Run the tests (no database required)

The endpoint and extraction logic are tested with an injected in-memory
repository, so the full test suite runs without Postgres:

```bash
npm install
npm test
```

## Run the server (with Postgres)

1. Start Postgres (a `docker-compose.yml` is provided):

   ```bash
   docker compose up -d
   ```

2. Configure and migrate:

   ```bash
   cp .env.example .env
   npm run prisma:generate
   npm run prisma:migrate      # creates the documents table
   ```

3. Start the API and upload a PDF:

   ```bash
   npm start
   curl -F "file=@/path/to/paper.pdf" http://localhost:3001/documents
   ```

### Responses

- `201 Created` — new document stored: `{ "document": {...}, "deduplicated": false }`
- `200 OK` — DOI already existed: `{ "document": {...}, "deduplicated": true }`
- `400 Bad Request` — no file in the `file` field
- `500` — the PDF could not be processed

## Data model

A single `Document` table (see `prisma/schema.prisma`):

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` (uuid) | primary key |
| `doi` | `String?` `@unique` | dedupe key; null when no DOI is found |
| `title` | `String` | |
| `abstract` | `String` | `"not reported"` when absent |
| `authors` | `String[]` | empty array when none parsed |
| `year` | `Int?` | null when absent |
| `createdAt` | `DateTime` | defaults to now |

## Design notes

- **Dependency injection.** `createApp({ repository, extractText, extractMetadata })`
  takes its collaborators as arguments, so tests swap in a fake repository and
  fake extractor — no DB, no real PDF parsing needed to prove the routing,
  dedupe, and error paths.
- **Extraction is heuristic and honest.** `pdfMetadata.js` uses regex/positional
  heuristics; fields it cannot find become `null` / `"not reported"` / `[]`,
  never fabricated. DOI dedupe only applies when a DOI is actually found.
- Data access is isolated behind `documentRepository.js` so swapping the store
  (or adding a client-scoped filter for multi-tenancy) is a one-file change.

## With more time

I would resolve the DOI against Crossref to get authoritative title/author
metadata (heuristic byline parsing is brittle), add a per-client column for
tenant isolation, and stream large uploads to disk instead of buffering them.

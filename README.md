# Sabi Core Take-Home Assessment

This repository answers the Sabi Core Software Engineer (AI & Research Platforms) assessment. The assessment asks for **one question per track**; the three required answers are:

- `F1` - Frontend — React + TypeScript + Vite study screener interface
- `B2` - Backend — OpenAlex integration with rate limiting
- `A3` - AI — OpenAI data extraction pipeline from research paper PDFs

`B1` (Backend — PDF-upload document-ingestion endpoint with PostgreSQL/Prisma) is included as an **additional** solution to demonstrate file upload and database persistence.

The implementation uses mock data where the assessment did not provide input files (clearly labelled as mock). Each solution is isolated in its own folder, as requested by the submission checklist.

## Requirements

- Node.js 18+
- npm
- An `OPENAI_API_KEY` environment variable only when running the live `A3` extraction pipeline

## Run F1

```bash
cd F1
npm install
npm run dev
```

Open the Vite URL shown in the terminal. Decisions are saved to `localStorage` and survive refreshes.

## Run B2

```bash
cd B2
npm install
npm test
```

Example usage:

```bash
node src/index.js "malaria vaccine"
```

## Run A3

```bash
cd A3
npm install
npm test
```

To run the live pipeline, place up to five PDF files in `A3/input/papers`, set `OPENAI_API_KEY`, then run:

```bash
OPENAI_API_KEY=your_key npm start
```

The CSV is written to `A3/output/extracted-studies.csv`. No API key is needed to try it — `EXTRACTION_PROVIDER=mock npm start` runs the whole pipeline offline.

## Run B1 (bonus)

```bash
cd B1
npm install
npm test          # full suite runs without a database
```

To run the live upload endpoint, start Postgres and migrate:

```bash
docker compose up -d
cp .env.example .env
npm run prisma:generate && npm run prisma:migrate
npm start
curl -F "file=@/path/to/paper.pdf" http://localhost:3001/documents
```

## Notes

The `stitch_sabi_core_study_screener` folder holds the design mockups (screenshots, PRD, and generated HTML) used as reference for the F1 interface. The submitted solutions live in `F1`, `B2`, and `A3`.

# Sabi Core Take-Home Assessment

This repository contains my submission for the Sabi Core Software Engineer
(AI & Research Platforms) take-home assessment.

I answered one question from each track:

- `F1` - Study screener interface
- `B2` - OpenAlex integration with rate limiting
- `A3` - Data extraction from research papers

Each answer is kept in its own folder so it can be reviewed and run separately.
The projects all use Node 18+ and npm, following the stack requested in the
assessment. Where the assessment did not provide input data, I used mock data
and called that out in the relevant README.

## Repository structure

```text
.
├── F1/
│   ├── src/
│   │   ├── components/       React UI components for the screener
│   │   ├── data/             Mock study records used by the UI
│   │   ├── hooks/            localStorage and keyboard shortcut hooks
│   │   ├── utils/            CSV export helper
│   │   ├── StudyScreenerApp.tsx
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── README.md
│   ├── package.json
│   └── vite.config.ts
│
├── B2/
│   ├── src/
│   │   ├── index.js
│   │   ├── openAlexClient.js
│   │   ├── normalizeOpenAlexWork.js
│   │   ├── rateLimiter.js
│   │   ├── retry.js
│   │   └── logger.js
│   ├── test/
│   │   └── openAlexClient.test.js
│   ├── README.md
│   └── package.json
│
├── A3/
│   ├── input/papers/         Put PDF files here when running the live pipeline
│   ├── output/               CSV output is written here
│   ├── src/
│   │   ├── config/
│   │   ├── errors/
│   │   ├── pipeline/
│   │   ├── prompts/
│   │   ├── services/
│   │   └── utils/
│   ├── test/
│   ├── README.md
│   └── package.json
│
├── SabiCore_Test_Questions.pdf
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- `OPENAI_API_KEY`, only needed for the live A3 extraction pipeline

No database is required for these three selected answers.

## Quick start

Run each project from its own folder.

### F1 - frontend screener

```bash
cd F1
npm install
npm run dev
```

Open the Vite URL printed in the terminal.

### B2 - OpenAlex client

```bash
cd B2
npm install
npm test
node src/index.js "malaria vaccine"
```

### A3 - PDF extraction pipeline

```bash
cd A3
npm install
npm test
```

To run without an API key:

```bash
EXTRACTION_PROVIDER=mock npm start
```

To run against OpenAI, place up to five PDFs in `A3/input/papers` and run:

```bash
OPENAI_API_KEY=your_key npm start
```

The CSV will be written to `A3/output/extracted-studies.csv`.

## Notes on scope

I kept the three selected answers focused on the assessment prompts rather than
adding extra features. The frontend uses a mock set of 50 studies because no
dataset was provided. The OpenAlex client calls the real OpenAlex API. The A3
pipeline can run in mock mode for review without an API key, and it uses OpenAI
by default for the live provider.

Each project README has more detail on design choices, file structure, and what
I would improve with more time.

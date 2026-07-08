# Sabi Core 

My submission for the Sabi Core Software Engineer (AI & Research Platforms) take-home.

I picked one question from each track:

- **F1** – Study screener interface (frontend)
- **B2** – OpenAlex integration with rate limiting (backend)
- **A3** – Data extraction from research papers (AI)

Each answer lives in its own folder and can be run independently. Everything uses Node 18+ and npm as requested. Mock data is used where the assessment didn't provide input — details are in each folder's README.

## Repo layout

```text
.
├── F1/                    Study screener (React + Vite)
│   ├── src/
│   │   ├── components/    React UI components
│   │   ├── data/          Mock study records
│   │   ├── hooks/         localStorage and keyboard hooks
│   │   ├── utils/         CSV export helper
│   │   ├── StudyScreenerApp.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── types.ts
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── B2/                    OpenAlex client
│   ├── src/
│   │   ├── index.js
│   │   ├── openAlexClient.js
│   │   ├── normalizeOpenAlexWork.js
│   │   ├── rateLimiter.js
│   │   ├── retry.js
│   │   └── logger.js
│   ├── test/
│   │   └── openAlexClient.test.js
│   ├── .env.example
│   └── package.json
│
├── A3/                    PDF extraction pipeline
│   ├── input/papers/      Drop PDFs here for live runs
│   ├── output/            CSV output goes here
│   ├── src/
│   │   ├── config/
│   │   ├── errors/
│   │   ├── pipeline/
│   │   ├── prompts/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.js
│   ├── test/
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Requirements

- Node.js 18+
- npm
- `OPENAI_API_KEY` (only needed for live A3 extraction)

No database needed for any of these.

## Quick start

Run each project from its own folder.

### F1 – Frontend screener

```bash
cd F1
npm install
npm run dev
```

Open the Vite URL printed in the terminal.

### B2 – OpenAlex client

```bash
cd B2
npm install
npm test
node src/index.js "malaria vaccine"
```

### A3 – PDF extraction pipeline

```bash
cd A3
npm install
npm test
```

Run without an API key (mock mode):

```bash
EXTRACTION_PROVIDER=mock npm start
```

Run against OpenAI — put up to five PDFs in `A3/input/papers` first:

```bash
OPENAI_API_KEY=your_key npm start
```

Output goes to `A3/output/extracted-studies.csv`.

## Scope notes

I kept things focused on what the prompts actually asked for rather than adding extras. The frontend uses a mock set of 50 studies since no dataset was provided. B2 hits the real OpenAlex API. A3 can run in mock mode for review without a key, and defaults to OpenAI for the live provider.

Each folder has its own README with more on design decisions and what I'd do with more time.

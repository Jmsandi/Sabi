# A3 - Data Extraction From Research Papers

This is my answer to the A3 AI integration question. The pipeline reads up to
five research paper PDFs, extracts their text, sends the text to an AI provider,
normalizes the returned fields, and writes a CSV file.

OpenAI is the default live provider. I also kept a mock provider so the pipeline
can be reviewed without an API key, and a Gemini provider behind the same
interface as an optional alternate implementation.

## Extracted fields

The output CSV contains these columns:

- `studyName`
- `country`
- `sampleSize`
- `intervention`
- `primaryOutcome`
- `resultDirection`

`resultDirection` is limited to:

- `positive`
- `negative`
- `mixed`
- `not reported`

If a value is missing, empty, or outside the expected shape, the pipeline uses
`not reported`. It does not leave blank cells in the CSV.

## How to run

Install dependencies and run the tests:

```bash
npm install
npm test
```

Run the pipeline without an API key:

```bash
EXTRACTION_PROVIDER=mock npm start
```

Run the live OpenAI pipeline:

```bash
OPENAI_API_KEY=your_key npm start
```

Before running live extraction, place up to five PDF files in:

```text
input/papers
```

The generated CSV is written to:

```text
output/extracted-studies.csv
```

## File structure

```text
A3/
├── input/
│   └── papers/
│       └── .gitkeep              Drop PDF files here for live runs
├── output/
│   └── .gitkeep                  CSV output is written here
├── src/
│   ├── config/
│   │   └── config.js             Environment-driven settings
│   ├── errors/
│   │   └── customErrors.js       Named error classes used by the pipeline
│   ├── pipeline/
│   │   └── pipeline.js           Main PDF-to-CSV orchestration
│   ├── prompts/
│   │   └── extractionPrompt.js   Prompt used for structured extraction
│   ├── services/
│   │   ├── csvService.js         CSV escaping and writing
│   │   ├── extractionProvider.js Provider selection
│   │   ├── geminiService.js      Optional Gemini provider
│   │   ├── loggerService.js      JSON logger
│   │   ├── mockExtractionProvider.js
│   │   ├── openAiService.js      OpenAI Responses API provider
│   │   ├── pdfService.js         PDF discovery and text extraction
│   │   └── validationService.js  Field normalization and fallback values
│   ├── utils/
│   │   ├── json.js               JSON parsing helper for model responses
│   │   ├── retry.js              Retry helper for provider calls
│   │   └── sleep.js
│   └── index.js                  CLI entry point
├── test/
│   ├── csvService.test.js
│   ├── openAiService.test.js
│   ├── pipeline.test.js
│   └── validationService.test.js
├── .env.example
├── package-lock.json
└── package.json
```

## How the pipeline works

1. `pipeline.js` lists PDFs in `input/papers`.
2. It processes at most five files, matching the assessment prompt.
3. `pdfService.js` extracts text from each PDF.
4. `extractionPrompt.js` builds a prompt that asks for only the required fields.
5. `openAiService.js` sends the prompt to OpenAI using structured JSON output.
6. `validationService.js` normalizes the returned record and replaces missing
   values with `not reported`.
7. `csvService.js` writes the final CSV.

If one PDF fails, the pipeline logs the error and continues with the next file.
The failed PDF still gets a row in the CSV so the reviewer can see that it was
attempted.

## Environment variables

```bash
EXTRACTION_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TIMEOUT_MS=30000
OPENAI_MAX_ATTEMPTS=3
INPUT_DIRECTORY=input/papers
OUTPUT_CSV_PATH=output/extracted-studies.csv
```

For local review without a key:

```bash
EXTRACTION_PROVIDER=mock npm start
```

For the optional Gemini provider:

```bash
EXTRACTION_PROVIDER=gemini GEMINI_API_KEY=your_key npm start
```

## With more time

I would add a small set of real PDF fixtures with expected CSV outputs, then use
those as regression tests. I would also save the prompt, model name, and provider
metadata beside the CSV so each extraction run has a stronger audit trail.

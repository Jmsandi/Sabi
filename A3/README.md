# A3 - Data Extraction From Research Papers

This solution implements the A3 AI integration track: a Node.js pipeline that processes up to five research paper PDFs, extracts text, sends each paper to an AI extraction provider, validates and normalizes the structured output, and writes a CSV table.

OpenAI is the default provider, matching the assessment stack. Gemini is still available as an alternate provider behind the same boundary in `src/services/extractionProvider.js`.

## Run Tests

```bash
npm install
npm test
```

## Run The Pipeline

Place up to five PDF files in:

```text
input/papers
```

Then run with a live provider:

```bash
OPENAI_API_KEY=your_key npm start
```

Output:

```text
output/extracted-studies.csv
```

### Run without an API key (mock provider)

To exercise the whole pipeline offline — no key, no network — use the mock
provider, which returns deterministic, clearly-fabricated records (including one
sparse record to demonstrate the `not reported` rule):

```bash
EXTRACTION_PROVIDER=mock npm start
```

> The 5 source PDFs are not bundled with this repo. Drop any PDFs into
> `input/papers` to try it, or use the mock provider above to see the output
> shape. The mock data is fabricated, not extracted from any real paper.

### Optional Gemini provider

To run the same pipeline with Gemini instead, set:

```bash
EXTRACTION_PROVIDER=gemini GEMINI_API_KEY=your_key npm start
```

## Configuration

All settings are environment-driven (see `config/config.js`): `EXTRACTION_PROVIDER`
(`openai` | `gemini` | `mock`), `INPUT_DIRECTORY`, `OUTPUT_CSV_PATH`,
`OPENAI_MODEL`, `OPENAI_TIMEOUT_MS`, `OPENAI_MAX_ATTEMPTS`, `OPENAI_API_KEY`,
plus the equivalent Gemini overrides when using the optional Gemini provider.
Total execution time is logged on completion (`durationMs`).

## Extracted Fields

- studyName
- country
- sampleSize
- intervention
- primaryOutcome
- resultDirection

`resultDirection` is constrained to `positive`, `negative`, `mixed`, or `not reported`. Every missing or invalid value is normalized to `not reported`.

## Architecture

- `config/config.js` owns environment-driven configuration and magic numbers.
- `pipeline/pipeline.js` owns orchestration only.
- `services/pdfService.js` owns PDF discovery and text extraction.
- `services/openAiService.js` owns OpenAI Responses API calls and structured-output parsing.
- `services/geminiService.js` owns Gemini API calls and response parsing.
- `services/extractionProvider.js` owns provider selection.
- `services/mockExtractionProvider.js` owns the offline demo provider (no API key).
- `services/validationService.js` owns schema normalization and the no-blank-cells rule.
- `services/csvService.js` owns CSV escaping and file writing.
- `services/loggerService.js` owns structured logging.
- `utils/retry.js` and `utils/sleep.js` own reusable control-flow helpers.
- `errors/customErrors.js` owns typed pipeline errors.

## Error Handling

The pipeline handles missing or corrupted PDFs, provider timeouts, rate limits, malformed AI JSON, and CSV write failures. Individual PDF failures are logged and converted into `not reported` rows so one bad file does not crash the whole run.

## With More Time

I would add golden-paper fixtures with expected extractions, persist prompt/version metadata beside the CSV for auditability, and add a human review UI for uncertain rows.

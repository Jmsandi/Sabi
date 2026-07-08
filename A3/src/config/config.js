import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, '..', '..');

export const config = {
  projectRoot,
  inputDirectory: process.env.INPUT_DIRECTORY || path.join(projectRoot, 'input', 'papers'),
  outputCsvPath: process.env.OUTPUT_CSV_PATH || path.join(projectRoot, 'output', 'extracted-studies.csv'),
  providerName: process.env.EXTRACTION_PROVIDER || 'openai',
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    requestTimeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || 30000),
    maxAttempts: Number(process.env.OPENAI_MAX_ATTEMPTS || 3),
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    requestTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS || 30000),
    maxAttempts: Number(process.env.GEMINI_MAX_ATTEMPTS || 3),
  },
  csvColumns: [
    'studyName',
    'country',
    'sampleSize',
    'intervention',
    'primaryOutcome',
    'resultDirection',
  ],
};

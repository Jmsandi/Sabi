import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runExtractionPipeline } from '../src/pipeline/pipeline.js';

function createSilentLogger() {
  return { info() {}, warn() {}, error() {} };
}

async function tempCsvPath() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'a3-pipeline-'));
  return path.join(dir, 'out.csv');
}

const columns = ['studyName', 'country', 'sampleSize', 'intervention', 'primaryOutcome', 'resultDirection'];

test('pipeline continues after a failing PDF and still writes every row', async () => {
  const outputCsvPath = await tempCsvPath();

  const goodRecord = {
    studyName: 'Good Study',
    country: 'Ghana',
    sampleSize: '500',
    intervention: 'Bed nets',
    primaryOutcome: 'Malaria incidence',
    resultDirection: 'positive',
  };

  const result = await runExtractionPipeline(
    { logger: createSilentLogger() },
    {
      settings: { inputDirectory: '/fake', outputCsvPath, csvColumns: columns },
      listPdfs: async () => ['/fake/a.pdf', '/fake/broken.pdf', '/fake/c.pdf'],
      readPdfText: async (pdfPath) => {
        if (pdfPath.endsWith('broken.pdf')) {
          throw new Error('corrupted PDF');
        }
        return 'some paper text';
      },
      createProvider: () => ({
        extractStudyData: async () => ({ ...goodRecord }),
      }),
    },
  );

  // One row per file, even the one that failed.
  assert.equal(result.rows.length, 3);

  const failedRow = result.rows[1];
  assert.equal(failedRow.studyName, 'broken.pdf');
  assert.equal(failedRow.primaryOutcome, 'corrupted PDF');
  assert.equal(failedRow.resultDirection, 'not reported');

  // CSV was written with a header + three data rows.
  const csv = await fs.readFile(outputCsvPath, 'utf8');
  const lines = csv.trim().split('\n');
  assert.equal(lines.length, 4);
  assert.equal(lines[0], columns.join(','));
});

test('pipeline writes only a header when there are no PDFs', async () => {
  const outputCsvPath = await tempCsvPath();

  const result = await runExtractionPipeline(
    { logger: createSilentLogger() },
    {
      settings: { inputDirectory: '/empty', outputCsvPath, csvColumns: columns },
      listPdfs: async () => [],
      readPdfText: async () => 'unused',
      createProvider: () => {
        throw new Error('provider should not be created when there are no PDFs');
      },
    },
  );

  assert.equal(result.rows.length, 0);
  const csv = await fs.readFile(outputCsvPath, 'utf8');
  assert.equal(csv.trim(), columns.join(','));
});

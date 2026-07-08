import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { writeCsv } from '../src/services/csvService.js';

test('writeCsv writes escaped CSV output', async () => {
  const outputPath = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'a3-csv-')), 'out.csv');

  await writeCsv({
    outputPath,
    columns: ['studyName', 'country'],
    rows: [{ studyName: 'Trial, phase "A"', country: 'Ghana' }],
  });

  const contents = await fs.readFile(outputPath, 'utf8');
  assert.equal(contents, 'studyName,country\n"Trial, phase ""A""",Ghana\n');
});

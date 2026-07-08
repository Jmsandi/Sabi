import assert from 'node:assert/strict';
import test from 'node:test';
import { createFailedRecord, normalizeExtractedRecord } from '../src/services/validationService.js';

test('normalizeExtractedRecord replaces missing fields with not reported', () => {
  const record = normalizeExtractedRecord({
    studyName: 'Trial 1',
    sampleSize: '',
    resultDirection: 'Positive',
  });

  assert.equal(record.studyName, 'Trial 1');
  assert.equal(record.country, 'not reported');
  assert.equal(record.sampleSize, 'not reported');
  assert.equal(record.resultDirection, 'positive');
});

test('normalizeExtractedRecord rejects unsupported result directions', () => {
  const record = normalizeExtractedRecord({
    resultDirection: 'very successful',
  });

  assert.equal(record.resultDirection, 'not reported');
});

test('createFailedRecord preserves the file name and avoids blank cells', () => {
  const record = createFailedRecord('paper.pdf', 'corrupted PDF');

  assert.equal(record.studyName, 'paper.pdf');
  assert.equal(record.primaryOutcome, 'corrupted PDF');
  assert.equal(record.country, 'not reported');
});

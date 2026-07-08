import assert from 'node:assert/strict';
import test from 'node:test';
import { extractPdfMetadata } from '../src/services/pdfMetadata.js';

const sampleText = `Efficacy of Community Health Worker Programs in Rural Kenya
Chen, Y., Patel, K., and Smith, J.
Journal of Global Health, 2023
doi:10.1016/j.jgh.2023.08.012

Abstract
This randomized controlled trial evaluated the impact of community health
worker home visits on malaria incidence across 14 clinics.

Keywords: malaria, community health workers`;

test('extractPdfMetadata pulls doi, year, title, authors, and abstract', () => {
  const metadata = extractPdfMetadata(sampleText);

  assert.equal(metadata.doi, '10.1016/j.jgh.2023.08.012');
  assert.equal(metadata.year, 2023);
  assert.match(metadata.title, /Community Health Worker/);
  assert.deepEqual(metadata.authors, ['Chen, Y.', 'Patel, K.', 'Smith, J.']);
  assert.match(metadata.abstract, /randomized controlled trial/);
});

test('missing fields become null or "not reported", never fabricated', () => {
  const metadata = extractPdfMetadata('Just a short line with no structure');

  assert.equal(metadata.doi, null);
  assert.equal(metadata.year, null);
  assert.equal(metadata.abstract, 'not reported');
  assert.deepEqual(metadata.authors, []);
});

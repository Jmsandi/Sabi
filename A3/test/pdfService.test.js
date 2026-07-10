import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import zlib from 'node:zlib';
import { extractTextFromPdf } from '../src/services/pdfService.js';

test('extractTextFromPdf falls back for simple ReportLab compressed streams', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'a3-pdf-'));
  const pdfPath = path.join(directory, 'compressed-stream.pdf');
  const content = [
    'BT',
    '(Conflict Mapping Presentation Notes) Tj',
    '(Slide 1: Cover Page) Tj',
    '(Conflict mapping promotes objective analysis) Tj',
    'ET',
  ].join('\n');
  const encodedStream = ascii85Encode(zlib.deflateSync(Buffer.from(content, 'latin1')));

  await fs.writeFile(
    pdfPath,
    [
      '%PDF-1.4',
      '1 0 obj',
      '<<',
      `/Filter [ /ASCII85Decode /FlateDecode ] /Length ${encodedStream.length}`,
      '>>',
      'stream',
      encodedStream,
      'endstream',
      'endobj',
      '%%EOF',
    ].join('\n'),
  );

  const text = await extractTextFromPdf(pdfPath);

  assert.match(text, /Conflict Mapping Presentation Notes/);
  assert.match(text, /Slide 1: Cover Page/);
  assert.match(text, /Conflict mapping promotes objective analysis/);
});

function ascii85Encode(buffer) {
  let encoded = '';

  for (let index = 0; index < buffer.length; index += 4) {
    const chunk = buffer.subarray(index, index + 4);
    const padded = Buffer.alloc(4);
    chunk.copy(padded);
    let value = padded.readUInt32BE(0);
    const digits = Array.from({ length: 5 }, () => {
      const digit = value % 85;
      value = Math.floor(value / 85);
      return String.fromCharCode(digit + 33);
    }).reverse();

    encoded += digits.slice(0, chunk.length + 1).join('');
  }

  return `${encoded}~>`;
}

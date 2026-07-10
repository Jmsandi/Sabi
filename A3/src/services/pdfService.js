import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { PdfExtractionError } from '../errors/customErrors.js';

export async function listPdfFiles(inputDirectory) {
  let entries;
  try {
    entries = await fs.readdir(inputDirectory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
    .map((entry) => path.join(inputDirectory, entry.name))
    .sort();
}

export async function extractTextFromPdf(pdfPath) {
  const buffer = await fs.readFile(pdfPath);

  try {
    const result = await pdfParse(buffer);
    const text = result.text?.trim();

    if (!text) {
      throw new Error('No extractable text found');
    }

    return text;
  } catch (primaryError) {
    try {
      const fallbackText = extractTextFromSimplePdfStreams(buffer);
      if (fallbackText) {
        return fallbackText;
      }
    } catch {
      // Keep the original parser error; it is usually more useful.
    }

    throw new PdfExtractionError('Failed to extract text from PDF', {
      cause: primaryError,
      context: { pdfPath },
    });
  }
}

function extractTextFromSimplePdfStreams(buffer) {
  const pdf = buffer.toString('latin1');
  const chunks = [];
  const streamPattern = /<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)endstream/g;
  let match;

  while ((match = streamPattern.exec(pdf)) !== null) {
    const dictionary = match[1];
    let stream = Buffer.from(match[2].replace(/\r?\n$/, ''), 'latin1');

    if (dictionary.includes('/ASCII85Decode')) {
      stream = decodeAscii85(stream.toString('latin1'));
    }
    if (dictionary.includes('/FlateDecode')) {
      stream = zlib.inflateSync(stream);
    }

    const text = extractTextFromContentStream(stream.toString('latin1'));
    if (text) {
      chunks.push(text);
    }
  }

  return chunks.join('\n').trim();
}

function decodeAscii85(input) {
  const output = [];
  let group = [];
  const cleaned = input.replace(/~>\s*$/, '').replace(/\s/g, '');

  for (const character of cleaned) {
    if (character === 'z' && group.length === 0) {
      output.push(0, 0, 0, 0);
      continue;
    }

    const code = character.charCodeAt(0);
    if (code < 33 || code > 117) {
      continue;
    }

    group.push(code - 33);
    if (group.length === 5) {
      output.push(...ascii85GroupToBytes(group));
      group = [];
    }
  }

  if (group.length > 0) {
    const missing = 5 - group.length;
    while (group.length < 5) {
      group.push(84);
    }
    output.push(...ascii85GroupToBytes(group).slice(0, 4 - missing));
  }

  return Buffer.from(output);
}

function ascii85GroupToBytes(group) {
  let value = 0;
  for (const digit of group) {
    value = value * 85 + digit;
  }

  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ];
}

function extractTextFromContentStream(content) {
  const pieces = [];
  const textPattern = /\((?:\\.|[^\\)])*\)\s*Tj/g;
  let match;

  while ((match = textPattern.exec(content)) !== null) {
    pieces.push(decodePdfString(match[0].match(/\((?:\\.|[^\\)])*\)/)[0]));
  }

  return pieces
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodePdfString(value) {
  return value
    .slice(1, -1)
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f');
}

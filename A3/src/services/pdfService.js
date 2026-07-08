import fs from 'node:fs/promises';
import path from 'node:path';
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
  try {
    const buffer = await fs.readFile(pdfPath);
    const result = await pdfParse(buffer);
    const text = result.text?.trim();

    if (!text) {
      throw new Error('No extractable text found');
    }

    return text;
  } catch (error) {
    throw new PdfExtractionError('Failed to extract text from PDF', {
      cause: error,
      context: { pdfPath },
    });
  }
}

import fs from 'node:fs/promises';
import path from 'node:path';
import { CsvWriteError } from '../errors/customErrors.js';

function escapeCsvValue(value) {
  const stringValue = String(value ?? 'not reported');
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

export async function writeCsv({ rows, columns, outputPath }) {
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const header = columns.join(',');
    const body = rows.map((row) => columns.map((column) => escapeCsvValue(row[column])).join(','));
    await fs.writeFile(outputPath, [header, ...body].join('\n') + '\n', 'utf8');
  } catch (error) {
    throw new CsvWriteError('Failed to write CSV output', {
      cause: error,
      context: { outputPath },
    });
  }
}

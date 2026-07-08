// Import the library entrypoint directly to avoid pdf-parse's debug-mode index,
// which tries to read a bundled sample file when required as the main module.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extract raw text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
export async function extractPdfText(buffer) {
  const result = await pdfParse(buffer);
  return result.text ?? '';
}

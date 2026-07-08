import express from 'express';
import multer from 'multer';
import { extractPdfMetadata } from './services/pdfMetadata.js';
import { extractPdfText } from './services/pdfText.js';
import { createLogger } from './logger.js';

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB upload cap

/**
 * Build the Express app. All collaborators are injectable so the endpoint can
 * be tested without a database, a real Prisma client, or real PDF parsing.
 *
 * @param {object} deps
 * @param {{ findByDoi: Function, create: Function }} deps.repository  required
 * @param {Function} [deps.extractText]      buffer -> Promise<string>
 * @param {Function} [deps.extractMetadata]  text -> metadata object
 * @param {object}   [deps.logger]
 */
export function createApp({
  repository,
  extractText = extractPdfText,
  extractMetadata = extractPdfMetadata,
  logger = createLogger(),
} = {}) {
  if (!repository) {
    throw new Error('createApp requires a document repository');
  }

  const app = express();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_BYTES },
  });

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.post('/documents', upload.single('file'), async (request, response) => {
    if (!request.file) {
      return response.status(400).json({ error: 'A PDF file is required in the "file" field.' });
    }

    try {
      const text = await extractText(request.file.buffer);
      const metadata = extractMetadata(text);
      logger.info('Extracted document metadata', {
        fileName: request.file.originalname,
        doi: metadata.doi,
        year: metadata.year,
      });

      // Deduplicate by DOI: return the existing record instead of a duplicate.
      if (metadata.doi) {
        const existing = await repository.findByDoi(metadata.doi);
        if (existing) {
          logger.info('Document already exists; returning existing record', {
            doi: metadata.doi,
          });
          return response.status(200).json({ document: existing, deduplicated: true });
        }
      }

      const created = await repository.create(metadata);
      logger.info('Stored new document', { id: created.id, doi: created.doi });
      return response.status(201).json({ document: created, deduplicated: false });
    } catch (error) {
      logger.error('Failed to ingest document', { error: error.message });
      return response.status(500).json({ error: 'Failed to process the uploaded PDF.' });
    }
  });

  return app;
}

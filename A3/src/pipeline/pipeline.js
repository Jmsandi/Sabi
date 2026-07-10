import path from 'node:path';
import { config } from '../config/config.js';
import { buildExtractionPrompt } from '../prompts/extractionPrompt.js';
import { writeCsv } from '../services/csvService.js';
import { createExtractionProvider } from '../services/extractionProvider.js';
import { extractTextFromPdf, listPdfFiles } from '../services/pdfService.js';
import { createFailedRecord, normalizeExtractedRecord } from '../services/validationService.js';

const MAX_PAPERS = 5;

// Runs the whole thing: find PDFs, pull their text, ask the provider for
// structured data, tidy it up, write the CSV. The I/O pieces are injectable so
// the tests can drive it without a filesystem, real PDFs, or an API key.
export async function runExtractionPipeline({ logger }, deps = {}) {
  const {
    settings = config,
    listPdfs = listPdfFiles,
    readPdfText = extractTextFromPdf,
    createProvider = createExtractionProvider,
  } = deps;

  const startedAt = Date.now();

  logger.info('Starting A3 extraction pipeline', {
    inputDirectory: settings.inputDirectory,
    outputCsvPath: settings.outputCsvPath,
  });

  const pdfPaths = await listPdfs(settings.inputDirectory);
  const selectedPdfPaths = pdfPaths.slice(0, MAX_PAPERS);

  if (selectedPdfPaths.length === 0) {
    logger.warn('No PDFs found in input directory', { inputDirectory: settings.inputDirectory });
  }

  const rows = [];
  const provider = selectedPdfPaths.length > 0 ? createProvider({ logger }) : null;

  for (const pdfPath of selectedPdfPaths) {
    const fileName = path.basename(pdfPath);
    try {
      logger.info('Processing PDF', { fileName });
      const paperText = await readPdfText(pdfPath);
      const prompt = buildExtractionPrompt({ fileName, paperText });
      const extractedRecord = await provider.extractStudyData(prompt, { fileName });
      rows.push(normalizeExtractedRecord(extractedRecord));
      logger.info('Finished PDF', { fileName });
    } catch (error) {
      // one bad file shouldn't sink the whole run — note it and carry on
      logger.error('PDF failed; continuing with remaining files', {
        fileName,
        error: error.message,
      });
      rows.push(createFailedRecord(fileName, error.message));
    }
  }

  await writeCsv({
    rows,
    columns: settings.csvColumns,
    outputPath: settings.outputCsvPath,
  });

  logger.info('Extraction pipeline complete', {
    processedFiles: selectedPdfPaths.length,
    outputCsvPath: settings.outputCsvPath,
    durationMs: Date.now() - startedAt,
  });

  return { rows, outputCsvPath: settings.outputCsvPath };
}

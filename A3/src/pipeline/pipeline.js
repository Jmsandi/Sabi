import path from 'node:path';
import { config } from '../config/config.js';
import { buildExtractionPrompt } from '../prompts/extractionPrompt.js';
import { writeCsv } from '../services/csvService.js';
import { createExtractionProvider } from '../services/extractionProvider.js';
import { extractTextFromPdf, listPdfFiles } from '../services/pdfService.js';
import { createFailedRecord, normalizeExtractedRecord } from '../services/validationService.js';

const MAX_PAPERS = 5;

/**
 * Orchestrates the extraction pipeline: discover PDFs -> extract text ->
 * ask the provider for structured data -> validate/normalise -> write CSV.
 *
 * All I/O collaborators are injectable (`deps`) so the orchestration can be
 * tested in isolation without a filesystem, real PDFs, or a live API key.
 */
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
      // A single bad file must never abort the run — record it and move on.
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

import 'dotenv/config';
import { runExtractionPipeline } from './pipeline/pipeline.js';
import { createLogger } from './services/loggerService.js';

const logger = createLogger();

try {
  await runExtractionPipeline({ logger });
} catch (error) {
  logger.error('Pipeline failed before completion', {
    error: error.message,
    context: error.context,
  });
  process.exitCode = 1;
}

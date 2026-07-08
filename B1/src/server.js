import 'dotenv/config';
import { createApp } from './app.js';
import { createDocumentRepository } from './services/documentRepository.js';
import { prisma } from './db/prismaClient.js';
import { createLogger } from './logger.js';

const logger = createLogger();
const port = Number(process.env.PORT || 3001);

const repository = createDocumentRepository(prisma);
const app = createApp({ repository, logger });

const server = app.listen(port, () => {
  logger.info('B1 document ingestion API listening', { port });
});

async function shutdown(signal) {
  logger.info('Shutting down', { signal });
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

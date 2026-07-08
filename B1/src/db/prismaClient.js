import { PrismaClient } from '@prisma/client';

// A single shared client for the process. Imported only by the real server
// wiring (server.js) — tests inject a fake repository instead, so they never
// require a running database or a generated Prisma client.
export const prisma = new PrismaClient();

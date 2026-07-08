import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';

const silentLogger = { info() {}, warn() {}, error() {} };

// In-memory stand-in for the Prisma-backed repository — keeps the endpoint
// tests fast and free of any running database.
function createFakeRepository(seed = []) {
  const documents = [...seed];
  let idCounter = seed.length;

  return {
    createCalls: 0,
    async findByDoi(doi) {
      return documents.find((doc) => doc.doi === doi) ?? null;
    },
    async create(document) {
      this.createCalls += 1;
      const stored = { id: `doc-${(idCounter += 1)}`, createdAt: new Date().toISOString(), ...document };
      documents.push(stored);
      return stored;
    },
  };
}

async function startApp(app) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

function uploadPdf(baseUrl, bytes = 'fake pdf bytes') {
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: 'application/pdf' }), 'paper.pdf');
  return fetch(`${baseUrl}/documents`, { method: 'POST', body: form });
}

test('POST /documents stores a new document and returns 201', async () => {
  const repository = createFakeRepository();
  const app = createApp({
    repository,
    logger: silentLogger,
    extractText: async () => 'ignored raw text',
    extractMetadata: () => ({
      doi: '10.1/new',
      title: 'A New Study',
      abstract: 'Some abstract',
      authors: ['Ada L.'],
      year: 2024,
    }),
  });

  const { server, baseUrl } = await startApp(app);
  try {
    const response = await uploadPdf(baseUrl);
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.deduplicated, false);
    assert.equal(body.document.title, 'A New Study');
    assert.equal(repository.createCalls, 1);
  } finally {
    server.close();
  }
});

test('POST /documents returns the existing record on a duplicate DOI', async () => {
  const repository = createFakeRepository([
    { id: 'doc-1', doi: '10.1/dupe', title: 'Original', abstract: 'x', authors: [], year: 2020 },
  ]);
  const app = createApp({
    repository,
    logger: silentLogger,
    extractText: async () => 'ignored',
    extractMetadata: () => ({
      doi: '10.1/dupe',
      title: 'Duplicate upload',
      abstract: 'y',
      authors: [],
      year: 2020,
    }),
  });

  const { server, baseUrl } = await startApp(app);
  try {
    const response = await uploadPdf(baseUrl);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.deduplicated, true);
    assert.equal(body.document.id, 'doc-1');
    assert.equal(body.document.title, 'Original');
    assert.equal(repository.createCalls, 0, 'must not create a duplicate row');
  } finally {
    server.close();
  }
});

test('POST /documents without a file returns 400', async () => {
  const app = createApp({ repository: createFakeRepository(), logger: silentLogger });

  const { server, baseUrl } = await startApp(app);
  try {
    const response = await fetch(`${baseUrl}/documents`, { method: 'POST' });
    assert.equal(response.status, 400);
  } finally {
    server.close();
  }
});

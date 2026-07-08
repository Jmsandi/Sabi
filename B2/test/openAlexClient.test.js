import assert from 'node:assert/strict';
import test from 'node:test';
import { OpenAlexClient } from '../src/openAlexClient.js';

function createSilentLogger() {
  return {
    info() {},
    warn() {},
    error() {},
  };
}

test('searchStudies paginates with cursor and normalizes records', async () => {
  const requestedUrls = [];
  const fetch = async (url) => {
    requestedUrls.push(url.toString());

    if (requestedUrls.length === 1) {
      return {
        ok: true,
        json: async () => ({
          meta: { next_cursor: 'cursor-2' },
          results: [
            {
              title: 'A useful study',
              doi: 'https://doi.org/10.123/example',
              publication_year: 2024,
              abstract_inverted_index: { This: [0], works: [1] },
              open_access: { oa_url: 'https://example.org/pdf' },
            },
          ],
        }),
      };
    }

    return {
      ok: true,
      json: async () => ({
        meta: { next_cursor: null },
        results: [
          {
            display_name: 'Second study',
            publication_year: 2023,
            primary_location: { landing_page_url: 'https://example.org/landing' },
          },
        ],
      }),
    };
  };

  const client = new OpenAlexClient({
    fetch,
    sleep: async () => {},
    logger: createSilentLogger(),
    maxResults: 2,
    pageSize: 1,
    rateLimitIntervalMs: 0,
  });

  const records = await client.searchStudies('screening');

  assert.equal(records.length, 2);
  assert.equal(records[0].abstract, 'This works');
  assert.equal(records[1].doi, 'not reported');
  assert.match(requestedUrls[0], /cursor=\*/);
  assert.match(requestedUrls[1], /cursor=cursor-2/);
});

test('searchStudies retries transient OpenAlex failures', async () => {
  let attempts = 0;
  const fetch = async () => {
    attempts += 1;
    if (attempts === 1) {
      return { ok: false, status: 503 };
    }

    return {
      ok: true,
      json: async () => ({ meta: { next_cursor: null }, results: [] }),
    };
  };

  const client = new OpenAlexClient({
    fetch,
    sleep: async () => {},
    logger: createSilentLogger(),
    maxResults: 1,
    rateLimitIntervalMs: 0,
    retryBaseDelayMs: 0,
  });

  await client.searchStudies('malaria');
  assert.equal(attempts, 2);
});

test('searchStudies retries low-level network failures', async () => {
  let attempts = 0;
  const fetch = async () => {
    attempts += 1;
    if (attempts === 1) {
      throw new TypeError('fetch failed');
    }

    return {
      ok: true,
      json: async () => ({ meta: { next_cursor: null }, results: [] }),
    };
  };

  const client = new OpenAlexClient({
    fetch,
    sleep: async () => {},
    logger: createSilentLogger(),
    maxResults: 1,
    rateLimitIntervalMs: 0,
    retryBaseDelayMs: 0,
  });

  await client.searchStudies('cholera');
  assert.equal(attempts, 2);
});

test('a slow upstream request is aborted by the timeout and never hangs', async () => {
  let attempts = 0;
  // Never resolves on its own; only settles when the AbortController fires.
  const fetch = (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      attempts += 1;
      signal.addEventListener('abort', () => {
        const abortError = new Error('The operation was aborted');
        abortError.name = 'AbortError';
        reject(abortError);
      });
    });

  const client = new OpenAlexClient({
    fetch,
    sleep: async () => {},
    logger: createSilentLogger(),
    maxResults: 1,
    rateLimitIntervalMs: 0,
    retryBaseDelayMs: 0,
    requestTimeoutMs: 5,
    maxAttempts: 2,
  });

  await assert.rejects(client.searchStudies('dengue'), { name: 'AbortError' });
  assert.equal(attempts, 2);
});

test('mailto is added to the request when configured (polite pool)', async () => {
  const requestedUrls = [];
  const fetch = async (url) => {
    requestedUrls.push(url.toString());
    return { ok: true, json: async () => ({ meta: { next_cursor: null }, results: [] }) };
  };

  const client = new OpenAlexClient({
    fetch,
    sleep: async () => {},
    logger: createSilentLogger(),
    maxResults: 1,
    rateLimitIntervalMs: 0,
    mailto: 'dev@example.org',
  });

  await client.searchStudies('tuberculosis');
  assert.match(requestedUrls[0], /mailto=dev%40example\.org/);
});

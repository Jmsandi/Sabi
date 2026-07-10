import { createLogger } from './logger.js';
import { normalizeOpenAlexWork } from './normalizeOpenAlexWork.js';
import { RateLimiter } from './rateLimiter.js';
import { isNetworkError, isRetryableStatus, withRetry } from './retry.js';

const DEFAULT_CONFIG = {
  baseUrl: 'https://api.openalex.org',
  maxResults: 500,
  pageSize: 200,
  requestTimeoutMs: 10000,
  rateLimitIntervalMs: 120,
  maxAttempts: 3,
  retryBaseDelayMs: 500,
  // hand OpenAlex a contact email and you land in the faster "polite pool"
  mailto: process.env.OPENALEX_MAILTO || null,
};

const defaultSleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));

export class OpenAlexClient {
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.fetch = options.fetch ?? globalThis.fetch;
    this.sleep = options.sleep ?? defaultSleep;
    this.logger = options.logger ?? createLogger('openalex');
    this.rateLimiter = new RateLimiter({
      intervalMs: this.config.rateLimitIntervalMs,
      sleep: this.sleep,
    });

    if (!this.fetch) {
      throw new Error('A fetch implementation is required. Use Node.js 18+ or pass fetch explicitly.');
    }
  }

  async searchStudies(searchString) {
    if (!searchString || !searchString.trim()) {
      throw new Error('searchString is required');
    }

    const records = [];
    let cursor = '*';

    while (records.length < this.config.maxResults && cursor) {
      const remaining = this.config.maxResults - records.length;
      const perPage = Math.min(this.config.pageSize, remaining);
      const response = await this.fetchPage({ searchString, cursor, perPage });

      records.push(...response.results.map(normalizeOpenAlexWork));
      cursor = response.meta?.next_cursor || null;

      this.logger.info('Fetched OpenAlex page', {
        pageRecords: response.results.length,
        totalRecords: records.length,
        hasNextCursor: Boolean(cursor),
      });

      if (response.results.length === 0) {
        break;
      }
    }

    return records.slice(0, this.config.maxResults);
  }

  async fetchPage({ searchString, cursor, perPage }) {
    const url = new URL('/works', this.config.baseUrl);
    url.searchParams.set('search', searchString);
    url.searchParams.set('per-page', String(perPage));
    url.searchParams.set('cursor', cursor);
    if (this.config.mailto) {
      url.searchParams.set('mailto', this.config.mailto);
    }

    return withRetry(
      async () => {
        await this.rateLimiter.wait();
        return this.requestJson(url);
      },
      {
        maxAttempts: this.config.maxAttempts,
        baseDelayMs: this.config.retryBaseDelayMs,
        sleep: this.sleep,
        logger: this.logger,
        // retry timeouts, dropped connections and flaky 5xx — never a 4xx
        shouldRetry: (error) =>
          error.name === 'AbortError' ||
          isNetworkError(error) ||
          isRetryableStatus(error.statusCode),
      },
    );
  }

  async requestJson(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);
    const headers = { Accept: 'application/json' };
    if (this.config.mailto) {
      // OpenAlex appreciates a User-Agent it can trace back to a human
      headers['User-Agent'] = `SabiCore-B2/1.0 (mailto:${this.config.mailto})`;
    }

    try {
      this.logger.info('Calling OpenAlex', { url: url.toString() });
      const response = await this.fetch(url, { signal: controller.signal, headers });

      if (!response.ok) {
        const error = new Error(`OpenAlex request failed with status ${response.status}`);
        error.statusCode = response.status;
        throw error;
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

import { AiProviderError } from '../errors/customErrors.js';
import { parseJsonObject } from '../utils/json.js';
import { retry } from '../utils/retry.js';
import { sleep } from '../utils/sleep.js';

const RETRYABLE_STATUS_CODES = new Set([408, 409, 429, 500, 502, 503, 504]);

export class GeminiExtractionProvider {
  constructor({ apiKey, model, requestTimeoutMs, maxAttempts, logger, fetch = globalThis.fetch }) {
    if (!apiKey) {
      throw new AiProviderError('GEMINI_API_KEY is required to run the live extraction pipeline');
    }
    if (!fetch) {
      throw new AiProviderError('A fetch implementation is required. Use Node.js 18+.');
    }

    this.apiKey = apiKey;
    this.model = model;
    this.requestTimeoutMs = requestTimeoutMs;
    this.maxAttempts = maxAttempts;
    this.logger = logger;
    this.fetch = fetch;
  }

  async extractStudyData(prompt, metadata) {
    return retry(
      async () => {
        const rawText = await this.callGemini(prompt, metadata);
        return parseJsonObject(rawText);
      },
      {
        maxAttempts: this.maxAttempts,
        baseDelayMs: 1000,
        sleep,
        logger: this.logger,
        shouldRetry: (error) => error.retryable === true,
      },
    );
  }

  async callGemini(prompt, metadata) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    try {
      this.logger.info('Calling Gemini extraction provider', {
        model: this.model,
        fileName: metadata.fileName,
        promptCharacters: prompt.length,
      });

      const response = await this.fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const detail = typeof response.text === 'function' ? await response.text() : '';
        const error = new AiProviderError(
          `Gemini request failed with status ${response.status}${detail ? `: ${detail}` : ''}`,
        );
        error.retryable = RETRYABLE_STATUS_CODES.has(response.status);
        throw error;
      }

      const payload = await response.json();
      const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n');
      if (!text) {
        throw new AiProviderError('Gemini response did not include text content');
      }

      return text;
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutError = new AiProviderError(`Gemini request timed out after ${this.requestTimeoutMs}ms`, {
          cause: error,
        });
        timeoutError.retryable = true;
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

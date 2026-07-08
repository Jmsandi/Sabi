import { AiProviderError } from '../errors/customErrors.js';
import { parseJsonObject } from '../utils/json.js';
import { retry } from '../utils/retry.js';
import { sleep } from '../utils/sleep.js';

const RETRYABLE_STATUS_CODES = new Set([408, 409, 429, 500, 502, 503, 504]);
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const STUDY_EXTRACTION_SCHEMA = {
  type: 'object',
  required: [
    'studyName',
    'country',
    'sampleSize',
    'intervention',
    'primaryOutcome',
    'resultDirection',
  ],
  additionalProperties: false,
  properties: {
    studyName: { type: 'string' },
    country: { type: 'string' },
    sampleSize: { type: 'string' },
    intervention: { type: 'string' },
    primaryOutcome: { type: 'string' },
    resultDirection: {
      type: 'string',
      enum: ['positive', 'negative', 'mixed', 'not reported'],
    },
  },
};

export class OpenAiExtractionProvider {
  constructor({ apiKey, model, requestTimeoutMs, maxAttempts, logger, fetch = globalThis.fetch }) {
    if (!apiKey) {
      throw new AiProviderError('OPENAI_API_KEY is required to run the live extraction pipeline');
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
        const rawText = await this.callOpenAi(prompt, metadata);
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

  async callOpenAi(prompt, metadata) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      this.logger.info('Calling OpenAI extraction provider', {
        model: this.model,
        fileName: metadata.fileName,
        promptCharacters: prompt.length,
      });

      const response = await this.fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: [
            {
              role: 'user',
              content: [{ type: 'input_text', text: prompt }],
            },
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'study_extraction',
              strict: true,
              schema: STUDY_EXTRACTION_SCHEMA,
            },
          },
        }),
      });

      if (!response.ok) {
        const detail = typeof response.text === 'function' ? await response.text() : '';
        const error = new AiProviderError(
          `OpenAI request failed with status ${response.status}${detail ? `: ${detail}` : ''}`,
        );
        error.retryable = RETRYABLE_STATUS_CODES.has(response.status);
        throw error;
      }

      const payload = await response.json();
      const text = extractResponseText(payload);
      if (!text) {
        throw new AiProviderError('OpenAI response did not include text content');
      }

      return text;
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutError = new AiProviderError(
          `OpenAI request timed out after ${this.requestTimeoutMs}ms`,
          { cause: error },
        );
        timeoutError.retryable = true;
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

function extractResponseText(payload) {
  if (typeof payload.output_text === 'string') {
    return payload.output_text;
  }

  return payload.output
    ?.flatMap((item) => item.content || [])
    .map((content) => content.text)
    .filter(Boolean)
    .join('\n');
}

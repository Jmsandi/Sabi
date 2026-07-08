import { config } from '../config/config.js';
import { GeminiExtractionProvider } from './geminiService.js';
import { MockExtractionProvider } from './mockExtractionProvider.js';
import { OpenAiExtractionProvider } from './openAiService.js';

/**
 * Provider factory — the single place to swap the LLM backend. OpenAI is the
 * default provider because the assessment asks for OpenAI, while Gemini remains
 * available as an alternate implementation behind the same boundary.
 */
export function createExtractionProvider({ logger }) {
  switch (config.providerName) {
    case 'openai':
      return new OpenAiExtractionProvider({ ...config.openai, logger });
    case 'gemini':
      return new GeminiExtractionProvider({ ...config.gemini, logger });
    case 'mock':
      return new MockExtractionProvider({ logger });
    default:
      throw new Error(`Unsupported extraction provider: ${config.providerName}`);
  }
}

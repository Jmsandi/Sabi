import { config } from '../config/config.js';
import { GeminiExtractionProvider } from './geminiService.js';
import { MockExtractionProvider } from './mockExtractionProvider.js';
import { OpenAiExtractionProvider } from './openAiService.js';

// The one place that knows which LLM backend we're on. OpenAI is the default
// (it's what the assessment asks for); Gemini and mock sit behind the same door.
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

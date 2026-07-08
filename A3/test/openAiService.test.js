import assert from 'node:assert/strict';
import test from 'node:test';
import { OpenAiExtractionProvider } from '../src/services/openAiService.js';

function createSilentLogger() {
  return { info() {}, warn() {}, error() {} };
}

test('OpenAiExtractionProvider requests structured JSON and parses the response', async () => {
  const calls = [];
  const fetch = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return {
      ok: true,
      json: async () => ({
        output_text: JSON.stringify({
          studyName: 'Trial A',
          country: 'Ghana',
          sampleSize: '120',
          intervention: 'Bed nets',
          primaryOutcome: 'Malaria incidence',
          resultDirection: 'positive',
        }),
      }),
    };
  };

  const provider = new OpenAiExtractionProvider({
    apiKey: 'test-key',
    model: 'gpt-4.1-mini',
    requestTimeoutMs: 1000,
    maxAttempts: 1,
    logger: createSilentLogger(),
    fetch,
  });

  const record = await provider.extractStudyData('Extract this paper', { fileName: 'paper.pdf' });

  assert.deepEqual(record, {
    studyName: 'Trial A',
    country: 'Ghana',
    sampleSize: '120',
    intervention: 'Bed nets',
    primaryOutcome: 'Malaria incidence',
    resultDirection: 'positive',
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.openai.com/v1/responses');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-key');
  assert.equal(calls[0].body.model, 'gpt-4.1-mini');
  assert.equal(calls[0].body.input[0].content[0].text, 'Extract this paper');
  assert.equal(calls[0].body.text.format.type, 'json_schema');
  assert.equal(calls[0].body.text.format.strict, true);
  assert.equal(calls[0].body.text.format.schema.additionalProperties, false);
});

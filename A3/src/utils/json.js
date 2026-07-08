export function parseJsonObject(rawText) {
  const trimmed = rawText.trim();
  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedJson ? fencedJson[1] : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response did not contain a JSON object');
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

const REQUIRED_FIELDS = [
  'studyName',
  'country',
  'sampleSize',
  'intervention',
  'primaryOutcome',
  'resultDirection',
];

const VALID_RESULT_DIRECTIONS = new Set(['positive', 'negative', 'mixed', 'not reported']);
const NOT_REPORTED = 'not reported';

export function normalizeExtractedRecord(record) {
  const normalizedRecord = {};

  for (const field of REQUIRED_FIELDS) {
    const value = record?.[field];
    normalizedRecord[field] = typeof value === 'string' && value.trim() ? value.trim() : NOT_REPORTED;
  }

  normalizedRecord.resultDirection = normalizedRecord.resultDirection.toLowerCase();
  if (!VALID_RESULT_DIRECTIONS.has(normalizedRecord.resultDirection)) {
    normalizedRecord.resultDirection = NOT_REPORTED;
  }

  return normalizedRecord;
}

export function createFailedRecord(fileName, reason) {
  return {
    studyName: fileName,
    country: NOT_REPORTED,
    sampleSize: NOT_REPORTED,
    intervention: NOT_REPORTED,
    primaryOutcome: reason || NOT_REPORTED,
    resultDirection: NOT_REPORTED,
  };
}

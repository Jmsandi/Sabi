const NOT_REPORTED = 'not reported';

// DOIs always start with "10." followed by a registrant code and a suffix.
const DOI_PATTERN = /\b10\.\d{4,9}\/[-._;()/:a-z0-9]+/i;
const YEAR_PATTERN = /\b(?:19|20)\d{2}\b/;

function firstMeaningfulLine(lines) {
  // Titles are usually the first substantial line that isn't a label.
  return (
    lines.find((line) => line.length > 15 && !/^abstract\b/i.test(line)) ??
    lines[0] ??
    NOT_REPORTED
  );
}

function extractAbstract(text) {
  const match = text.match(
    /abstract[:\s]*([\s\S]{40,2000}?)(?:\n\s*\n|\bkeywords\b|\bintroduction\b|\b1\.\s)/i,
  );
  if (!match) {
    return NOT_REPORTED;
  }
  return match[1].replace(/\s+/g, ' ').trim() || NOT_REPORTED;
}

// Matches a "Surname, I." author token (initials may be hyphenated), which is
// how the byline typically reads, e.g. "Chen, Y., Patel, K., and Smith, J."
const AUTHOR_PATTERN = /[A-Z][A-Za-z'’.-]+,\s*(?:[A-Z]\.[-\s]*)+/g;

function extractAuthors(lines, titleLine) {
  const titleIndex = lines.indexOf(titleLine);
  const candidate = titleIndex >= 0 ? lines[titleIndex + 1] : undefined;
  if (!candidate || candidate.length > 200 || /abstract/i.test(candidate)) {
    return [];
  }

  const matches = candidate.match(AUTHOR_PATTERN);
  if (!matches) {
    return [];
  }

  // Strip trailing separators/whitespace left by the byline formatting.
  return matches.map((name) => name.replace(/[\s,]+$/, '').trim()).filter(Boolean);
}

/**
 * Best-effort extraction of bibliographic metadata from raw PDF text. This is
 * intentionally heuristic — production ingestion would combine this with
 * publisher metadata (Crossref/DOI resolution). Fields that cannot be found are
 * returned as "not reported" (or an empty author list / null year), never
 * fabricated.
 *
 * @returns {{ doi: string|null, title: string, abstract: string, authors: string[], year: number|null }}
 */
export function extractPdfMetadata(text) {
  const safeText = typeof text === 'string' ? text : '';
  const lines = safeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const doiMatch = safeText.match(DOI_PATTERN);
  const yearMatch = safeText.match(YEAR_PATTERN);
  const title = firstMeaningfulLine(lines);

  return {
    doi: doiMatch ? doiMatch[0].replace(/[.,;]+$/, '') : null,
    title: title || NOT_REPORTED,
    abstract: extractAbstract(safeText),
    authors: extractAuthors(lines, title),
    year: yearMatch ? Number(yearMatch[0]) : null,
  };
}

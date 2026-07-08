import type { DecisionMap, Study } from '../types';

/** Wrap a value for safe CSV output (quote-escaped, always quoted). */
function toCsvField(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/**
 * Build a CSV of every study and its recorded screening decision, then trigger
 * a browser download. Studies without a decision are exported as "not reviewed"
 * so the output is always complete.
 */
export function exportDecisionsToCsv(studies: Study[], decisions: DecisionMap): void {
  const header = ['Study ID', 'Title', 'Authors', 'Year', 'Source', 'Decision'];

  const rows = studies.map((study) =>
    [
      study.id,
      study.title,
      study.authors,
      study.year,
      study.source,
      decisions[study.id] ?? 'not reviewed',
    ]
      .map(toCsvField)
      .join(','),
  );

  const csv = [header.map(toCsvField).join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'sabi-screening-decisions.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

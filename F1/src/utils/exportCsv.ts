import type { DecisionMap, Study } from '../types';

// quote every field and double up any inner quotes — the boring, correct CSV rule
function toCsvField(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

// Build a CSV of every study and its decision, then hand it to the browser as a
// download. Undecided studies come out as "not reviewed" so no row is left blank.
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

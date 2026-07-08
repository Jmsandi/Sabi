

export type Decision = 'include' | 'exclude' | 'flag';

export interface AbstractSection {
  label: string;
  text: string;
}

export interface Study {
  id: string;
  title: string;
  authors: string;
  shortAuthors: string;
  year: number;
  source: string;
  journal: string;
  tags: string[];
  status: string;
  abstract: AbstractSection[];
}

/** Map of study id -> the reviewer's recorded decision. */
export type DecisionMap = Record<string, Decision>;

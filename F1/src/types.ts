/**
 * Domain model for the study screening workflow.
 *
 * A `Study` mirrors the metadata a systematic reviewer needs to make an
 * include / exclude / flag decision. Abstracts are stored as labelled
 * sections (Background, Methods, ...) so the reader can render them as a
 * structured document rather than a single wall of text.
 */

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

function invertAbstractIndex(abstractInvertedIndex) {
  if (!abstractInvertedIndex || typeof abstractInvertedIndex !== 'object') {
    return 'not reported';
  }

  const wordsByPosition = [];
  for (const [word, positions] of Object.entries(abstractInvertedIndex)) {
    for (const position of positions) {
      wordsByPosition[position] = word;
    }
  }

  return wordsByPosition.filter(Boolean).join(' ') || 'not reported';
}

export function normalizeOpenAlexWork(work) {
  return {
    title: work.title || work.display_name || 'not reported',
    doi: work.doi || 'not reported',
    abstract: invertAbstractIndex(work.abstract_inverted_index),
    year: work.publication_year || 'not reported',
    openAccessUrl: work.open_access?.oa_url || work.primary_location?.landing_page_url || 'not reported',
  };
}

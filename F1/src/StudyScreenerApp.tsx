import { useCallback, useEffect, useMemo, useState } from 'react';
import { TopBar } from './components/TopBar';
import { ProgressBar } from './components/ProgressBar';
import { StudyDetails } from './components/StudyDetails';
import { AbstractReader } from './components/AbstractReader';
import { DecisionBar } from './components/DecisionBar';
import { CompletedView } from './components/CompletedView';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { exportDecisionsToCsv } from './utils/exportCsv';
import { mockStudies } from './data/mockStudies';
import type { Decision, DecisionMap } from './types';

const DECISIONS_STORAGE_KEY = 'sabi-f1-decisions';
const THEME_STORAGE_KEY = 'sabi-f1-theme';

function findNextUndecidedIndex(decisions: DecisionMap, startIndex: number): number {
  for (let index = startIndex; index < mockStudies.length; index += 1) {
    if (!decisions[mockStudies[index].id]) {
      return index;
    }
  }

  for (let index = 0; index < startIndex; index += 1) {
    if (!decisions[mockStudies[index].id]) {
      return index;
    }
  }

  return Math.min(startIndex, mockStudies.length - 1);
}

// The whole workflow lives here: where we are in the queue, what's been
// decided, the theme, and which of the two screens (review vs. done) to show.
export function StudyScreenerApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useLocalStorageState<DecisionMap>(DECISIONS_STORAGE_KEY, {});
  const [theme, setTheme] = useLocalStorageState<'light' | 'dark'>(THEME_STORAGE_KEY, 'light');
  // once they've hit the summary, this lets them dip back into the queue
  const [keepReviewing, setKeepReviewing] = useState(false);

  const currentStudy = mockStudies[currentIndex];
  const studyIds = useMemo(() => new Set(mockStudies.map((study) => study.id)), []);

  // toggle the theme class on <html> — the CSS variables key off it
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme !== 'dark');
  }, [theme]);

  const counts = useMemo(() => {
    const values = Object.entries(decisions)
      .filter(([studyId]) => studyIds.has(studyId))
      .map(([, decision]) => decision);

    return {
      reviewed: values.length,
      total: mockStudies.length,
      included: values.filter((decision) => decision === 'include').length,
      excluded: values.filter((decision) => decision === 'exclude').length,
      flagged: values.filter((decision) => decision === 'flag').length,
    };
  }, [decisions, studyIds]);

  const percentage = counts.total === 0 ? 0 : Math.round((counts.reviewed / counts.total) * 100);
  const isComplete = counts.total > 0 && counts.reviewed === counts.total;
  const showCompleted = isComplete && !keepReviewing;

  useEffect(() => {
    if (!isComplete) {
      setCurrentIndex((index) => findNextUndecidedIndex(decisions, index));
    }
  }, [decisions, isComplete]);

  const goToNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, mockStudies.length - 1));
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const recordDecision = useCallback(
    (decision: Decision) => {
      setDecisions((current) => {
        const nextDecisions = { ...current, [currentStudy.id]: decision };
        setCurrentIndex(findNextUndecidedIndex(nextDecisions, currentIndex + 1));
        return nextDecisions;
      });
    },
    [currentIndex, currentStudy.id, setDecisions],
  );

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  const handleExport = useCallback(() => {
    exportDecisionsToCsv(mockStudies, decisions);
  }, [decisions]);

  const handleReviewAgain = useCallback(() => {
    setKeepReviewing(true);
    setCurrentIndex(0);
  }, []);

  // shortcuts only make sense on the review screen, not the summary
  useKeyboardShortcuts({
    onDecision: showCompleted ? () => {} : recordDecision,
    onPrevious: showCompleted ? () => {} : goToPrevious,
    onNext: showCompleted ? () => {} : goToNext,
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      <TopBar theme={theme} onToggleTheme={toggleTheme} />

      {showCompleted ? (
        <CompletedView
          counts={{ included: counts.included, excluded: counts.excluded, flagged: counts.flagged }}
          onExport={handleExport}
          onReviewAgain={handleReviewAgain}
        />
      ) : (
        <>
          <ProgressBar reviewed={counts.reviewed} total={counts.total} percentage={percentage} />

          <main className="flex-1 flex flex-col md:flex-row gap-gutter p-lg max-w-container-max mx-auto w-full overflow-hidden">
            <StudyDetails study={currentStudy} />
            <AbstractReader study={currentStudy} />
          </main>

          <DecisionBar
            currentDecision={decisions[currentStudy.id]}
            isFirst={currentIndex === 0}
            isLast={currentIndex === mockStudies.length - 1}
            onDecision={recordDecision}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        </>
      )}
    </div>
  );
}

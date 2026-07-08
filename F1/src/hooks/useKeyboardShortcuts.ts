import { useEffect } from 'react';
import type { Decision } from '../types';

interface KeyboardHandlers {
  onDecision: (decision: Decision) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const decisionKeys: Record<string, Decision> = {
  i: 'include',
  e: 'exclude',
  f: 'flag',
};

/**
 * Global keyboard shortcuts for the screening workflow:
 *   I / E / F  -> include / exclude / flag
 *   ArrowLeft  -> previous study
 *   ArrowRight -> next study
 *
 * Shortcuts are suppressed while the user is typing in a form control so the
 * search box and future note fields keep working normally.
 */
export function useKeyboardShortcuts({ onDecision, onPrevious, onNext }: KeyboardHandlers): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const activeTag = document.activeElement?.tagName ?? '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        onPrevious();
        return;
      }
      if (event.key === 'ArrowRight') {
        onNext();
        return;
      }

      const decision = decisionKeys[event.key.toLowerCase()];
      if (decision) {
        onDecision(decision);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDecision, onPrevious, onNext]);
}

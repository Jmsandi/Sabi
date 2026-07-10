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

// I/E/F to decide, arrow keys to move. The point is that a reviewer can fly
// through the whole queue without ever reaching for the mouse.
export function useKeyboardShortcuts({ onDecision, onPrevious, onNext }: KeyboardHandlers): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      // don't steal keystrokes while someone's typing in a field
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

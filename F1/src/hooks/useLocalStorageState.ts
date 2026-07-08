import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/**
 * A `useState` that transparently persists to (and hydrates from) localStorage.
 * Reviewer decisions and the theme choice survive a page refresh, which is a
 * hard requirement for the screening workflow.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
    } catch {
      // Corrupted or unavailable storage should never break the app.
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota / private-mode write failures.
    }
  }, [key, value]);

  return [value, setValue];
}

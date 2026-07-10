import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

// A useState that quietly mirrors itself into localStorage, so decisions and
// the theme survive a refresh — which the prompt asks for.
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? (JSON.parse(storedValue) as T) : initialValue;
    } catch {
      // bad or unavailable storage shouldn't take the app down
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // private mode or a full quota — nothing to do but not crash
    }
  }, [key, value]);

  return [value, setValue];
}

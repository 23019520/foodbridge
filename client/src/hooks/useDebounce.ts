import { useState, useEffect } from 'react';

/**
 * Delays updating a value until the user stops typing.
 * Prevents firing an API search request on every single keystroke.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchInput, 400);
 *   useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch]);
 */
export const useDebounce = <T>(value: T, delayMs: number = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
};

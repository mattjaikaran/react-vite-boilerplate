/**
 * Debounce Hooks
 * Utilities for debouncing values and callbacks
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook to debounce a value
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook to debounce a callback function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// react-doctor-disable-next-line deslop/unused-export
export const useDebouncedCallback = <T extends (...args: any[]) => unknown>(
  callback: T,
  delay: number = 500
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    const timeout = timeoutRef;
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [timeoutRef]);

  return debouncedCallback;
};

/**
 * Hook to debounce with loading state
 */
// react-doctor-disable-next-line deslop/unused-export
export const useDebounceWithLoading = <T>(
  value: T,
  delay: number = 500
): { debouncedValue: T; isDebouncing: boolean } => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const pendingRef = useRef(false);

  // Track if value has changed but debounce hasn't fired yet
  if (debouncedValue !== value) {
    pendingRef.current = true;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      pendingRef.current = false;
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return { debouncedValue, isDebouncing: pendingRef.current };
};

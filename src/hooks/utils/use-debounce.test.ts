import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDebounceWithLoading } from './use-debounce';

afterEach(() => vi.useRealTimers());

describe('useDebounceWithLoading', () => {
  it('cancels stale values and clears pending state when the input returns to its settled value', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounceWithLoading(value, 100),
      { initialProps: { value: 'first' } }
    );
    rerender({ value: 'second' });
    expect(result.current).toEqual({
      debouncedValue: 'first',
      isDebouncing: true,
    });
    act(() => vi.advanceTimersByTime(50));
    rerender({ value: 'first' });
    expect(result.current).toEqual({
      debouncedValue: 'first',
      isDebouncing: false,
    });
    act(() => vi.advanceTimersByTime(50));
    expect(result.current.debouncedValue).toBe('first');
    rerender({ value: 'third' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toEqual({
      debouncedValue: 'third',
      isDebouncing: false,
    });
  });
});

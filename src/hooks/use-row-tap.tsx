import { useRef, useCallback } from 'react';

/**
 * Distinguishes single tap vs double tap on a row.
 * Single tap → onSingle (fires after delay if no second tap)
 * Double tap → onDouble (cancels pending single)
 */
export function useRowTap(onSingle: () => void, onDouble: () => void, delay = 250) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      onDouble();
      return;
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onSingle();
    }, delay);
  }, [onSingle, onDouble, delay]);
}

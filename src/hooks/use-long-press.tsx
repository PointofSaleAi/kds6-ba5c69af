import { useCallback, useEffect, useRef } from 'react';

interface Options {
  delay?: number;
  moveTolerance?: number;
  enabled?: boolean;
  /** Stop pointerdown propagation so an ancestor long-press host doesn't also arm. */
  stopPropagation?: boolean;
}

/**
 * Long-press detector. Fires onLongPress after `delay` ms of holding.
 * Movement beyond `moveTolerance` (px) cancels. The click event that
 * follows pointerup is suppressed when a long-press fired so the
 * underlying tap handler does not also run.
 */
export function useLongPress(onLongPress: () => void, options: Options = {}) {
  const { delay = 500, moveTolerance = 8, enabled = true, stopPropagation = false } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
  }, []);

  useEffect(() => () => clear(), [clear]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (stopPropagation) e.stopPropagation();
      // Only main pointer
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      firedRef.current = false;
      startRef.current = { x: e.clientX, y: e.clientY };
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        timerRef.current = null;
        onLongPress();
      }, delay);
    },
    [enabled, delay, onLongPress]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current || !timerRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      if (Math.hypot(dx, dy) > moveTolerance) clear();
    },
    [clear, moveTolerance]
  );

  const onPointerUp = useCallback(() => {
    clear();
  }, [clear]);

  const onPointerCancel = useCallback(() => {
    clear();
  }, [clear]);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (firedRef.current) {
      firedRef.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPointerLeave: onPointerCancel,
    onClickCapture,
  };
}

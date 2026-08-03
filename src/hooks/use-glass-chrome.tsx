import { useEffect, useSyncExternalStore } from 'react';

/**
 * Glass chrome mode. The Glass ticket board (/kds/glass) skins the surrounding
 * app chrome — top header, left rail, summary panel, footer, popovers and the
 * settings shell — with the same iOS-style frosted surfaces used by the
 * tickets. The active flag is mirrored onto `<html data-glass-chrome>` so
 * portalled overlays can opt in purely through CSS.
 */
let active = false;
const subscribers = new Set<() => void>();

function apply(next: boolean) {
  if (active === next) return;
  active = next;
  if (typeof document !== 'undefined') {
    if (next) document.documentElement.setAttribute('data-glass-chrome', '');
    else document.documentElement.removeAttribute('data-glass-chrome');
  }
  subscribers.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** Enable glass chrome for the lifetime of the calling screen. */
export function useGlassChromeMode(on: boolean) {
  useEffect(() => {
    apply(on);
    return () => apply(false);
  }, [on]);
}

/** Read whether glass chrome is currently active (reactive). */
export function useGlassChrome() {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => false,
  );
}

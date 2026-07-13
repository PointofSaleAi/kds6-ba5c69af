import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Per-product prep timer store.
 * - `startedAt` set when an item first transitions into "cooking" (seen/preparing).
 * - `endedAt` set when the item transitions to "done"; the timer freezes there.
 * - Undoing back to "cooking" clears `endedAt` (chip becomes live again from original startedAt).
 * - Undoing all the way to "idle" clears the entry entirely (chip disappears; next start begins at 0:00).
 *
 * The store lives above every OrderCard so timer state survives list re-sorts,
 * course relocations, and ticket re-renders — timers travel with their itemId.
 */
export interface ItemPrepTimer {
  startedAt: number;
  endedAt?: number;
}

interface ItemPrepTimersContextValue {
  get: (itemId: string) => ItemPrepTimer | undefined;
  start: (itemId: string) => void;
  stop: (itemId: string) => void;
  resumeFromDone: (itemId: string) => void;
  clear: (itemId: string) => void;
}

const Ctx = createContext<ItemPrepTimersContextValue | null>(null);

export function ItemPrepTimersProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<Record<string, ItemPrepTimer>>({});

  const get = useCallback((itemId: string) => timers[itemId], [timers]);

  const start = useCallback((itemId: string) => {
    setTimers((prev) => {
      if (prev[itemId] && !prev[itemId].endedAt) return prev;
      return { ...prev, [itemId]: { startedAt: Date.now() } };
    });
  }, []);

  const stop = useCallback((itemId: string) => {
    setTimers((prev) => {
      const cur = prev[itemId];
      const startedAt = cur?.startedAt ?? Date.now();
      if (cur?.endedAt) return prev;
      return { ...prev, [itemId]: { startedAt, endedAt: Date.now() } };
    });
  }, []);

  const resumeFromDone = useCallback((itemId: string) => {
    setTimers((prev) => {
      const cur = prev[itemId];
      if (!cur) return prev;
      const { endedAt: _e, ...rest } = cur;
      return { ...prev, [itemId]: { startedAt: cur.startedAt } };
    });
  }, []);

  const clear = useCallback((itemId: string) => {
    setTimers((prev) => {
      if (!(itemId in prev)) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ get, start, stop, resumeFromDone, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useItemPrepTimers() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useItemPrepTimers must be used within ItemPrepTimersProvider');
  return ctx;
}

/**
 * Drives the timer state machine from a caller-supplied 3-state lifecycle.
 * Pass the current logical state ('idle' | 'cooking' | 'done') and this hook
 * calls start / stop / resumeFromDone as the value changes.
 */
export function useItemPrepTimerSync(itemId: string, state: 'idle' | 'cooking' | 'done', enabled: boolean) {
  const { start, stop, resumeFromDone, clear } = useItemPrepTimers();
  const prev = useRef<'idle' | 'cooking' | 'done' | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const from = prev.current;
    prev.current = state;
    if (from === state) return;
    if (state === 'cooking') {
      if (from === 'done') resumeFromDone(itemId);
      else start(itemId);
    } else if (state === 'done') {
      stop(itemId);
    } else if (state === 'idle') {
      clear(itemId);
    }
  }, [state, enabled, itemId, start, stop, resumeFromDone, clear]);
}

function fmt(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

/**
 * Small pill that displays the per-item prep timer.
 * - `state === 'cooking'` → amber, live count-up (updates every second).
 * - `state === 'done'`    → muted green, frozen at final elapsed.
 * - `state === 'idle'`    → renders nothing.
 * The chip renders nothing when the `productTimers` setting is off.
 */
export function ItemPrepTimerChip({
  itemId,
  state,
  enabled,
}: {
  itemId: string;
  state: 'idle' | 'cooking' | 'done';
  enabled: boolean;
}) {
  useItemPrepTimerSync(itemId, state, enabled);
  const { get } = useItemPrepTimers();
  const [now, setNow] = useState(() => Date.now());
  const timer = get(itemId);
  const live = enabled && state === 'cooking' && !!timer && !timer.endedAt;
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [live]);
  if (!enabled) return null;
  if (!timer) return null;
  if (state === 'idle') return null;
  const end = timer.endedAt ?? now;
  const label = fmt(end - timer.startedAt);
  const isDone = state === 'done' || !!timer.endedAt;
  const bg = isDone ? 'rgba(39, 174, 96, 0.16)' : 'rgba(245, 158, 11, 0.22)';
  const color = isDone ? '#166534' : '#78350F';
  return (
    <span
      className="shrink-0 inline-flex items-center rounded-full font-mono-timer tabular-nums font-semibold"
      style={{
        background: bg,
        color,
        fontSize: '10px',
        lineHeight: 1,
        padding: '2px 6px',
      }}
      aria-label={`Prep timer ${label}${isDone ? ' (finished)' : ''}`}
      title={isDone ? `Finished in ${label}` : `Cooking for ${label}`}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {label}
    </span>

  );
}

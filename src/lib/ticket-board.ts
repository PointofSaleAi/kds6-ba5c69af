import { useEffect, useState } from 'react';

export type TicketBoardId = 'distance-view' | 'focus-lane' | 'timeline-flow';
const KEY = 'posai-ticket-board';
const EVT = 'posai-ticket-board-change';
const VALID: TicketBoardId[] = ['distance-view', 'focus-lane', 'timeline-flow'];

export function readStoredBoard(): TicketBoardId {
  try {
    const v = localStorage.getItem(KEY) as TicketBoardId | null;
    return v && VALID.includes(v) ? v : 'distance-view';
  } catch {
    return 'distance-view';
  }
}

export function writeStoredBoard(id: string) {
  if (!VALID.includes(id as TicketBoardId)) return;
  try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVT));
}

/** Live-updating saved board choice (chosen in Ticket Studio). */
export function useStoredBoard(): TicketBoardId {
  const [b, setB] = useState<TicketBoardId>(readStoredBoard);
  useEffect(() => {
    const on = () => setB(readStoredBoard());
    window.addEventListener(EVT, on);
    window.addEventListener('storage', on);
    return () => { window.removeEventListener(EVT, on); window.removeEventListener('storage', on); };
  }, []);
  return b;
}

export type TimelineLaneKey = 'new' | 'cooking' | 'plating' | 'ready';
export const TIMELINE_LANES: { key: TimelineLaneKey; label: string; tone: string }[] = [
  { key: 'new', label: 'New', tone: '#E84C3D' },
  { key: 'cooking', label: 'Cooking', tone: '#E67E22' },
  { key: 'plating', label: 'Plating', tone: '#2980B9' },
  { key: 'ready', label: 'Ready', tone: '#16A085' },
];

/**
 * Lane from item states. Each state is one of unseen | seen | preparing | ready | served.
 * New = all unseen; Ready = all ready/served; Plating = some ready; else Cooking.
 */
export function laneForStates(states: string[]): TimelineLaneKey {
  const active = states.filter((s) => s !== 'cleared');
  if (active.length === 0 || active.every((s) => s === 'unseen')) return 'new';
  const done = (s: string) => s === 'ready' || s === 'served' || s === 'done';
  if (active.every(done)) return 'ready';
  if (active.some(done)) return 'plating';
  return 'cooking';
}

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

export type TimelineLaneKey = 'new' | 'preparing' | 'ready' | 'served';
export const TIMELINE_LANES: { key: TimelineLaneKey; label: string; tone: string }[] = [
  { key: 'new', label: 'New', tone: '#E84C3D' },
  { key: 'preparing', label: 'Preparing', tone: '#E67E22' },
  { key: 'ready', label: 'Ready', tone: '#16A085' },
  { key: 'served', label: 'Served', tone: '#95A5A6' },
];

const RANK: Record<string, number> = { unseen: 0, new: 0, seen: 0, preparing: 1, ready: 2, done: 2, served: 3 };
const LANE_BY_RANK: TimelineLaneKey[] = ['new', 'preparing', 'ready', 'served'];

/** Lane = least-progressed active item (cleared items ignored). */
export function laneForStates(states: string[]): TimelineLaneKey {
  const active = states.filter((s) => s !== 'cleared');
  if (active.length === 0) return 'served';
  const min = Math.min(...active.map((s) => RANK[s] ?? 0));
  return LANE_BY_RANK[min];
}

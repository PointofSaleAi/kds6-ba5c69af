import type { Order, OrderType } from '@/types/kds';
import { formatTime } from '@/lib/datetime';

export function fmtElapsed(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function fmtElapsedAgo(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  if (s < 60) return `${s} sec. ago`;
  const m = Math.floor(s / 60);
  return `${m} min. ago`;
}

const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  'dine-in': 'Dine in',
  'take-out': 'Take out',
  'delivery': 'Delivery',
  'banquet': 'Banquet',
  'drive-thru': 'Drive-thru',
  'curb-side': 'Curb-side',
  'scheduled': 'Scheduled',
  'phone-in': 'Phone in',
  'custom': 'Custom',
};

export function orderTypeLabel(t: OrderType): string {
  return ORDER_TYPE_LABEL[t] || String(t);
}

export function courseLabel(name: string): string {
  return name.replace(/_/g, ' ').toUpperCase();
}

export function courseFireTime(order: Order, courseIndex: number): string | undefined {
  // Stagger fire-time across courses for visual interest (every 15 min)
  const c = order.courses[courseIndex];
  if (!c) return undefined;
  if (c.firedAt) {
    return formatTime(c.firedAt);
  }
  return undefined;
}

/** Stable sort placing "done" items at the bottom. */
export function sortDoneLast<T>(items: T[], isDone: (item: T) => boolean): T[] {
  return items
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => (isDone(a.item) ? 1 : 0) - (isDone(b.item) ? 1 : 0) || a.idx - b.idx)
    .map((x) => x.item);
}

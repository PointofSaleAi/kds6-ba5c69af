import { createContext, useContext } from 'react';
import type { Order, OrderType, SortMode, ViewMode } from '@/types/kds';
import type { GlassStage, GlassTicket } from './glass-tickets-data';

export type GlassView = 'home' | 'history' | 'seen-orders' | 'unseen-orders';

export interface GlassBoardCtx {
  /* view state */
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
  orderTypeFilter: OrderType[];
  setOrderTypeFilter: (v: OrderType[]) => void;
  /* screen (left rail) */
  view: GlassView;
  setView: (v: GlassView) => void;
  seenCount: number;
  unseenCount: number;
  historyCount: number;
  /* summary-driven filters */
  selectedItems: Set<string>;
  toggleItem: (name: string) => void;
  selectedCategories: Set<string>;
  toggleCategory: (cat: string) => void;
  clearAll: () => void;
  /* tickets */
  tickets: GlassTicket[];
  orders: Order[];
  now: number;
  elapsedFor: (t: GlassTicket) => number;
  /* item lifecycle */
  itemStages: Record<string, GlassStage>;
  tapItem: (key: string) => void;
  recallItem: (key: string) => void;
  stepTicket: (t: GlassTicket, dir: number) => void;
  prepLabelFor: (key: string, stage: GlassStage) => string;
  /* course open/collapse */
  openCourses: Record<string, boolean>;
  toggleCourse: (courseKey: string, current: boolean) => void;
  expandAll: boolean;
  setExpandAll: (on: boolean) => void;
  /* order-note acknowledgement + POS message seen state */
  notesAck: Record<string, boolean>;
  setNoteAck: (ticketId: string, on: boolean) => void;
  posSeen: Record<string, boolean>;
  setPosSeen: (ticketId: string, on: boolean) => void;
}

/**
 * Lives in a component-free module so React Fast Refresh never re-creates the
 * context object out from under mounted consumers.
 */
export const GlassBoardContext = createContext<GlassBoardCtx | null>(null);

export function useGlassBoard() {
  const ctx = useContext(GlassBoardContext);
  if (!ctx) throw new Error('useGlassBoard must be used inside GlassBoardProvider');
  return ctx;
}

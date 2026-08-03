import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { CourseType, Order, OrderType, ProductCategory, SortMode, ViewMode } from '@/types/kds';
import {
  ORDER,
  TICKETS,
  fmt,
  keyOf,
  ticketKeys,
  ticketStage,
  type GlassStage,
  type GlassTicket,
} from './glass-tickets-data';

/* ── mapping helpers (glass mock data → shared KDS shapes) ── */

const KIND_TO_ORDER_TYPE: Record<GlassTicket['kind'], OrderType> = {
  table: 'dine-in',
  pickup: 'take-out',
  takeout: 'take-out',
  delivery: 'delivery',
  drive: 'drive-thru',
  curb: 'curb-side',
  banquet: 'banquet',
  phone: 'phone-in',
  sched: 'scheduled',
};

const COURSE_CATEGORY: Record<string, string> = {
  APPETIZER: 'Appetizers',
  SALAD: 'Salads',
  ENTREE: 'Entrees',
  DESSERT: 'Desserts',
};

export function glassCategory(courseLabel?: string): ProductCategory {
  if (!courseLabel) return 'Items' as ProductCategory;
  return (COURSE_CATEGORY[courseLabel] || 'Items') as ProductCategory;
}

const qtyOf = (qty: string) => Math.max(1, parseInt(qty, 10) || 1);

/* ── persistence ── */

const LS_KEY = 'kds-glass-board-state';

interface Persisted {
  viewMode: ViewMode;
  sortMode: SortMode;
  orderTypeFilter: OrderType[];
  selectedItems: string[];
  selectedCategories: string[];
}

function readPersisted(): Partial<Persisted> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

export type GlassView = 'home' | 'history' | 'seen-orders' | 'unseen-orders';

interface GlassBoardCtx {
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


const Ctx = createContext<GlassBoardCtx | null>(null);

export function GlassBoardProvider({ children }: { children: ReactNode }) {
  const persisted = useRef(readPersisted()).current;

  const [viewMode, setViewMode] = useState<ViewMode>(persisted.viewMode || 'stagger');
  const [sortMode, setSortMode] = useState<SortMode>(persisted.sortMode || 'newest');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType[]>(persisted.orderTypeFilter || []);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(persisted.selectedItems || []));
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(persisted.selectedCategories || []),
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          viewMode,
          sortMode,
          orderTypeFilter,
          selectedItems: Array.from(selectedItems),
          selectedCategories: Array.from(selectedCategories),
        } satisfies Persisted),
      );
    } catch {
      /* ignore */
    }
  }, [viewMode, sortMode, orderTypeFilter, selectedItems, selectedCategories]);

  /* ── clock ── */
  const [now, setNow] = useState(() => Date.now());
  const t0 = useRef(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsedFor = useCallback((t: GlassTicket) => t.base + (now - t0.current) / 1000, [now]);

  /* ── item lifecycle ── */
  const [itemStages, setItemStages] = useState<Record<string, GlassStage>>({});
  const prepAt = useRef<Record<string, number>>({});
  const prepFrozen = useRef<Record<string, number>>({});
  const lastTap = useRef<{ k: string; at: number } | null>(null);

  const stepItem = useCallback((k: string, dir: number) => {
    setItemStages((prev) => {
      const i = ORDER.indexOf(prev[k] || 'unseen');
      const stage = ORDER[Math.min(ORDER.length - 1, Math.max(0, i + dir))];
      const from = prev[k] || 'unseen';
      if (stage === 'preparing' && from !== 'preparing') prepAt.current[k] = Date.now();
      if (from === 'preparing' && stage !== 'preparing')
        prepFrozen.current[k] = Math.round((Date.now() - (prepAt.current[k] || Date.now())) / 1000);
      return { ...prev, [k]: stage };
    });
  }, []);

  const tapItem = useCallback(
    (k: string) => {
      const nowMs = Date.now();
      const last = lastTap.current;
      if (last && last.k === k && nowMs - last.at < 420) {
        lastTap.current = null;
        stepItem(k, -2);
        return;
      }
      lastTap.current = { k, at: nowMs };
      stepItem(k, 1);
    },
    [stepItem],
  );

  const stepTicket = useCallback((t: GlassTicket, dir: number) => {
    setItemStages((prev) => {
      const i = ORDER.indexOf(ticketStage(t, prev));
      const stage = ORDER[Math.min(ORDER.length - 1, Math.max(0, i + dir))];
      const next = { ...prev };
      ticketKeys(t).forEach((k) => {
        const from = next[k] || 'unseen';
        if (stage === 'preparing' && from !== 'preparing') prepAt.current[k] = Date.now();
        if (from === 'preparing' && stage !== 'preparing')
          prepFrozen.current[k] = Math.round((Date.now() - (prepAt.current[k] || Date.now())) / 1000);
        next[k] = stage;
      });
      return next;
    });
  }, []);

  const prepLabelFor = useCallback(
    (k: string, stage: GlassStage) => {
      if (stage === 'preparing') return fmt((now - (prepAt.current[k] || now)) / 1000);
      return fmt(prepFrozen.current[k] || 0);
    },
    [now],
  );

  /* ── course open state ── */
  const [openCourses, setOpenCourses] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAllState] = useState(false);

  const toggleCourse = useCallback((courseKey: string, current: boolean) => {
    setExpandAllState(false);
    setOpenCourses((prev) => ({ ...prev, [courseKey]: !current }));
  }, []);

  const setExpandAll = useCallback((on: boolean) => {
    setExpandAllState(on);
    const next: Record<string, boolean> = {};
    TICKETS.forEach((t) => t.courses.forEach((c) => { next[`${t.id}:${c.id}`] = on; }));
    setOpenCourses(next);
  }, []);

  /* ── order notes / POS message acknowledgement ── */
  const [notesAck, setNotesAckState] = useState<Record<string, boolean>>({});
  const [posSeen, setPosSeenState] = useState<Record<string, boolean>>({});
  const setNoteAck = useCallback((ticketId: string, on: boolean) => {
    setNotesAckState((prev) => ({ ...prev, [ticketId]: on }));
  }, []);
  const setPosSeen = useCallback((ticketId: string, on: boolean) => {
    setPosSeenState((prev) => ({ ...prev, [ticketId]: on }));
  }, []);

  /* ── filters + sort ── */
  const toggleItem = useCallback((name: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedItems(new Set());
    setSelectedCategories(new Set());
  }, []);

  /* ── screen selection (left rail: All / Seen / Unseen / History) ── */
  const [view, setView] = useState<GlassView>('home');

  const isServed = useCallback(
    (t: GlassTicket) => ticketKeys(t).every((k) => (itemStages[k] || 'unseen') === 'served'),
    [itemStages],
  );

  const tickets = useMemo(() => {
    const remaining = (t: GlassTicket) => {
      const out: { name: string; category: string }[] = [];
      t.courses.forEach((c) =>
        c.items.forEach((it, i) => {
          if ((itemStages[keyOf(t.id, c.id, i)] || 'unseen') === 'served') return;
          out.push({ name: it.name, category: glassCategory(c.label) as string });
        }),
      );
      return out;
    };

    const filtered = TICKETS.filter((t) => {
      const served = isServed(t);
      // Served tickets leave the board and live in History (recall to bring back).
      if (view === 'history' ? !served : served) return false;
      if (view === 'seen-orders' && ticketStage(t, itemStages) === 'unseen') return false;
      if (view === 'unseen-orders' && ticketStage(t, itemStages) !== 'unseen') return false;
      if (orderTypeFilter.length && !orderTypeFilter.includes(KIND_TO_ORDER_TYPE[t.kind])) return false;
      const rem = remaining(t);
      if (selectedCategories.size && !rem.some((r) => selectedCategories.has(r.category))) return false;
      if (selectedItems.size && !rem.some((r) => selectedItems.has(r.name))) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (sortMode) {
      // base = seconds already waited, so a larger base is an older ticket
      case 'newest': sorted.sort((a, b) => a.base - b.base); break;
      case 'oldest': sorted.sort((a, b) => b.base - a.base); break;
      case 'table': sorted.sort((a, b) => a.type.localeCompare(b.type, undefined, { numeric: true })); break;
      case 'type': sorted.sort((a, b) => a.kind.localeCompare(b.kind) || a.base - b.base); break;
    }
    return sorted;
  }, [itemStages, isServed, orderTypeFilter, selectedCategories, selectedItems, sortMode, view]);

  /* ── left-rail badge counts (active board, ignoring the current screen) ── */
  const { seenCount, unseenCount, historyCount } = useMemo(() => {
    let seen = 0, unseen = 0, history = 0;
    TICKETS.forEach((t) => {
      if (isServed(t)) { history += 1; return; }
      if (ticketStage(t, itemStages) === 'unseen') unseen += 1;
      else seen += 1;
    });
    return { seenCount: seen, unseenCount: unseen, historyCount: history };
  }, [itemStages, isServed]);


  /* ── shared-shape orders for the summary panel (derived, never hardcoded) ── */
  const orders = useMemo<Order[]>(
    () =>
      tickets.map((t, idx) => {
        const elapsed = Math.round(elapsedFor(t));
        const stage = ticketStage(t, itemStages);
        const allServed = ticketKeys(t).every((k) => (itemStages[k] || 'unseen') === 'served');
        return {
          id: t.id,
          orderNumber: Number(t.num) || idx + 1,
          orderType: KIND_TO_ORDER_TYPE[t.kind],
          status: allServed ? 'served' : stage === 'unseen' ? 'new' : 'preparing',
          tableName: t.type,
          serverName: t.server,
          timeReceived: new Date(now - elapsed * 1000),
          elapsedSeconds: elapsed,
          targetSeconds: 900,
          itemCount: t.courses.reduce((a, c) => a + c.items.length, 0),
          courses: t.courses.map((c) => ({
            course: (c.label || 'ENTREE') as CourseType,
            items: c.items.map((it, i) => {
              const k = keyOf(t.id, c.id, i);
              return {
                id: k,
                name: it.name,
                quantity: qtyOf(it.qty),
                category: glassCategory(c.label),
                modifiers: [],
                allergens: [],
                notes: it.note,
                // Unseen items drive the summary panel's UNSEEN section.
                isNew: (itemStages[k] || 'unseen') === 'unseen',
                isCompleted: (itemStages[k] || 'unseen') === 'served',
              };
            }),
          })),
        };
      }),
    [tickets, itemStages, elapsedFor, now],
  );

  const value: GlassBoardCtx = {
    viewMode, setViewMode,
    sortMode, setSortMode,
    orderTypeFilter, setOrderTypeFilter,
    view, setView, seenCount, unseenCount, historyCount,

    selectedItems, toggleItem,
    selectedCategories, toggleCategory,
    clearAll,
    tickets, orders, now, elapsedFor,
    itemStages, tapItem, stepTicket, prepLabelFor,
    openCourses, toggleCourse, expandAll, setExpandAll,
    notesAck, setNoteAck, posSeen, setPosSeen,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGlassBoard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGlassBoard must be used inside GlassBoardProvider');
  return ctx;
}

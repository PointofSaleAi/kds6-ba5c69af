import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, Timer, LayoutGrid, GalleryHorizontalEnd, Columns3 } from 'lucide-react';
import type { ViewMode } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS, type OrderTypeColors } from '@/hooks/use-kds-settings';
import { useOrderStore } from '@/hooks/use-order-store';
import {
  kitchenStations,
  type ExpoTicket,
  type ExpoStation,
  type ExpoItemStatus,
} from '@/data/mock-expo-orders';
import { createDemoTickets, type DemoExpoTicket } from '@/data/mock-expo-demo';

/* -- helpers -- */

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatClockTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function allDone(t: ExpoTicket, holds?: Set<string>) {
  return t.stations.every(s => s.status === 'done' || holds?.has(`${t.id}-${s.name}`));
}
function allItemsDone(t: ExpoTicket) {
  return t.items.every(i => i.status === 'done');
}
function isOvertime(t: ExpoTicket) {
  return t.timerSeconds >= 900;
}
function isWarning(t: ExpoTicket) {
  return t.timerSeconds >= 600 && t.timerSeconds < 900;
}

function ticketBorderClass(t: ExpoTicket): string {
  if (t.items.every(i => i.status === 'done')) return 'border-l-success';
  if (isOvertime(t)) return 'border-l-destructive';
  if (isWarning(t)) return 'border-l-border';
  return 'border-l-border';
}

function ticketHeaderBg(t: ExpoTicket, colors: OrderTypeColors): { bg?: string; bgColor?: string; text: string } {
  if (isOvertime(t)) return { bg: 'bg-[#450a0a]', text: 'text-primary-foreground' };
  if (isWarning(t)) return { bg: 'bg-warning/20', text: 'text-text-primary' };
  const color = colors[t.orderType] || DEFAULT_ORDER_TYPE_COLORS[t.orderType] || DEFAULT_ORDER_TYPE_COLORS['dine-in'];
  return { bgColor: color, text: 'text-primary-foreground' };
}

const orderTypeLabel: Record<string, string> = {
  'dine-in': 'DINE IN',
  'take-out': 'TAKE OUT',
  banquet: 'BANQUET',
};

/* -- Item status helpers -- */

function getItemDisplayStatus(status: ExpoItemStatus): { label: string; bg: string; text: string } {
  if (status === 'done') return { label: 'Prepared', bg: 'bg-success/15', text: 'text-success' };
  if (status === 'firing') return { label: 'Preparing', bg: 'bg-warning/20', text: 'text-warning' };
  return { label: 'Pending', bg: 'bg-muted', text: 'text-text-muted' };
}

/* -- Station Chips with state-based coloring -- */

function ExpoStationChips({
  ticket,
  holdStations,
  onToggleHold,
}: {
  ticket: ExpoTicket;
  holdStations: Set<string>;
  onToggleHold: (ticketId: string, stationName: string) => void;
}) {
  const overtime = isOvertime(ticket);

  return (
    <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-border">
      {ticket.stations.map(s => {
        const holdKey = `${ticket.id}-${s.name}`;
        const isHolding = holdStations.has(holdKey);
        const showHoldToggle = !overtime && (s.status === 'done' || isHolding);

        let chipBg: string, chipText: string, chipBorder: string, indicator: string;
        if (isHolding) {
          chipBg = 'bg-warning/30';
          chipText = 'text-warning';
          chipBorder = '';
          indicator = ' Holding';
        } else if (s.status === 'done') {
          chipBg = 'bg-success/15';
          chipText = 'text-success';
          chipBorder = '';
          indicator = ' \u2713';
        } else if (s.status === 'firing') {
          chipBg = 'bg-warning/20';
          chipText = 'text-warning';
          chipBorder = '';
          indicator = ' \u00B7\u00B7\u00B7';
        } else {
          chipBg = 'bg-transparent';
          chipText = 'text-text-muted';
          chipBorder = 'border border-border';
          indicator = '';
        }

        return (
          <span
            key={s.name}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${chipBg} ${chipText} ${chipBorder} ${showHoldToggle ? 'cursor-pointer' : ''}`}
            onClick={showHoldToggle ? () => onToggleHold(ticket.id, s.name) : undefined}
          >
            {s.name}{indicator}
            {showHoldToggle && (
              <span className="ml-0.5 text-[8px] opacity-70 font-normal">
                {isHolding ? '(Release)' : '(Hold)'}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/* -- ExpoTicketCard -- */

interface ExpoTicketCardProps {
  ticket: ExpoTicket;
  onSendOut: (id: string) => void;
  onRush?: (id: string) => void;
  holdStations: Set<string>;
  onToggleHold: (ticketId: string, stationName: string) => void;
  isDemo?: boolean;
  onDemoItemTap?: (ticketId: string, itemId: string) => void;
}

function ExpoTicketCard({ ticket, onSendOut, onRush, holdStations, onToggleHold, isDemo, onDemoItemTap }: ExpoTicketCardProps) {
  const { tp } = useLanguage();
  const { orderTypeColors } = useKDSSettings();
  const demoTicket = isDemo ? (ticket as DemoExpoTicket) : null;
  const doneCount = ticket.items.filter(i => i.status === 'done').length;
  const totalCount = ticket.items.length + (demoTicket?.coursing?.pending?.items?.length || 0);
  const isReady = allItemsDone(ticket);
  const overtime = isOvertime(ticket);
  const headerStyle = ticketHeaderBg(ticket, orderTypeColors);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.35 } }}
      className={`rounded-lg overflow-hidden bg-surface-card shadow-sm border-l-4 ${ticketBorderClass(ticket)} transition-all duration-300 relative`}
    >

      {/* Header */}
      <div className={`flex items-center justify-between px-2 py-1.5 ${headerStyle.bg || ''} ${headerStyle.text}`} style={headerStyle.bgColor ? { backgroundColor: headerStyle.bgColor } : undefined}>
        <div className="flex flex-col">
          <span className="text-[14px] font-bold uppercase tracking-wide leading-tight">
            {orderTypeLabel[ticket.orderType] || ticket.orderType.toUpperCase()} &middot; {ticket.tableName}
          </span>
          <span className="text-[12px] font-bold opacity-85 leading-tight">
            #{ticket.orderNumber}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold">{formatTimer(ticket.timerSeconds)}</span>
      </div>

      {/* Station chips */}
      <ExpoStationChips ticket={ticket} holdStations={holdStations} onToggleHold={onToggleHold} />

      {/* Coursing: Served course (collapsed) for demo ticket 6 */}
      {demoTicket?.coursing?.served && (
        <div className="px-2 py-1 border-b border-border bg-muted/50">
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <span>&#9654;</span>
            <span className="font-bold uppercase tracking-wider">{demoTicket.coursing.served.course} &middot; SERVED</span>
            <span className="ml-auto text-[10px]">Done at {demoTicket.coursing.served.doneAt}</span>
          </div>
        </div>
      )}

      {/* Active course label for coursed demo tickets */}
      {demoTicket?.coursing?.active && (
        <div className="px-2 py-1 border-b border-border">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            {demoTicket.coursing.active.course} &middot; {demoTicket.coursing.active.label}
          </span>
        </div>
      )}

      {/* Item rows */}
      <div className="px-2 py-1.5 space-y-0.5">
        {ticket.items.map(item => {
          const display = getItemDisplayStatus(item.status);
          const isPrepared = item.status === 'done';

          return (
            <div
              key={item.id}
              className={`flex items-start justify-between py-0.5 ${isPrepared ? 'border-l-[3px] border-l-success pl-1.5 -ml-2' : ''} ${isDemo ? 'cursor-pointer' : ''}`}
              onClick={isDemo && onDemoItemTap ? () => onDemoItemTap(ticket.id, item.id) : undefined}
            >
              <div className="flex-1 min-w-0 flex items-center flex-wrap gap-1.5">
                <span className={`text-[13px] ${isPrepared ? 'font-bold text-text-primary' : 'font-medium text-text-primary'}`}>
                  {item.quantity}&times; {tp(item.name)}
                </span>
                <span className={`inline-flex items-center px-1.5 py-px rounded-full text-[10px] font-bold ${display.bg} ${display.text}`}>
                  {display.label}
                </span>
                {item.statusLabel && (
                  <span className="text-[10px] text-text-muted">{item.statusLabel}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending course for demo ticket 6 */}
      {demoTicket?.coursing?.pending && (
        <>
          <div className="px-2 py-1 border-t border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {demoTicket.coursing.pending.course} &middot; {demoTicket.coursing.pending.label}
            </span>
          </div>
          <div className="px-2 py-1 opacity-40">
            {demoTicket.coursing.pending.items.map(pi => (
              <div key={pi.id} className="flex items-center gap-1.5 py-0.5">
                <span className="text-[13px] font-medium text-text-primary">
                  {pi.quantity}&times; {pi.name}
                </span>
                <span className="inline-flex items-center px-1.5 py-px rounded-full text-[10px] font-bold bg-muted text-text-muted">
                  Pending
                </span>
                <span className="text-[10px] text-text-muted">{pi.timeLabel}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="p-1.5 border-t border-border">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[11px] font-bold text-text-muted">{doneCount} of {totalCount} done</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onRush?.(ticket.id)}
            className={`px-3 py-2.5 border text-[12px] font-bold uppercase rounded transition-colors min-h-[44px] ${
              overtime
                ? 'border-destructive bg-destructive/10 text-destructive'
                : 'border-destructive text-destructive hover:bg-destructive/10'
            }`}
          >
            Rush
          </button>
          <button
            onClick={() => isReady && onSendOut(ticket.id)}
            disabled={!isReady}
            className={`flex-1 py-2.5 text-[13px] font-bold uppercase rounded flex items-center justify-center gap-2 transition-colors min-h-[44px] ${
              isReady
                ? 'bg-success text-primary-foreground hover:opacity-90 cursor-pointer'
                : 'bg-muted text-text-muted cursor-not-allowed'
            }`}
          >
            Send out
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* -- Station Status Bar -- */

function ExpoStationBar() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-surface-card border-b border-border shrink-0">
      <span className="text-[10px] font-bold uppercase text-text-muted tracking-widest mr-1">Stations</span>
      {kitchenStations.map(s => (
        <span
          key={s.name}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-[11px] font-bold text-text-secondary"
        >
          <span className={`w-2 h-2 rounded-full ${s.dotClass} shrink-0`} />
          {s.name}
        </span>
      ))}
    </div>
  );
}

/* -- Top Bar Filter Buttons -- */

type ExpoFilter = 'all' | 'ready' | 'recalled';

function ExpoTopControls({
  filter,
  onFilterChange,
  fulfilledTickets,
}: {
  filter: ExpoFilter;
  onFilterChange: (f: ExpoFilter) => void;
  fulfilledTickets: number[];
}) {
  const handleRecalledClick = () => {
    if (fulfilledTickets.length === 0) {
      toast('No recently fulfilled tickets.');
    } else {
      toast(`Recently fulfilled: ${fulfilledTickets.map(n => `#${n}`).join(', ')}`);
    }
    onFilterChange('recalled');
  };

  const filters: { key: ExpoFilter; label: string }[] = [
    { key: 'all', label: 'All tickets' },
    { key: 'ready', label: 'Ready only' },
    { key: 'recalled', label: 'Recalled' },
  ];

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-surface-card border-b border-border shrink-0">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: '#7c3aed', color: '#ede9fe' }}
      >
        Expediter
      </span>

      <div className="flex-1" />

      <div className="flex items-center bg-muted rounded-full p-0.5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => f.key === 'recalled' ? handleRecalledClick() : onFilterChange(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors min-h-[36px] ${
              filter === f.key
                ? 'bg-brand-dark text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -- Main ExpoView -- */

export default function ExpoView() {
  const { expoTickets: rawTickets, sendOutOrder, orders } = useOrderStore();
  const [filter, setFilter] = useState<ExpoFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // ResizeObserver for stagger column count
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(0);
  useEffect(() => {
    const node = boardRef.current;
    if (!node) return;
    const observer = new ResizeObserver(entries => {
      const [entry] = entries;
      if (entry) setBoardWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const staggerColumnCount = useMemo(() => {
    if (boardWidth <= 0) return 3;
    if (boardWidth < 520) return 1;
    if (boardWidth < 760) return 2;
    if (boardWidth < 1160) return 3;
    if (boardWidth < 1480) return 4;
    return 5;
  }, [boardWidth]);

  // Demo tickets - always present alongside real tickets
  const [demoTickets, setDemoTickets] = useState<DemoExpoTicket[]>(() => createDemoTickets());
  const [sentDemoIds, setSentDemoIds] = useState<Set<string>>(new Set());
  const lastSentDemo = useRef<DemoExpoTicket | null>(null);

  // Demo item tap: cycle pending -> firing -> done
  const handleDemoItemTap = useCallback((ticketId: string, itemId: string) => {
    setDemoTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updatedItems = t.items.map(item => {
        if (item.id !== itemId) return item;
        if (item.status === 'pending') return { ...item, status: 'firing' as const, statusLabel: `Since ${timeStr}` };
        if (item.status === 'firing') return { ...item, status: 'done' as const, statusLabel: `Done ${timeStr}` };
        return item;
      });

      // Auto-update station chips based on item statuses
      const updatedStations = t.stations.map(s => {
        // Simple heuristic: if any item is firing, first pending station becomes firing
        // If all items done, all stations done
        return s;
      });

      // Smarter station update: derive from items
      const anyFiring = updatedItems.some(i => i.status === 'firing');
      const allDoneItems = updatedItems.every(i => i.status === 'done');
      const smartStations = t.stations.map((s, idx) => {
        if (allDoneItems) return { ...s, status: 'done' as const };
        if (anyFiring && s.status === 'pending' && idx === t.stations.findIndex(st => st.status === 'pending')) {
          return { ...s, status: 'firing' as const };
        }
        // If item that was firing is now done, check if station should be done
        const firingItems = updatedItems.filter(i => i.status === 'firing');
        const doneItems = updatedItems.filter(i => i.status === 'done');
        if (doneItems.length > 0 && idx < doneItems.length && s.status !== 'done') {
          // Mark stations done proportionally
          if (idx < Math.floor((doneItems.length / updatedItems.length) * t.stations.length)) {
            return { ...s, status: 'done' as const };
          }
        }
        return s;
      });

      return { ...t, items: updatedItems, stations: smartStations };
    }));
  }, []);

  // Demo send out
  const handleDemoSendOut = useCallback((id: string) => {
    const ticket = demoTickets.find(t => t.id === id);
    if (!ticket) return;
    lastSentDemo.current = ticket;
    setSentDemoIds(prev => new Set(prev).add(id));
    toast.success('Demo ticket sent out');
  }, [demoTickets]);

  // Demo recall last
  const handleDemoRecallLast = useCallback(() => {
    if (!lastSentDemo.current) return;
    const ticket = lastSentDemo.current;
    setSentDemoIds(prev => {
      const next = new Set(prev);
      next.delete(ticket.id);
      return next;
    });
    lastSentDemo.current = null;
    toast.success(`Demo ticket #${ticket.orderNumber} recalled`);
  }, []);

  // Live tick every second to drive elapsed timers
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Recompute timerSeconds live from order.timeReceived
  const tickets = useMemo(() => {
    const now = Date.now();
    return rawTickets.map(t => {
      const order = orders.find(o => o.id === t.id);
      if (!order) return t;
      return { ...t, timerSeconds: Math.round((now - order.timeReceived.getTime()) / 1000) };
    });
  }, [rawTickets, orders, tick]);
  const [fulfilledTickets, setFulfilledTickets] = useState<number[]>([]);
  const [holdStations, setHoldStations] = useState<Set<string>>(new Set());

  const handleToggleHold = useCallback((ticketId: string, stationName: string) => {
    const key = `${ticketId}-${stationName}`;
    setHoldStations(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        toast(`Released ${stationName}`);
      } else {
        next.add(key);
        toast(`Holding ${stationName}`);
      }
      return next;
    });
  }, []);

  const handleSendOut = useCallback((id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    setFulfilledTickets(prev => [ticket.orderNumber, ...prev]);
    sendOutOrder(id);
    setHoldStations(prev => {
      const next = new Set(prev);
      for (const key of prev) {
        if (key.startsWith(id + '-')) next.delete(key);
      }
      return next;
    });
    toast.success(`Ticket #${ticket.orderNumber} sent out`);
  }, [tickets, sendOutOrder]);

  const handleRush = useCallback((id: string) => {
    const ticket = [...tickets, ...demoTickets].find(t => t.id === id);
    if (!ticket) return;
    toast(`Rush alert sent for Ticket #${ticket.orderNumber}`);
  }, [tickets, demoTickets]);

  // Combine real + demo tickets
  const visibleDemoTickets = useMemo(() => {
    return demoTickets.filter(t => !sentDemoIds.has(t.id));
  }, [demoTickets, sentDemoIds]);

  const allTickets = useMemo(() => {
    return [...tickets, ...visibleDemoTickets];
  }, [tickets, visibleDemoTickets]);

  const filteredTickets = useMemo(() => {
    if (filter === 'ready') return allTickets.filter(t => allItemsDone(t));
    return allTickets;
  }, [allTickets, filter]);

  const stats = useMemo(() => {
    const open = tickets.length;
    const ready = tickets.filter(t => allItemsDone(t)).length;
    const overtime = tickets.filter(isOvertime).length;
    const avgTime = tickets.length > 0
      ? Math.round(tickets.reduce((sum, t) => sum + t.timerSeconds, 0) / tickets.length)
      : 0;
    return { open, ready, overtime, avgTime };
  }, [tickets]);

  const handleSendOutAny = useCallback((id: string) => {
    if (id.startsWith('demo-')) {
      handleDemoSendOut(id);
    } else {
      handleSendOut(id);
    }
  }, [handleDemoSendOut, handleSendOut]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ExpoTopControls
        filter={filter}
        onFilterChange={setFilter}
        fulfilledTickets={fulfilledTickets}
      />
      <ExpoStationBar />

      <div className="flex-1 overflow-auto p-3">
        {filteredTickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full gap-3">
            <CheckCircle size={48} className="text-success/60" />
            <div className="text-center">
              <p className="text-success/80 text-lg font-bold">Kitchen clear</p>
              <p className="text-success/50 text-sm mt-1">All tickets fulfilled, waiting for new orders</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredTickets.map(ticket => (
                <ExpoTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSendOut={handleSendOutAny}
                  onRush={handleRush}
                  holdStations={holdStations}
                  onToggleHold={handleToggleHold}
                  isDemo={ticket.id.startsWith('demo-')}
                  onDemoItemTap={ticket.id.startsWith('demo-') ? handleDemoItemTap : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ExpoBottomStats
        stats={stats}
        fulfilledTickets={fulfilledTickets}
        onDemoRecallLast={handleDemoRecallLast}
        hasLastSentDemo={!!lastSentDemo.current && sentDemoIds.has(lastSentDemo.current.id)}
      />
    </div>
  );
}

/* -- Expo Bottom Stats -- */

function ExpoBottomStats({
  stats,
  fulfilledTickets,
  onDemoRecallLast,
  hasLastSentDemo,
}: {
  stats: { open: number; ready: number; overtime: number; avgTime: number };
  fulfilledTickets: number[];
  onDemoRecallLast?: () => void;
  hasLastSentDemo?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-surface-card border-t border-border shrink-0">
      <div className="flex items-center gap-4">
        <StatCounter label="Open" value={stats.open} />
        <StatCounter label="Ready" value={stats.ready} colorClass="text-success" />
        <StatCounter label="Overtime" value={stats.overtime} colorClass="text-destructive" />
        <StatCounter label="Avg time" value={formatTimer(stats.avgTime)} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <LegendDot color="bg-success" label="Ready" />
          <LegendDot color="bg-warning" label="In progress" />
          <LegendDot color="bg-destructive" label="Overtime" />
          <LegendDot color="bg-text-muted" label="Pending" />
        </div>
        <button
          onClick={() => {
            if (hasLastSentDemo) {
              onDemoRecallLast?.();
              return;
            }
            if (fulfilledTickets.length === 0) {
              toast('No recently fulfilled tickets.');
            } else {
              toast(`Last fulfilled: #${fulfilledTickets[0]}`);
            }
          }}
          className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-colors min-h-[36px] ${
            hasLastSentDemo
              ? 'border-warning text-warning bg-warning/10 animate-pulse'
              : 'border-border text-text-secondary hover:bg-muted'
          }`}
        >
          Recall last
        </button>
      </div>
    </div>
  );
}

function StatCounter({ label, value, colorClass }: { label: string; value: number | string; colorClass?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${colorClass || 'text-text-primary'}`}>{value}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
      <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />
      {label}
    </span>
  );
}

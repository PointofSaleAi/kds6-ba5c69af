import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, Timer } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS, type OrderTypeColors } from '@/hooks/use-kds-settings';
import { useOrderStore } from '@/hooks/use-order-store';
import {
  kitchenStations,
  type ExpoTicket,
  type ExpoStation,
  type ExpoItemStatus,
} from '@/data/mock-expo-orders';

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

/* -- Station Chips with state-based coloring (Fix 5) -- */

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

        // Fix 5: Color-code by preparation state
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
}

function ExpoTicketCard({ ticket, onSendOut, onRush, holdStations, onToggleHold }: ExpoTicketCardProps) {
  const { tp } = useLanguage();
  const { orderTypeColors } = useKDSSettings();
  const doneCount = ticket.items.filter(i => i.status === 'done').length;
  const totalCount = ticket.items.length;
  const isReady = allItemsDone(ticket);
  const overtime = isOvertime(ticket);
  const headerStyle = ticketHeaderBg(ticket, orderTypeColors);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.35 } }}
      className={`rounded-lg overflow-hidden bg-surface-card shadow-sm border-l-4 ${ticketBorderClass(ticket)} transition-all duration-300`}
    >
      {/* Header - no AutoFireBadge (Fix 2) */}
      <div className={`flex items-center justify-between px-2 py-1.5 ${headerStyle.bg || ''} ${headerStyle.text}`} style={headerStyle.bgColor ? { backgroundColor: headerStyle.bgColor } : undefined}>
        <div className="flex flex-col">
          <span className="text-[14px] font-bold uppercase tracking-wide leading-tight">
            {orderTypeLabel[ticket.orderType]} &middot; {ticket.tableName}
          </span>
          <span className="text-[12px] font-bold opacity-85 leading-tight">
            #{ticket.orderNumber}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold">{formatTimer(ticket.timerSeconds)}</span>
      </div>

      {/* Station chips with state coloring (Fix 5) */}
      <ExpoStationChips ticket={ticket} holdStations={holdStations} onToggleHold={onToggleHold} />

      {/* Item rows with live status (Fix 3) */}
      <div className="px-2 py-1.5 space-y-0.5">
        {ticket.items.map(item => {
          const display = getItemDisplayStatus(item.status);
          const isPrepared = item.status === 'done';

          return (
            <div
              key={item.id}
              className={`flex items-start justify-between py-0.5 ${isPrepared ? 'border-l-[3px] border-l-success pl-1.5 -ml-2' : ''}`}
            >
              <div className="flex-1 min-w-0 flex items-center flex-wrap gap-1.5">
                <span className={`text-[13px] ${isPrepared ? 'font-bold text-text-primary' : 'font-medium text-text-primary'}`}>
                  {item.quantity}&times; {tp(item.name)}
                </span>
                <span className={`inline-flex items-center px-1.5 py-px rounded-full text-[10px] font-bold ${display.bg} ${display.text}`}>
                  {display.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with Rush + Send Out (Fix 4) */}
      <div className="p-1.5 border-t border-border">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[11px] font-bold text-text-muted">{doneCount} of {totalCount} done</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onRush?.(ticket.id)}
            className="px-3 py-2.5 border border-destructive text-destructive text-[12px] font-bold uppercase rounded hover:bg-destructive/10 transition-colors min-h-[44px]"
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
    // Clear holds for this ticket
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
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    toast(`Rush alert sent for Ticket #${ticket.orderNumber}`);
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (filter === 'ready') return tickets.filter(t => allItemsDone(t));
    return tickets;
  }, [tickets, filter]);

  const stats = useMemo(() => {
    const open = tickets.length;
    const ready = tickets.filter(t => allItemsDone(t)).length;
    const overtime = tickets.filter(isOvertime).length;
    const avgTime = tickets.length > 0
      ? Math.round(tickets.reduce((sum, t) => sum + t.timerSeconds, 0) / tickets.length)
      : 0;
    return { open, ready, overtime, avgTime };
  }, [tickets]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ExpoTopControls filter={filter} onFilterChange={setFilter} fulfilledTickets={fulfilledTickets} />
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
                  onSendOut={handleSendOut}
                  onRush={handleRush}
                  holdStations={holdStations}
                  onToggleHold={handleToggleHold}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ExpoBottomStats stats={stats} fulfilledTickets={fulfilledTickets} />
    </div>
  );
}

/* -- Expo Bottom Stats -- */

function ExpoBottomStats({
  stats,
  fulfilledTickets,
}: {
  stats: { open: number; ready: number; overtime: number; avgTime: number };
  fulfilledTickets: number[];
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
            if (fulfilledTickets.length === 0) {
              toast('No recently fulfilled tickets.');
            } else {
              toast(`Last fulfilled: #${fulfilledTickets[0]}`);
            }
          }}
          className="px-3 py-1.5 rounded-lg border border-border text-[11px] font-bold text-text-secondary hover:bg-muted transition-colors min-h-[36px]"
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

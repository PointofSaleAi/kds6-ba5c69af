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

function allDone(t: ExpoTicket, holds?: Set<string>) {
  return t.stations.every(s => s.status === 'done' || holds?.has(`${t.id}-${s.name}`));
}
function isOvertime(t: ExpoTicket) {
  return t.timerSeconds >= 900;
}
function isWarning(t: ExpoTicket) {
  return t.timerSeconds >= 600 && t.timerSeconds < 900;
}

function ticketBorderClass(t: ExpoTicket): string {
  if (t.stations.every(s => s.status === 'done')) return 'border-l-success';
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

const stationChipStyles: Record<string, { bg: string; text: string }> = {
  done: { bg: 'bg-success/15', text: 'text-success' },
  firing: { bg: 'bg-warning/15', text: 'text-warning' },
  pending: { bg: 'bg-muted', text: 'text-text-muted' },
  holding: { bg: 'bg-warning/30', text: 'text-warning' },
};

/* -- Item status badge styles -- */
function getItemStatusBadge(status: ExpoItemStatus, statusLabel?: string): { label: string; bg: string; text: string } | null {
  if (status === 'done') return null; // strikethrough, no badge
  if (statusLabel === 'Overdue') return { label: 'Overdue', bg: 'bg-destructive', text: 'text-white' };
  if (status === 'firing' && statusLabel) return { label: statusLabel, bg: 'bg-warning/20', text: 'text-warning' };
  if (status === 'pending' && statusLabel && !statusLabel.startsWith('Auto-fire')) {
    return { label: statusLabel, bg: 'bg-muted', text: 'text-text-muted' };
  }
  if (status === 'pending') return { label: 'Pending', bg: 'bg-muted', text: 'text-text-muted' };
  return null;
}

/* -- Auto-fire countdown badge -- */
function AutoFireBadge({ ticket }: { ticket: ExpoTicket }) {
  const [remaining, setRemaining] = useState(ticket.autoFireSeconds ?? 0);
  const startRef = useRef(Date.now());
  const initialRef = useRef(ticket.autoFireSeconds ?? 0);

  useEffect(() => {
    startRef.current = Date.now();
    initialRef.current = ticket.autoFireSeconds ?? 0;
    setRemaining(ticket.autoFireSeconds ?? 0);
  }, [ticket.autoFireSeconds]);

  useEffect(() => {
    if (ticket.autoFireSeconds == null) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      setRemaining(Math.max(0, initialRef.current - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [ticket.autoFireSeconds]);

  if (ticket.autoFireSeconds == null) return null;

  const isFiring = remaining <= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        isFiring
          ? 'bg-success text-white'
          : 'bg-warning text-white'
      }`}
    >
      <Timer size={10} />
      {isFiring ? 'Firing...' : `Auto-fire ${formatTimer(remaining)}`}
    </span>
  );
}

/* -- ExpoStationChips with Hold/Release -- */

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
        const chipStatus = isHolding ? 'holding' : s.status;
        const style = stationChipStyles[chipStatus];
        const showHoldToggle = !overtime && (s.status === 'done' || isHolding);

        return (
          <span
            key={s.name}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} ${s.status === 'pending' && !isHolding ? 'border border-border' : ''} ${showHoldToggle ? 'cursor-pointer' : ''}`}
            onClick={showHoldToggle ? () => onToggleHold(ticket.id, s.name) : undefined}
          >
            {s.name}
            {isHolding && ' Holding'}
            {!isHolding && s.status === 'done' && ' \u2713'}
            {s.status === 'firing' && ' ...'}
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
  const doneCount = ticket.stations.filter(s => s.status === 'done' || holdStations.has(`${ticket.id}-${s.name}`)).length;
  const totalCount = ticket.stations.length;
  const isDone = allDone(ticket, holdStations);
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
      {/* Header */}
      <div className={`flex items-center justify-between px-2 py-1.5 ${headerStyle.bg || ''} ${headerStyle.text}`} style={headerStyle.bgColor ? { backgroundColor: headerStyle.bgColor } : undefined}>
        <div className="flex flex-col">
          <span className="text-[14px] font-bold uppercase tracking-wide leading-tight">
            {orderTypeLabel[ticket.orderType]} &middot; {ticket.tableName}
          </span>
          <span className="text-[12px] opacity-70 leading-tight">
            #{ticket.orderNumber}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <AutoFireBadge ticket={ticket} />
          <span className="text-[11px] font-mono font-bold">{formatTimer(ticket.timerSeconds)}</span>
        </div>
      </div>

      {/* Station chips with hold/release */}
      <ExpoStationChips ticket={ticket} holdStations={holdStations} onToggleHold={onToggleHold} />

      {/* Item rows with status badges */}
      <div className="px-2 py-1.5 space-y-0.5">
        {ticket.items.map(item => {
          const badge = getItemStatusBadge(item.status, item.statusLabel);
          return (
            <div key={item.id} className="flex items-start justify-between py-0.5">
              <div className="flex-1 min-w-0 flex items-center flex-wrap gap-1.5">
                <span className={`text-[13px] font-medium ${item.status === 'done' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                  {item.quantity}&times; {tp(item.name)}
                </span>
                {badge && (
                  <span className={`inline-flex items-center px-1.5 py-px rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-1.5 border-t border-border flex gap-1.5">
        {isDone ? (
          <button
            onClick={() => onSendOut(ticket.id)}
            className="flex-1 py-2.5 bg-success text-primary-foreground text-[13px] font-bold uppercase rounded flex items-center justify-center gap-2 hover:opacity-90 transition-colors min-h-[44px]"
          >
            Send out
          </button>
        ) : overtime ? (
          <>
            <span className="flex-1 flex items-center justify-center text-[12px] font-bold text-destructive">
              {doneCount} of {totalCount} done
            </span>
            <button
              onClick={() => onRush?.(ticket.id)}
              className="px-4 py-2.5 bg-destructive/10 border border-destructive text-destructive text-[12px] font-bold uppercase rounded hover:bg-destructive/20 transition-colors min-h-[44px]"
            >
              Rush
            </button>
          </>
        ) : (
          <span className="flex-1 flex items-center justify-center text-[12px] font-bold text-text-muted min-h-[44px]">
            {doneCount} of {totalCount} done
          </span>
        )}
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
  const { expoTickets: tickets, sendOutOrder } = useOrderStore();
  const [filter, setFilter] = useState<ExpoFilter>('all');
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
    if (filter === 'ready') return tickets.filter(t => allDone(t, holdStations));
    return tickets;
  }, [tickets, filter, holdStations]);

  const stats = useMemo(() => {
    const open = tickets.length;
    const ready = tickets.filter(t => allDone(t, holdStations)).length;
    const overtime = tickets.filter(isOvertime).length;
    const avgTime = tickets.length > 0
      ? Math.round(tickets.reduce((sum, t) => sum + t.timerSeconds, 0) / tickets.length)
      : 0;
    return { open, ready, overtime, avgTime };
  }, [tickets, holdStations]);

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
          <LegendDot color="bg-warning" label="Firing" />
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

import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import {
  mockExpoTickets,
  kitchenStations,
  type ExpoTicket,
  type ExpoStation,
  type ExpoItemStatus,
} from '@/data/mock-expo-orders';

/* ── helpers ── */

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function allDone(t: ExpoTicket) {
  return t.stations.every(s => s.status === 'done');
}
function isOvertime(t: ExpoTicket) {
  return t.timerSeconds >= 900; // 15 min
}
function isWarning(t: ExpoTicket) {
  return t.timerSeconds >= 600 && t.timerSeconds < 900; // 10-15 min
}

function ticketBorderClass(t: ExpoTicket): string {
  if (allDone(t)) return 'border-l-success';
  if (isOvertime(t)) return 'border-l-destructive';
  if (isWarning(t)) return 'border-l-warning';
  return 'border-l-border';
}

const orderTypeLabel: Record<string, string> = {
  'dine-in': 'DINE IN',
  'take-out': 'TAKE OUT',
  banquet: 'BANQUET',
};

const orderTypeHeaderBg: Record<string, string> = {
  'dine-in': 'bg-order-dine-in',
  'take-out': 'bg-order-take-out',
  banquet: 'bg-order-banquet',
};

const stationChipStyles: Record<string, { bg: string; text: string }> = {
  done: { bg: 'bg-success/15', text: 'text-success' },
  firing: { bg: 'bg-warning/15', text: 'text-warning' },
  pending: { bg: 'bg-muted', text: 'text-text-muted' },
};

const itemStatusStyles: Record<ExpoItemStatus, string> = {
  done: 'line-through text-text-muted',
  firing: 'text-warning',
  pending: 'text-text-primary',
};

/* ── ExpoTicketCard ── */

function ExpoStationChips({ stations }: { stations: ExpoStation[] }) {
  return (
    <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-border">
      {stations.map(s => {
        const style = stationChipStyles[s.status];
        return (
          <span
            key={s.name}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} ${s.status === 'pending' ? 'border border-border' : ''}`}
          >
            {s.name}
            {s.status === 'done' && ' \u2713'}
            {s.status === 'firing' && ' ...'}
          </span>
        );
      })}
    </div>
  );
}

interface ExpoTicketCardProps {
  ticket: ExpoTicket;
  onSendOut: (id: string) => void;
  onRush?: (id: string) => void;
}

function ExpoTicketCard({ ticket, onSendOut, onRush }: ExpoTicketCardProps) {
  const { tp, timeFormat } = useLanguage();
  const doneCount = ticket.stations.filter(s => s.status === 'done').length;
  const totalCount = ticket.stations.length;
  const isDone = allDone(ticket);
  const overtime = isOvertime(ticket);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.35 } }}
      className={`rounded-lg overflow-hidden bg-surface-card shadow-sm border-l-4 ${ticketBorderClass(ticket)} transition-all duration-300`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-2 py-1.5 ${orderTypeHeaderBg[ticket.orderType]} text-primary-foreground`}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {orderTypeLabel[ticket.orderType]}
          </span>
          <span className="text-[10px] opacity-80">{ticket.tableName}</span>
        </div>
        <span className="text-[11px] font-mono font-bold">{formatTimer(ticket.timerSeconds)}</span>
      </div>

      {/* Station chips */}
      <ExpoStationChips stations={ticket.stations} />

      {/* Order number + items */}
      <div className="px-2 pt-1.5 pb-1">
        <div className="text-[28px] font-black text-text-primary leading-none">
          #{ticket.orderNumber}
        </div>
      </div>

      {/* Item rows */}
      <div className="px-2 pb-1.5 space-y-0.5">
        {ticket.items.map(item => (
          <div key={item.id} className="flex items-start justify-between py-0.5">
            <div className="flex-1 min-w-0">
              <span className={`text-[13px] font-medium uppercase ${itemStatusStyles[item.status]}`}>
                {item.quantity}x {tp(item.name)}
              </span>
              {item.statusLabel && (
                <span className={`ml-2 text-[11px] italic ${item.status === 'firing' ? 'text-warning' : item.status === 'pending' ? 'text-text-muted' : 'text-text-muted'}`}>
                  {item.statusLabel}
                </span>
              )}
            </div>
          </div>
        ))}
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

/* ── Station Status Bar ── */

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

/* ── Top Bar Filter Buttons ── */

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
      {/* Expo badge */}
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-500 text-[11px] font-bold uppercase tracking-wider">
        Expediter
      </span>

      <div className="flex-1" />

      {/* Filter buttons */}
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

/* ── Main ExpoView ── */

export default function ExpoView() {
  const [tickets, setTickets] = useState<ExpoTicket[]>(mockExpoTickets);
  const [filter, setFilter] = useState<ExpoFilter>('all');
  const [fulfilledTickets, setFulfilledTickets] = useState<number[]>([]);

  const handleSendOut = useCallback((id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    setFulfilledTickets(prev => [ticket.orderNumber, ...prev]);
    setTickets(prev => prev.filter(t => t.id !== id));
    toast.success(`Ticket #${ticket.orderNumber} sent out`);
  }, [tickets]);

  const handleRush = useCallback((id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    toast(`Rush alert sent for Ticket #${ticket.orderNumber}`);
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (filter === 'ready') return tickets.filter(allDone);
    return tickets;
  }, [tickets, filter]);

  // Stats for bottom bar
  const stats = useMemo(() => {
    const open = tickets.length;
    const ready = tickets.filter(allDone).length;
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

      {/* Ticket grid */}
      <div className="flex-1 overflow-auto p-3">
        {filteredTickets.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <p className="text-text-muted text-sm">
              {filter === 'ready' ? 'No tickets are fully ready yet' : 'All tickets have been sent out. Great work!'}
            </p>
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
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Expose stats for bottom bar via data attributes */}
      <ExpoBottomStats stats={stats} fulfilledTickets={fulfilledTickets} />
    </div>
  );
}

/* ── Expo Bottom Stats (injected into bottom area, above main BottomStatusBar) ── */

function ExpoBottomStats({
  stats,
  fulfilledTickets,
}: {
  stats: { open: number; ready: number; overtime: number; avgTime: number };
  fulfilledTickets: number[];
}) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-surface-card border-t border-border shrink-0">
      {/* Left: stat counters */}
      <div className="flex items-center gap-4">
        <StatCounter label="Open" value={stats.open} />
        <StatCounter label="Ready" value={stats.ready} colorClass="text-success" />
        <StatCounter label="Overtime" value={stats.overtime} colorClass="text-destructive" />
        <StatCounter label="Avg time" value={formatTimer(stats.avgTime)} />
      </div>

      {/* Right: legend + recall */}
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

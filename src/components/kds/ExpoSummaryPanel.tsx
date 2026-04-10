import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import cookingSummaryIcon from '@/assets/cooking-summary-icon.svg';
import type { ExpoTicket } from '@/data/mock-expo-orders';

type TicketReadiness = 'ready' | 'in-progress' | 'pending';

function getTicketReadiness(ticket: ExpoTicket): TicketReadiness {
  const activeItems = ticket.items.filter(i => i.status !== 'done' || i.status === 'done');
  const allDone = ticket.items.every(i => i.status === 'done');
  const anyFiring = ticket.items.some(i => i.status === 'firing');
  if (allDone) return 'ready';
  if (anyFiring) return 'in-progress';
  return 'pending';
}

const orderTypeLabel: Record<string, string> = {
  'dine-in': 'Dine In',
  'take-out': 'Take Out',
  banquet: 'Banquet',
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface ExpoSummaryPanelProps {
  tickets: ExpoTicket[];
  onScrollToTicket?: (ticketId: string) => void;
}

export function ExpoSummaryPanel({ tickets, onScrollToTicket }: ExpoSummaryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const { ready, inProgress, pending, ticketList } = useMemo(() => {
    let ready = 0, inProgress = 0, pending = 0;
    const ticketList = tickets.map(t => {
      const readiness = getTicketReadiness(t);
      if (readiness === 'ready') ready++;
      else if (readiness === 'in-progress') inProgress++;
      else pending++;
      return { ...t, readiness };
    });
    return { ready, inProgress, pending, ticketList };
  }, [tickets]);

  if (collapsed) {
    return (
      <div className="w-10 bg-sidebar border-l border-sidebar-border flex flex-col items-center py-3 shrink-0">
        <button onClick={() => setCollapsed(false)} className="p-1 hover:bg-sidebar-accent rounded min-w-[44px] min-h-[44px] flex items-center justify-center text-sidebar-foreground" aria-label="Expand panel">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[10px] font-bold text-sidebar-foreground/70 mt-2 [writing-mode:vertical-lr]">{tickets.length} tickets</span>
      </div>
    );
  }

  return (
    <div className="w-[220px] flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 bg-sidebar border-l border-sidebar-border">
        <div className="flex items-center gap-2 min-w-0">
          <img src={cookingSummaryIcon} alt="" className="w-5 h-5 opacity-70 shrink-0" />
          <span className="text-[15px] font-semibold text-sidebar-foreground uppercase tracking-wide shrink-0">Summary</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-sidebar-accent rounded min-w-[44px] min-h-[44px] flex items-center justify-center text-sidebar-foreground shrink-0" aria-label="Collapse panel">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-surface-card border-l border-border overflow-hidden">
        {/* Section 1: Status counters */}
        <div className="px-3 py-3 border-b border-border space-y-2">
          <CounterRow label="Ready to send" count={ready} colorClass="text-success" />
          <CounterRow label="In progress" count={inProgress} colorClass="text-warning" />
          <CounterRow label="Pending" count={pending} colorClass="text-text-muted" />
        </div>

        {/* Section 2: Ticket list */}
        <div className="flex-1 overflow-y-auto">
          {ticketList.map(t => {
            const dotColor = t.readiness === 'ready'
              ? 'bg-success'
              : t.readiness === 'in-progress'
                ? 'bg-warning'
                : 'bg-text-muted';

            return (
              <button
                key={t.id}
                onClick={() => onScrollToTicket?.(t.id)}
                className="w-full flex items-center gap-2 px-3 py-2 border-b border-border/30 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] font-bold text-text-primary">
                    #{t.orderNumber}
                  </span>
                  <span className="text-[11px] text-text-muted ml-1">
                    {orderTypeLabel[t.orderType] || t.orderType}
                  </span>
                  <div className="text-[10px] text-text-muted truncate">{t.tableName}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-text-muted">{formatElapsed(t.timerSeconds)}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CounterRow({ label, count, colorClass }: { label: string; count: number; colorClass: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] font-medium text-text-secondary">{label}</span>
      <span className={`text-[18px] font-bold tabular-nums ${colorClass}`}>{count}</span>
    </div>
  );
}

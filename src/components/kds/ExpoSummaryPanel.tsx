import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import cookingSummaryIcon from '@/assets/cooking-summary-icon.svg';
import type { ExpoTicket } from '@/data/mock-expo-orders';

type TicketReadiness = 'ready' | 'in-progress' | 'pending';

function getTicketReadiness(ticket: ExpoTicket): TicketReadiness {
  const allDone = ticket.items.every(i => i.status === 'done');
  const anyFiring = ticket.items.some(i => i.status === 'firing');
  if (allDone) return 'ready';
  if (anyFiring) return 'in-progress';
  return 'pending';
}

interface ExpoSummaryPanelProps {
  tickets: ExpoTicket[];
  onScrollToTicket?: (ticketId: string) => void;
  pinnedTicketIds?: string[];
  onTogglePin?: (ticketId: string) => void;
  onClearAllPins?: () => void;
  selectedProducts?: string[];
  onProductToggle?: (productName: string) => void;
  onSendAllProduct?: (productName: string) => void;
}

export function ExpoSummaryPanel({
  tickets,
  onScrollToTicket,
  pinnedTicketIds = [],
  onTogglePin,
  onClearAllPins,
  selectedProducts = [],
  onProductToggle,
  onSendAllProduct,
}: ExpoSummaryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [readySectionCollapsed, setReadySectionCollapsed] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedProducts), [selectedProducts]);

  const { ready, inProgress, pending } = useMemo(() => {
    let ready = 0, inProgress = 0, pending = 0;
    for (const t of tickets) {
      const r = getTicketReadiness(t);
      if (r === 'ready') ready++;
      else if (r === 'in-progress') inProgress++;
      else pending++;
    }
    return { ready, inProgress, pending };
  }, [tickets]);

  // Build ready products: products where ALL instances across all tickets are done
  const readyProducts = useMemo(() => {
    const totals = new Map<string, { total: number; done: number }>();
    for (const t of tickets) {
      for (const item of t.items) {
        const existing = totals.get(item.name) || { total: 0, done: 0 };
        existing.total += item.quantity;
        if (item.status === 'done') existing.done += item.quantity;
        totals.set(item.name, existing);
      }
    }
    return Array.from(totals.entries())
      .filter(([, data]) => data.total > 0 && data.done === data.total)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([name, data]) => ({ name, count: data.total }));
  }, [tickets]);

  // Aggregate products across all tickets with pending (not-done) counts + dominant status
  const productList = useMemo(() => {
    const map = new Map<string, { count: number; hasNew: boolean; hasFiring: boolean }>();
    for (const t of tickets) {
      for (const item of t.items) {
        if (item.status !== 'done') {
          const existing = map.get(item.name) || { count: 0, hasNew: false, hasFiring: false };
          existing.count += item.quantity;
          if (item.isNew) existing.hasNew = true;
          if (item.status === 'firing') existing.hasFiring = true;
          map.set(item.name, existing);
        }
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({ name, count: data.count, hasNew: data.hasNew, hasFiring: data.hasFiring }));
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
        {/* Status counters */}
        <div className="px-3 py-3 border-b border-border space-y-2">
          <CounterRow label="Ready to send" count={ready} colorClass="text-success" />
          <CounterRow label="In progress" count={inProgress} colorClass="text-warning" />
          <CounterRow label="Pending" count={pending} colorClass="text-text-muted" />
        </div>

        {/* Clear selection bar */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
            <span className="text-[11px] font-medium text-text-muted">{selectedProducts.length} selected</span>
            <button
              onClick={() => selectedProducts.forEach(p => onProductToggle?.(p))}
              className="text-[11px] font-medium text-text-muted hover:text-text-secondary transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Ready to send products section */}
          <div>
            <button
              onClick={() => setReadySectionCollapsed(!readySectionCollapsed)}
              className="w-full flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-success">Ready to send</span>
              <span className="text-[10px] text-text-muted">{readySectionCollapsed ? '+' : '-'}</span>
            </button>
            {!readySectionCollapsed && (
              <>
                {readyProducts.length === 0 ? (
                  <div className="px-3 py-3 text-[11px] text-text-muted text-center">No items ready yet</div>
                ) : (
                  readyProducts.map(p => (
                    <div
                      key={p.name}
                      className="w-full flex items-center justify-between px-3 py-2 border-b border-border/30"
                    >
                      <span className="text-[12px] font-medium text-text-primary truncate mr-1">{p.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[13px] font-bold tabular-nums text-success">{p.count}</span>
                        <button
                          onClick={() => onSendAllProduct?.(p.name)}
                          className="text-[11px] font-medium text-success hover:text-success/80 transition-colors whitespace-nowrap"
                        >
                          Send all
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-b border-border" style={{ borderBottomWidth: '0.5px' }} />

          {/* Products pending */}
          <div className="px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Products pending</span>
          </div>
          {productList.length === 0 ? (
            <div className="px-3 py-4 text-[12px] text-text-muted text-center">All items prepared</div>
          ) : (
            productList.map(p => {
              const isSelected = selectedSet.has(p.name);
              return (
                <button
                  key={p.name}
                  onClick={() => onProductToggle?.(p.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 border-b border-border/30 transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-warning/10 border-l-[3px] border-l-warning'
                      : 'hover:bg-muted/50'
                  } ${p.hasNew ? 'animate-new-item-warning' : ''}`}
                >
                  <span className={`text-[12px] font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {p.name}
                  </span>
                  <span className={`text-[13px] font-bold tabular-nums ${isSelected ? 'text-warning' : 'text-text-muted'}`}>
                    {p.count}
                  </span>
                </button>
              );
            })
          )}
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

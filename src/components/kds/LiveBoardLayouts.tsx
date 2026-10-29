import { useEffect, useState, type ReactNode } from 'react';
import { TIMELINE_LANES, type TimelineLaneKey } from '@/lib/ticket-board';

/** Focus Lane: most urgent ticket large in the center, others around/below. */
export function LiveFocusLane<T extends { id: string }>({
  tickets, renderTicket, gap = 10,
}: { tickets: T[]; renderTicket: (t: T) => ReactNode; gap?: number }) {
  const [focusId, setFocusId] = useState<string | null>(null);
  useEffect(() => {
    if (focusId && !tickets.some((t) => t.id === focusId)) setFocusId(null);
  }, [tickets, focusId]);
  if (tickets.length === 0) return null;
  const focus = tickets.find((t) => t.id === focusId) ?? tickets[0];
  const others = tickets.filter((t) => t.id !== focus.id);
  const left = others.filter((_, i) => i % 2 === 0).slice(0, 2);
  const right = others.filter((_, i) => i % 2 === 1).slice(0, 2);
  const rest = others.slice(4);

  const side = (list: T[]) => (
    <div className="hidden md:flex flex-col min-w-0" style={{ gap }}>
      {list.map((t) => (
        <div key={t.id} className="min-w-0">
          <button
            type="button"
            onClick={() => setFocusId(t.id)}
            className="w-full min-h-[44px] mb-1 rounded-md bg-muted text-text-primary border border-border text-[13px] font-bold uppercase hover:bg-muted/70"
          >
            Move to focus
          </button>
          {renderTicket(t)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full overflow-auto" style={{ padding: gap }}>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-start" style={{ gap }}>
        {side(left)}
        <div className="min-w-0 rounded-xl ring-2 ring-primary/70 shadow-lg" aria-label="Focused ticket">
          {renderTicket(focus)}
        </div>
        {side(right)}
      </div>
      {(rest.length > 0 || others.length > 0) && (
        <div className={`flex overflow-x-auto items-start mt-3 ${rest.length ? '' : 'md:hidden'}`} style={{ gap }}>
          {(rest.length ? rest : others).map((t) => (
            <div key={t.id} className={`relative shrink-0 w-[280px] ${rest.includes(t) ? '' : 'md:hidden'}`}>
              <button
                type="button"
                onClick={() => setFocusId(t.id)}
                className="w-full min-h-[44px] mb-1 rounded-md bg-muted text-text-primary border border-border text-[13px] font-bold uppercase hover:bg-muted/70"
              >
                Move to focus
              </button>
              {renderTicket(t)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Timeline Flow: New → Cooking → Plating → Ready lanes from real ticket state. */
export function LiveTimelineLanes<T extends { id: string }>({
  tickets, laneOf, renderTicket, gap = 10,
}: { tickets: T[]; laneOf: (t: T) => TimelineLaneKey; renderTicket: (t: T) => ReactNode; gap?: number }) {
  return (
    <div className="h-full overflow-x-auto" style={{ padding: gap }}>
      <div className="flex h-full min-w-[960px]" style={{ gap }}>
        {TIMELINE_LANES.map((lane, li) => {
          const list = tickets.filter((t) => laneOf(t) === lane.key);
          return (
            <section key={lane.key} className="flex-1 min-w-[240px] flex flex-col min-h-0 rounded-lg bg-muted/40 border border-border overflow-hidden">
              <header className="flex items-center gap-2 px-3 py-2 border-b border-border" style={{ borderTop: `3px solid ${lane.tone}` }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: lane.tone }} />
                <span className="text-[14px] font-bold uppercase tracking-wide text-text-primary">{lane.label}</span>
                <span className="ml-auto text-[13px] font-bold text-text-secondary tabular-nums">{list.length}</span>
                {li < TIMELINE_LANES.length - 1 && <span className="text-[14px] font-bold text-text-secondary" aria-hidden>→</span>}
              </header>
              <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col" style={{ gap }}>
                {list.map((t) => <div key={t.id}>{renderTicket(t)}</div>)}
                {list.length === 0 && <p className="text-[13px] text-text-secondary text-center py-4">No tickets</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

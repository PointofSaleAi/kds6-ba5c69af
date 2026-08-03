import { useEffect, useMemo, useRef, useState } from 'react';
import { TicketCard } from './TicketCard';
import { useGlassBoard } from './glass-board-context';
import { CARD_W, activeCourse, type GlassStage, type GlassTicket } from './glass-tickets-data';

/** Height estimate drives the stagger packing (verbatim from the reference). */
function estHeight(t: GlassTicket, items: Record<string, GlassStage>, open: Record<string, boolean>) {
  let h = 230 + (t.posMessage ? 200 : 0) + Math.ceil(t.allergies.length / 2) * 22;
  const aIdx = activeCourse(t, items);
  t.courses.forEach((c, ci) => {
    if (c.showHeader !== false) h += 48;
    const ck = `${t.id}:${c.id}`;
    const isOpen = ck in open ? open[ck] : ci === aIdx;
    if (isOpen) c.items.forEach((it) => { h += 88 + (it.note ? 24 : 0) + (it.tags && it.tags.length ? 32 : 0); });
  });
  return h;
}

/** Scale factor bringing the glass design in line with standard ticket sizing. */
const GLASS_SCALE = 0.6;
const GAP = 16;

export function TicketBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const {
    tickets, viewMode, itemStages, openCourses, toggleCourse,
    tapItem, stepTicket, prepLabelFor, elapsedFor, now,
  } = useGlassBoard();

  useEffect(() => {
    const measure = () => setWidth(boardRef.current?.clientWidth || 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /** Column count computed from container width at the card width. */
  const colCount = useMemo(() => {
    const avail = (width || (CARD_W + GAP) * 3) / GLASS_SCALE;
    return Math.max(1, Math.min(Math.max(tickets.length, 1), Math.floor((avail + GAP) / (CARD_W + GAP))));
  }, [width, tickets.length]);

  /** Stagger packing: each ticket drops into the shortest column. */
  const staggerColumns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => ({ items: [] as GlassTicket[], h: 0 }));
    tickets.forEach((t) => {
      let best = cols[0];
      cols.forEach((c) => { if (c.h < best.h) best = c; });
      best.items.push(t);
      best.h += estHeight(t, itemStages, openCourses) + GAP;
    });
    return cols.filter((c) => c.items.length);
  }, [tickets, itemStages, openCourses, colCount]);

  const cardFor = (t: GlassTicket, fillHeight = false) => (
    <TicketCard
      key={t.id}
      ticket={t}
      items={itemStages}
      open={openCourses}
      now={now}
      elapsedSeconds={elapsedFor(t)}
      prepLabelFor={prepLabelFor}
      onTapItem={tapItem}
      onToggleCourse={toggleCourse}
      onStepTicket={stepTicket}
      fillHeight={fillHeight}
    />
  );

  if (tickets.length === 0) {
    return (
      <div ref={boardRef} className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-[15px] font-bold text-text-primary">No tickets match the current filters</p>
        <p className="text-[13px] text-text-muted">Clear a filter in the footer or summary panel to see tickets again.</p>
      </div>
    );
  }

  // `zoom` scales the verbatim glass design down to the same physical card
  // width (~300px) and font sizes as the standard ticket layouts.
  const base: React.CSSProperties = { zoom: GLASS_SCALE, padding: GAP };

  if (viewMode === 'horizontal') {
    return (
      <div ref={boardRef} className="h-full overflow-x-auto">
        <div style={{ ...base, display: 'flex', alignItems: 'flex-start', gap: GAP }}>
          {tickets.map((t) => (
            <div key={t.id} style={{ flex: '0 0 auto', width: CARD_W, display: 'flex' }}>
              {cardFor(t)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div ref={boardRef}>
        <div
          style={{
            ...base,
            display: 'grid',
            gridTemplateColumns: `repeat(${colCount}, ${CARD_W}px)`,
            alignItems: 'start',
            gap: GAP,
          }}
        >
          {tickets.map((t) => cardFor(t))}
        </div>
      </div>
    );
  }

  return (
    <div ref={boardRef}>
      <div style={{ ...base, display: 'flex', alignItems: 'flex-start', gap: GAP }}>
        {staggerColumns.map((col, ci) => (
          <div key={ci} style={{ flex: '0 0 auto', width: CARD_W, display: 'flex', flexDirection: 'column', gap: GAP }}>
            {col.items.map((t) => cardFor(t))}
          </div>
        ))}
      </div>
    </div>
  );
}

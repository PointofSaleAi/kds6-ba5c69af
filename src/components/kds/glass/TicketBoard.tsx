import { useEffect, useMemo, useRef, useState } from 'react';
import { TicketCard } from './TicketCard';
import { useGlassBoard } from './glass-board-context';
import { CARD_W, activeCourse, type GlassStage, type GlassTicket } from './glass-tickets-data';
import { DARK_SKIN, GlassStyleProvider, LIGHT_SKIN, type GlassSafety } from './glass-theme';
import { useTheme } from '@/hooks/use-theme';
import type { ViewMode } from '@/types/kds';

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
/** Keep tickets readable while allowing four columns on landscape kitchen displays. */
const MIN_RENDERED_CARD_W = 250;
const MAX_BOARD_COLUMNS = 4;

interface TicketBoardProps {
  /** Personalize override: hero shows the order number or the guest name. */
  identifier?: 'order' | 'guest';
  /** Extra multiplier applied on top of the base glass scale (text size). */
  scaleFactor?: number;
  /** Spacing / Layout control: card padding scale. */
  spacing?: 'Compact' | 'Standard' | 'Spacious';
  /** Density control: item row padding scale. */
  density?: 'low' | 'medium' | 'high';
  /** Appearance control. */
  appearance?: 'compact' | 'standard' | 'header';
  /** Safety emphasis applied to allergen chips. */
  safety?: GlassSafety;
  /** Force a theme (Ticket Studio preview); defaults to the app theme. */
  themeOverride?: 'light' | 'dark';
  /** Limit the number of rendered tickets (settings previews). */
  maxTickets?: number;
  /** Force a specific ticket first (settings previews show a Dine In ticket). */
  pinnedTicketId?: string;
  /** Force a view mode, ignoring the board's own selection. */
  viewModeOverride?: ViewMode;
  /** Force the pinned ticket's wait time (aging-rule previews). */
  elapsedSecondsOverride?: number;
}

const PAD_SCALE = { Compact: 0.7, Standard: 1, Spacious: 1.35 } as const;
const ROW_SCALE = { high: 0.6, medium: 1, low: 1.35 } as const;

export function TicketBoard({
  identifier = 'order',
  scaleFactor = 1,
  spacing = 'Standard',
  density = 'medium',
  appearance = 'standard',
  safety = 'bright',
  themeOverride,
  maxTickets,
  pinnedTicketId,
  viewModeOverride,
  elapsedSecondsOverride,
}: TicketBoardProps = {}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const { theme } = useTheme();
  const {
    tickets: allTickets, viewMode: boardViewMode, view, itemStages, openCourses, toggleCourse,
    tapItem, stepTicket, prepLabelFor, elapsedFor, now,
  } = useGlassBoard();
  const viewMode = viewModeOverride ?? boardViewMode;
  const tickets = useMemo(() => {
    let list = allTickets;
    if (pinnedTicketId) {
      const pinned = list.find((t) => t.id === pinnedTicketId);
      if (pinned) list = [pinned, ...list.filter((t) => t.id !== pinnedTicketId)];
    }
    return maxTickets ? list.slice(0, maxTickets) : list;
  }, [allTickets, maxTickets, pinnedTicketId]);
  const zoom = GLASS_SCALE * scaleFactor;
  const dark = (themeOverride ?? theme) === 'dark';
  const styleValue = useMemo(
    () => ({
      skin: dark ? DARK_SKIN : LIGHT_SKIN,
      padScale: PAD_SCALE[spacing] ?? 1,
      rowScale: ROW_SCALE[density] ?? 1,
      safety,
      appearance,
    }),
    [dark, spacing, density, safety, appearance],
  );


  useEffect(() => {
    const measure = () => setWidth(boardRef.current?.clientWidth || 0);
    measure();
    const observer = new ResizeObserver(measure);
    if (boardRef.current) observer.observe(boardRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /**
   * Grid and Stagger share a responsive, four-column maximum. The minimum is
   * expressed in rendered pixels so text and controls retain the Glass scale.
   */
  const colCount = useMemo(() => {
    const renderedGap = GAP * zoom;
    const renderedPadding = GAP * zoom * 2;
    const available = Math.max(0, width - renderedPadding);
    const fittingColumns = Math.floor((available + renderedGap) / (MIN_RENDERED_CARD_W + renderedGap));
    return Math.max(1, Math.min(MAX_BOARD_COLUMNS, Math.max(tickets.length, 1), fittingColumns));
  }, [width, tickets.length, zoom]);

  /** Consume the complete board width instead of leaving a dead strip at right. */
  const columnWidth = useMemo(() => {
    if (!width) return CARD_W;
    const unscaledWidth = width / zoom;
    return Math.max(1, (unscaledWidth - GAP * 2 - GAP * (colCount - 1)) / colCount);
  }, [width, zoom, colCount]);

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
      elapsedSeconds={
        elapsedSecondsOverride != null && (!pinnedTicketId || t.id === pinnedTicketId)
          ? elapsedSecondsOverride
          : elapsedFor(t)
      }
      prepLabelFor={prepLabelFor}
      onTapItem={tapItem}
      onToggleCourse={toggleCourse}
      onStepTicket={stepTicket}
      fillHeight={fillHeight}
      identifier={identifier}
    />
  );

  if (tickets.length === 0) {
    return (
      <div ref={boardRef} className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-[15px] font-bold text-text-primary">
          {view === 'history'
            ? 'No served tickets yet'
            : view === 'seen-orders'
              ? 'No seen tickets right now'
              : view === 'unseen-orders'
                ? 'No unseen tickets right now'
                : 'No tickets match the current filters'}
        </p>
        <p className="text-[13px] text-text-muted">
          {view === 'history'
            ? 'Tickets move here once every product is Served. Tap undo on a ticket to recall it.'
            : 'Clear a filter in the footer or summary panel to see tickets again.'}
        </p>
      </div>
    );
  }

  // `zoom` scales the verbatim glass design down to the same physical card
  // width (~300px) and font sizes as the standard ticket layouts.
  const base: React.CSSProperties = { zoom, padding: GAP };

  let body: JSX.Element;
  if (viewMode === 'horizontal') {
    body = (
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
  } else if (viewMode === 'grid') {
    body = (
      <div ref={boardRef}>
        <div
          style={{
            ...base,
            display: 'grid',
            gridTemplateColumns: `repeat(${colCount}, ${columnWidth}px)`,
            alignItems: 'start',
            gap: GAP,
          }}
        >
          {tickets.map((t) => cardFor(t))}
        </div>
      </div>
    );
  } else {
    body = (
      <div ref={boardRef}>
        <div style={{ ...base, display: 'flex', alignItems: 'flex-start', gap: GAP }}>
          {staggerColumns.map((col, ci) => (
            <div key={ci} style={{ flex: '0 0 auto', width: columnWidth, display: 'flex', flexDirection: 'column', gap: GAP }}>
              {col.items.map((t) => cardFor(t))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <GlassStyleProvider value={styleValue}>{body}</GlassStyleProvider>;
}

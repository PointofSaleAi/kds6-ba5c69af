import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TicketCard } from './TicketCard';
import {
  CARD_W,
  ORDER,
  TICKETS,
  activeCourse,
  fmt,
  ticketKeys,
  ticketStage,
  type GlassStage,
  type GlassTicket,
} from './glass-tickets-data';

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

export function TicketBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const t0 = useRef(Date.now());

  const [items, setItems] = useState<Record<string, GlassStage>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const prepAt = useRef<Record<string, number>>({});
  const prepFrozen = useRef<Record<string, number>>({});
  const lastTap = useRef<{ k: string; at: number } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const measure = () => setWidth(boardRef.current?.clientWidth || 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);


  const stepItem = useCallback((k: string, dir: number) => {
    setItems((prev) => {
      const i = ORDER.indexOf(prev[k] || 'unseen');
      const stage = ORDER[Math.min(ORDER.length - 1, Math.max(0, i + dir))];
      const from = prev[k] || 'unseen';
      if (stage === 'preparing' && from !== 'preparing') prepAt.current[k] = Date.now();
      if (from === 'preparing' && stage !== 'preparing')
        prepFrozen.current[k] = Math.round((Date.now() - (prepAt.current[k] || Date.now())) / 1000);
      return { ...prev, [k]: stage };
    });
  }, []);

  /** single tap advances, double tap undoes two steps */
  const tapItem = useCallback((k: string) => {
    const nowMs = Date.now();
    const last = lastTap.current;
    if (last && last.k === k && nowMs - last.at < 420) {
      lastTap.current = null;
      stepItem(k, -2);
      return;
    }
    lastTap.current = { k, at: nowMs };
    stepItem(k, 1);
  }, [stepItem]);

  const stepTicket = useCallback((t: GlassTicket, dir: number) => {
    setItems((prev) => {
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

  const prepLabelFor = useCallback((k: string, stage: GlassStage) => {
    if (stage === 'preparing') return fmt((now - (prepAt.current[k] || now)) / 1000);
    return fmt(prepFrozen.current[k] || 0);
  }, [now]);

  const columns = useMemo(() => {
    const avail = width || (CARD_W + 16) * 3;
    const n = Math.max(1, Math.min(TICKETS.length, Math.floor((avail + 16) / (CARD_W + 16))));
    const cols = Array.from({ length: n }, () => ({ items: [] as GlassTicket[], h: 0 }));
    TICKETS.forEach((t) => {
      let best = cols[0];
      cols.forEach((c) => { if (c.h < best.h) best = c; });
      best.items.push(t);
      best.h += estHeight(t, items, open) + 16;
    });
    return cols.filter((c) => c.items.length);
  }, [width, items, open]);

  return (
    <div ref={boardRef} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 16 }}>
      {columns.map((col, ci) => (
        <div key={ci} style={{ flex: '0 0 auto', width: CARD_W, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {col.items.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              items={items}
              open={open}
              now={now}
              elapsedSeconds={t.base + (now - t0.current) / 1000}
              prepLabelFor={prepLabelFor}
              onTapItem={tapItem}
              onToggleCourse={(ck, current) => setOpen((prev) => ({ ...prev, [ck]: !current }))}
              onStepTicket={stepTicket}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

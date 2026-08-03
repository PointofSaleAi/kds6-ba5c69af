import { useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Flame, ArrowRight, Eye, Check } from 'lucide-react';
import { useStatusRules } from '@/hooks/use-status-rules';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';
import { ClocheIcon } from './icons/ClocheIcon';
import { ItemPrepTimerChip } from '@/hooks/use-item-prep-timers';
import { useTicketSkin, TicketSkinScope } from './TicketSkinScope';



type Props = {
  boardId: string;
  identifier?: 'order' | 'guest';
  orderType?: string;
  orderTypeKey?: string;
  /** Preview-only override for elapsed seconds used by the aging color calc. */
  agingOverrideSeconds?: number;
  /** Preview-only click handlers used by Ticket Studio to route tab focus. */
  onHeaderClick?: () => void;
  onTimerClick?: () => void;
};

/** Returns the primary ticket identifier label based on the setting. */
export function idLabel(identifier: 'order' | 'guest' | 'table' = 'order', variant: 'upper' | 'title' = 'upper') {
  const map = {
    order: variant === 'upper' ? 'ORDER #23' : 'Order #23',
    guest: variant === 'upper' ? 'JOHN PETERSON' : 'John Peterson',
    table: variant === 'upper' ? 'TABLE 4' : 'Table 4',
  } as const;
  return map[identifier];
}

/**
 * Board-specific standalone ticket previews.
 * Each variant mirrors the design and information hierarchy from the
 * KDS_Designs_and_Philosophy reference deck.
 */
export function BoardTicketPreview({ boardId, identifier = 'order', orderType, orderTypeKey, agingOverrideSeconds, onHeaderClick, onTimerClick, themeOverride }: Props & { themeOverride?: 'light' | 'dark' }) {
  const vprops: VProps = { identifier, orderType, orderTypeKey, agingOverrideSeconds, onHeaderClick, onTimerClick };
  const inner = (() => {
    switch (boardId) {
      case 'focus-lane':          return <FocusLaneTicket {...vprops} />;
      case 'distance-view':       return <DistanceViewTicket {...vprops} />;
      case 'progressive-ticket':  return <ProgressiveTicket {...vprops} />;
      case 'safety-first':        return <SafetyFirstTicket {...vprops} />;
      case 'timeline-flow':       return <TimelineFlowTicket {...vprops} />;
      case 'adaptive-density':    return <AdaptiveDensityTicket {...vprops} />;
      case 'dark-command-center': return <DarkCommandTicket {...vprops} />;
      case 'calm-board':
      default:                    return <CalmBoardTicket {...vprops} />;
    }
  })();
  return <TicketSkinScope theme={themeOverride}>{inner}</TicketSkinScope>;
}


type VProps = {
  identifier: NonNullable<Props['identifier']>;
  orderType?: string;
  orderTypeKey?: string;
  agingOverrideSeconds?: number;
  onHeaderClick?: () => void;
  onTimerClick?: () => void;
};


/** Live count-up timer. Formats mm:ss. */
function useLiveTimer(baselineSeconds: number = 0) {
  const [seconds, setSeconds] = useState(baselineSeconds);
  useEffect(() => {
    setSeconds(baselineSeconds);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [baselineSeconds]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/** Returns the timer string to display, honoring the preview aging override. */
function useDisplayTimer(baselineSeconds: number, override?: number) {
  const live = useLiveTimer(baselineSeconds);
  if (typeof override === 'number') {
    const mm = String(Math.floor(override / 60)).padStart(2, '0');
    const ss = String(override % 60).padStart(2, '0');
    return { text: `${mm}:${ss}`, elapsed: override };
  }
  const elapsed = live.split(':').reduce((a, b) => a * 60 + Number(b), 0);
  return { text: live, elapsed };
}


/* ------------------------------- shared bits ------------------------------ */

const Card = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <div
    className={`w-full max-w-[320px] mx-auto rounded-lg overflow-hidden border shadow-sm ${
      dark
        ? 'bg-[#1A1A2E] border-[#2A2A44] text-white'
        : 'bg-[var(--tkt-card-solid)] border-[var(--tkt-card-border)] text-[var(--tkt-text)]'
    }`}
    style={dark ? undefined : { boxShadow: 'var(--tkt-card-shadow)' }}
  >
    {children}
  </div>
);

const AllergenChip = ({ label, tone = 'red' }: { label: string; tone?: 'red' | 'amber' | 'blue' }) => {
  const styles =
    tone === 'red'
      ? 'bg-[var(--tkt-allergen-soft)] text-[var(--tkt-allergen-text)]'
      : tone === 'amber'
      ? 'bg-[var(--tkt-amber-bg)] text-[var(--tkt-amber-fg)]'
      : 'bg-[var(--tkt-blue-bg)] text-[var(--tkt-blue-fg)]';
  return (
    <span className={`inline-block px-1.5 py-[1px] rounded text-[9px] font-bold uppercase tracking-wide ${styles}`}>
      {label}
    </span>
  );
};


/* --------------------------------- CALM ----------------------------------- */

function CalmBoardTicket({ identifier, orderType, orderTypeKey, agingOverrideSeconds, onHeaderClick, onTimerClick }: VProps) {
  const isTableOrder = orderType?.toUpperCase() === 'DINE IN';
  const isGuest = identifier === 'guest';
  const headerLabel = isTableOrder
    ? idLabel('table')
    : orderType
    ? orderType.toUpperCase()
    : idLabel(identifier);

  // Live timer + status-rule driven header color (aging).
  // Baseline of 33s so the ticket starts in the "New/Start" band and ages naturally.
  const timer = useLiveTimer(33);
  const { getStatusForElapsed } = useStatusRules();
  const { orderTypeColors, orderTypeDetailedColors } = useKDSSettings();
  const liveElapsed = timer.split(':').reduce((a, b) => a * 60 + Number(b), 0);
  const elapsedSec = typeof agingOverrideSeconds === 'number' ? agingOverrideSeconds : liveElapsed;
  const status = getStatusForElapsed(elapsedSec);

  // Order type header colors from user settings (falls back to defaults).
  const key = orderTypeKey ?? 'dine-in';
  const detailed = orderTypeDetailedColors?.[key];
  const pillColor = detailed?.headerBg || orderTypeColors?.[key] || '#1A1A2E';
  const pillText = detailed?.headerText || '#FFFFFF';

  const displayTimer = typeof agingOverrideSeconds === 'number'
    ? `${String(Math.floor(agingOverrideSeconds / 60)).padStart(2, '0')}:${String(agingOverrideSeconds % 60).padStart(2, '0')}`
    : timer;

  return (
    <Card>
      <div
        className="px-3 py-1.5 flex justify-between items-center"
        style={{ background: status.color, color: status.textColor }}
      >
        <button
          type="button"
          onClick={onHeaderClick}
          className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-bold tracking-wide"
          style={{ background: pillColor, color: pillText }}
        >
          {headerLabel}
        </button>
        <button
          type="button"
          onClick={onTimerClick}
          className="text-[11px] font-mono tabular-nums cursor-pointer hover:opacity-80"
          style={{ color: status.textColor }}
          title="Cycle Aging Stage (Preview Only)"
        >
          {displayTimer}
        </button>
      </div>
      <div className="px-3 py-1.5 flex justify-between text-[10px] border-b border-border">
        <span>
          {isGuest ? (
            <><span className="font-bold">John Peterson</span> 23</>
          ) : (
            <><span className="font-bold">23</span> John Peterson</>
          )}
        </span>
        <span className="text-text-secondary">Maria S. · 8:00 PM</span>
      </div>
      <div className="px-3 py-1 text-[9px] font-bold text-[var(--tkt-allergen-text)] border-b border-[var(--tkt-hairline)]">
        ALLERGENS: PEANUT, GLUTEN, NUT
      </div>

      <CalmBoardBody />
    </Card>
  );
}

type CalmProductState = 'idle' | 'cooking' | 'ready' | 'done';

type CalmModifier = { text: string; kind: 'add' | 'remove' | 'mod' };
type CalmProduct = {
  course: string;
  name: string;
  qty: number;
  state: CalmProductState;
  modifiers?: CalmModifier[];
  note?: string;
  allergens?: string[];
};

const INITIAL_CALM_PRODUCTS: CalmProduct[] = [
  {
    course: 'APPETIZER',
    name: 'Cheese Selection',
    qty: 1,
    state: 'idle',
    modifiers: [{ text: 'Extra crackers', kind: 'add' }],
    allergens: ['DAIRY', 'GLUTEN'],
  },
  {
    course: 'ENTREE',
    name: 'Meatballs',
    qty: 2,
    state: 'idle',
    modifiers: [
      { text: 'Extra parmesan', kind: 'add' },
      { text: 'No basil', kind: 'remove' },
    ],
    note: 'One plate split for sharing',
  },
  {
    course: 'ENTREE',
    name: 'Filet Mignon',
    qty: 1,
    state: 'idle',
    modifiers: [{ text: 'Medium rare', kind: 'mod' }],
    allergens: ['NUT'],
  },
  { course: 'DESSERT', name: 'Tiramisu', qty: 1, state: 'idle' },
  {
    course: 'DESSERT',
    name: 'Crème Brûlée',
    qty: 2,
    state: 'idle',
    note: 'Serve together',
  },
  { course: 'SIDES', name: 'Truffle Fries', qty: 1, state: 'idle', modifiers: [{ text: 'Side aioli', kind: 'add' }] },
];

const CALM_ORDER_NOTE = 'Anniversary — please pace mains after apps.';

function CalmProductAction({ state, onAdvance }: { state: CalmProductState; onAdvance: () => void }) {
  const base = 'shrink-0 flex items-center justify-center active:scale-95 transition';
  const skin = useTicketSkin();
  if (state === 'done') {
    return (
      <button type="button" onClick={(e) => { e.stopPropagation(); onAdvance(); }} className={`${base} rounded-full animate-scale-in`} style={{ background: skin.servedBg, color: skin.servedFg, width: 22, height: 22 }} aria-label="Product Served">
        <Check size={14} strokeWidth={3} />
      </button>
    );
  }
  if (state === 'ready') {
    return (
      <button type="button" onClick={(e) => { e.stopPropagation(); onAdvance(); }} className={`${base} rounded-full animate-scale-in`} style={{ width: 22, height: 22, background: skin.readyBg, color: skin.readyFg, border: `1.5px solid ${skin.readyBorder}` }} aria-label="Mark Product Served">
        <Check size={14} strokeWidth={3} />
      </button>
    );
  }
  if (state === 'cooking') {
    return (
      <button type="button" onClick={(e) => { e.stopPropagation(); onAdvance(); }} className={`${base} rounded-[5px] animate-scale-in`} style={{ width: 22, height: 22, background: skin.cookingBg, color: skin.cookingFg }} aria-label="Mark Product Ready">
        <ClocheIcon size={14} strokeWidth={2.4} color={skin.cookingFg} />
      </button>
    );
  }
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onAdvance(); }} className={`${base} rounded-md hover:bg-[var(--tkt-hover)]`} style={{ width: 22, height: 22, color: skin.iconIdle }} aria-label="Start Cooking">
      <Eye size={18} strokeWidth={2} />
    </button>
  );
}


const TICKET_PHASE_ORDER: Array<'seen' | 'preparing' | 'ready' | 'served'> = ['seen', 'preparing', 'ready', 'served'];
const PHASE_TO_PRODUCT_STATE: Record<'seen' | 'preparing' | 'ready' | 'served', CalmProductState> = {
  seen: 'idle',
  preparing: 'cooking',
  ready: 'ready',
  served: 'done',
};
const PRODUCT_STATE_TO_PHASE: Record<CalmProductState, 'seen' | 'preparing' | 'ready' | 'served'> = {
  idle: 'seen',
  cooking: 'preparing',
  ready: 'ready',
  done: 'served',
};

function CalmBoardBody() {
  const [expanded, setExpanded] = useState(false);
  const [ticketPhase, setTicketPhase] = useState<'seen' | 'preparing' | 'ready' | 'served'>('seen');
  const [products, setProducts] = useState(INITIAL_CALM_PRODUCTS);
  const idPrefix = useId();

  const syncTicketFromProducts = (list: typeof INITIAL_CALM_PRODUCTS) => {
    const first = list[0].state;
    const allSame = list.every((p) => p.state === first);
    if (allSame) setTicketPhase(PRODUCT_STATE_TO_PHASE[first]);
  };

  const advanceProduct = (idx: number) => {
    setProducts((prev) => {
      const next = [...prev];
      const order: CalmProductState[] = ['idle', 'cooking', 'ready', 'done'];
      const current = next[idx].state;
      const nextState = order[(order.indexOf(current) + 1) % order.length];
      next[idx] = { ...next[idx], state: nextState };
      syncTicketFromProducts(next);
      return next;
    });
  };

  const advanceTicket = () => {
    setTicketPhase((prev) => {
      const nextPhase = TICKET_PHASE_ORDER[(TICKET_PHASE_ORDER.indexOf(prev) + 1) % TICKET_PHASE_ORDER.length];
      const targetState = PHASE_TO_PRODUCT_STATE[nextPhase];
      setProducts((list) => list.map((p) => ({ ...p, state: targetState })));
      return nextPhase;
    });
  };

  const visibleProducts = expanded ? products : products.slice(0, 3);
  const grouped = visibleProducts.reduce<Record<string, CalmProduct[]>>((acc, p) => {
    acc[p.course] = acc[p.course] || [];
    acc[p.course].push(p);
    return acc;
  }, {});
  const courseOrder = ['APPETIZER', 'ENTREE', 'DESSERT', 'SIDES'];
  const sortedCourses = courseOrder.filter((c) => grouped[c]);
  for (const c of sortedCourses) {
    grouped[c] = [...grouped[c]].sort((a, b) => Number(a.state === 'done') - Number(b.state === 'done'));
  }

  const ticketButtonStyle =
    ticketPhase === 'seen'
      ? 'border border-[var(--tkt-fill)] text-[var(--tkt-text)] bg-transparent hover:bg-[var(--tkt-fill)] hover:text-[var(--tkt-fill-fg)]'
      : ticketPhase === 'preparing'
      ? 'bg-[var(--tkt-fill)] text-[var(--tkt-fill-fg)]'
      : ticketPhase === 'ready'
      ? 'bg-[var(--tkt-ready-bg)] text-[var(--tkt-ready-fg)] border border-[var(--tkt-ready-border)]'
      : 'bg-[var(--tkt-served-bg)] text-[var(--tkt-served-fg)]';


  const ticketLabel =
    ticketPhase === 'seen' ? 'SEEN'
    : ticketPhase === 'preparing' ? 'PREPARING'
    : ticketPhase === 'ready' ? 'READY'
    : 'SERVED';

  const timerStateFor = (s: CalmProductState): 'idle' | 'cooking' | 'done' =>
    s === 'idle' ? 'idle' : s === 'cooking' ? 'cooking' : 'done';

  return (
    <>
      {CALM_ORDER_NOTE && (
        <div className="px-3 pt-2">
          <div className="rounded-md bg-[var(--tkt-note-bg)] border border-[var(--tkt-note-border)] px-2 py-1 text-[10px] text-[var(--tkt-note-fg)] leading-snug">
            <span className="font-bold uppercase tracking-wide mr-1">Order Note</span>
            {CALM_ORDER_NOTE}
          </div>
        </div>
      )}
      <div className="px-3 py-2 space-y-1.5">
        {sortedCourses.map((course) => (
          <div key={course}>
            <div className="text-[9px] font-bold text-text-secondary tracking-wide">{course}</div>
            <div className="space-y-1.5">
            {grouped[course].map((product) => {
              const globalIdx = products.findIndex((p) => p.name === product.name && p.course === product.course);
              const itemId = `${idPrefix}-${product.course}-${product.name}`;
              return (
                <div key={product.name} className="flex items-start justify-between gap-2">
                  <div className="flex items-baseline gap-2 min-w-0 flex-1">
                    <span className="text-[12px] font-normal text-text-secondary shrink-0">{product.qty}x</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold truncate leading-tight">{product.name}</div>
                      {product.modifiers?.map((m, i) => (
                        <div
                          key={i}
                          className={`text-[10px] leading-tight ${
                            m.kind === 'add'
                              ? 'text-[var(--tkt-mod-add)] font-semibold'
                              : m.kind === 'remove'
                              ? 'text-[var(--tkt-mod-remove)] font-semibold line-through'

                              : 'text-text-secondary'
                          }`}
                        >
                          {m.kind === 'add' ? '+ ' : m.kind === 'remove' ? '– ' : ''}
                          {m.text}
                        </div>
                      ))}
                      {product.note && (
                        <div className="text-[10px] italic text-text-secondary leading-tight">“{product.note}”</div>
                      )}
                      {product.allergens && product.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {product.allergens.map((a) => (
                            <AllergenChip key={a} label={a} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ItemPrepTimerChip itemId={itemId} state={timerStateFor(product.state)} enabled />
                    <CalmProductAction state={product.state} onAdvance={() => advanceProduct(globalIdx)} />
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ))}



        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between text-[10px] text-text-secondary pt-1 hover:text-[var(--tkt-text)] transition-colors"
        >
          <span>{expanded ? 'Hide extra courses' : '+ 2 Courses'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <div className="px-3 pb-3 pt-1">
        <button
          type="button"
          onClick={advanceTicket}
          className={`w-full text-[11px] font-bold py-2 tracking-wide rounded-md active:scale-[0.99] transition ${ticketButtonStyle}`}
        >
          {ticketLabel}
        </button>
      </div>
    </>
  );
}


/* ------------------------------ FOCUS LANE -------------------------------- */

function FocusLaneTicket({ identifier, agingOverrideSeconds, onTimerClick }: VProps) {
  const { text } = useDisplayTimer(2013, agingOverrideSeconds);
  const [phase, setPhase] = useState<'seen' | 'preparing' | 'ready'>('seen');
  const orderNumberLabel = identifier === 'order' ? '23' : idLabel(identifier);
  const phases: Array<'seen' | 'preparing' | 'ready'> = ['seen', 'preparing', 'ready'];
  return (
    <Card>
      <div className="h-1.5 bg-[var(--tkt-accent)]" />
      <div className="px-3 pt-2 pb-1.5 flex justify-between items-center">
        <div className="text-[16px] font-black">{orderNumberLabel}</div>
        <button type="button" onClick={onTimerClick} className="text-[13px] font-mono tabular-nums cursor-pointer hover:opacity-80">{text}</button>
      </div>
      <div className="bg-[var(--tkt-amber-bg)] text-[var(--tkt-amber-fg)] text-[10px] font-bold px-3 py-1">
        ALLERGEN WARNING: PEANUT, GLUTEN
      </div>
      <div className="px-3 py-1 border-b border-[var(--tkt-hairline)] text-[10px] font-bold text-text-secondary">
        CURRENT COURSE: ENTREE
      </div>
      <div className="px-3 py-2.5 space-y-2 border-b border-[var(--tkt-hairline)]">

        <div className="flex items-baseline gap-3">
          <span className="text-[22px] font-black leading-none">2</span>
          <span className="text-[15px] font-bold">Meatballs</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-[22px] font-black leading-none">1</span>
          <span className="text-[15px] font-bold">Filet Mignon</span>
        </div>
      </div>
      <div className="px-3 py-1.5 border-b border-border">
        <div className="flex justify-between items-center text-[9px] font-bold text-text-secondary">
          <span>FUTURE: +APPETIZER, +DESSERT</span>
          <ChevronDown className="w-3 h-3" />
        </div>
        <div className="text-[11px] text-[var(--tkt-mod-add)] font-semibold mt-0.5">+1 Grilled Barramundi</div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border">
        {phases.map((p) => {
          const active = phase === p;
          const passed = phases.indexOf(p) < phases.indexOf(phase);
          return (
            <button
              key={p}
              type="button"
              disabled={!active}
              onClick={() => {
                const idx = phases.indexOf(phase);
                if (idx < phases.length - 1) setPhase(phases[idx + 1]);
              }}
              className={`py-2 text-[10px] font-bold transition text-[var(--tkt-accent)] ${
                active ? 'opacity-100' : passed ? 'opacity-40' : 'opacity-30'
              } ${active ? 'cursor-pointer' : 'cursor-default'}`}

            >
              {p.toUpperCase()}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ----------------------------- DISTANCE VIEW ------------------------------ */

function DistanceViewTicket({ identifier, agingOverrideSeconds, onTimerClick }: VProps) {
  const { text, elapsed } = useDisplayTimer(1944, agingOverrideSeconds);
  const { rules, getStatusForElapsed } = useStatusRules();
  const status = getStatusForElapsed(elapsed);
  const skin = useTicketSkin();

  // Build a loader-style rainbow ring. Each rule occupies an equal arc;
  // the current rule fills progressively so the ring is never fully occupied.
  // The current status color always sits at the leading edge of the filled arc.
  const currentIdx = Math.max(0, rules.findIndex((r) => r.id === status.ruleId));
  const seg = 360 / Math.max(rules.length, 1);
  const rule = rules[currentIdx];
  const ruleStart = rule.minMinutes * 60;
  const ruleEnd = rule.maxMinutes ? rule.maxMinutes * 60 : ruleStart + 600;
  const ruleProgress = Math.min(Math.max((elapsed - ruleStart) / (ruleEnd - ruleStart), 0), 1);
  const fillAngle = currentIdx * seg + ruleProgress * seg;

  const stops: string[] = [];
  for (let i = 0; i < rules.length; i++) {
    const start = i * seg;
    const end = (i + 1) * seg;
    if (end <= fillAngle + 0.5) {
      stops.push(`${rules[i].color} ${start}deg ${end}deg`);
    } else if (start < fillAngle) {
      stops.push(`${rules[i].color} ${start}deg ${fillAngle}deg`);
      stops.push(`${skin.ringTrack} ${fillAngle}deg ${end}deg`);
    } else {
      stops.push(`${skin.ringTrack} ${start}deg ${end}deg`);
    }
  }

  const ringBg = `conic-gradient(from -90deg, ${stops.join(', ')})`;

  return (
    <Card>
      <div className="bg-[var(--tkt-header-bg)] text-[var(--tkt-header-fg)] px-3 py-1.5 text-[11px] font-bold flex justify-between">
        <span>TABLE 4 | 8:09 PM | Maria S.</span>
      </div>
      <div className="bg-[#F5B041] text-[#1A1A2E] text-[10px] font-semibold leading-tight px-3 py-1.5">
        Allergy to nuts, Please prepare food separately and notify server
      </div>
      <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--tkt-hairline)]">
        <div>
          <div className="text-[10px] text-text-secondary font-semibold">Ticket</div>
          <div className="text-[44px] font-black leading-none text-[var(--tkt-text)]">23</div>
          <div className="text-[10px] text-text-secondary">Order</div>
        </div>
        <button
          type="button"
          onClick={onTimerClick}
          className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-colors"
          style={{ background: ringBg }}
          aria-label={`Aging status: ${status.label}`}
        >
          <span className="absolute inset-[3px] rounded-full bg-[var(--tkt-card-solid)] flex items-center justify-center">
            <span className="text-[12px] font-mono tabular-nums font-bold text-[var(--tkt-text)]">{text}</span>
          </span>
        </button>
      </div>

      <div className="px-3 py-2.5 space-y-2.5 border-b border-[var(--tkt-hairline)]">
        <div>
          <div className="text-[15px] font-black uppercase leading-tight text-[var(--tkt-text)]">2x Filet Mignon</div>
          <div className="text-[11px] text-[var(--tkt-accent)] font-semibold">medium rare</div>
          <div className="text-[11px] text-[var(--tkt-mod-add)] font-semibold">+ Extra Sauce</div>
          <div className="text-[11px] text-[var(--tkt-mod-remove)] font-semibold">No Pickles</div>
        </div>
        <div>
          <div className="text-[15px] font-black uppercase leading-tight text-[var(--tkt-text)]">2x Filet Mignon</div>
          <div className="text-[11px] text-[var(--tkt-accent)] font-semibold">medium rare</div>
          <div className="text-[11px] text-[var(--tkt-mod-add)] font-semibold">+ Extra Sauce</div>
        </div>
      </div>
      <button className="w-full text-[12px] font-bold py-2.5 flex items-center justify-center gap-2 text-[var(--tkt-text)] tracking-wide">

        <CheckCircle2 className="w-4 h-4" />
        MARK AS COMPLETE
      </button>
    </Card>
  );
}

/* --------------------------- PROGRESSIVE TICKET --------------------------- */

function ProgressiveTicket({ identifier, agingOverrideSeconds, onTimerClick }: VProps) {
  const { text } = useDisplayTimer(2013, agingOverrideSeconds);
  return (
    <Card>
      <div className="px-3 py-2 flex justify-between items-center border-b border-border">
        <div className="text-[13px] font-bold">{idLabel(identifier, "title")} <span className="text-text-secondary font-normal">(3)</span></div>
        <button type="button" onClick={onTimerClick} className="text-[12px] font-mono tabular-nums cursor-pointer hover:opacity-80">{text}</button>
      </div>
      <div className="px-3 py-1 text-[9px] font-bold text-[var(--tkt-allergen-text)] border-b border-[var(--tkt-hairline)]">

        [CRITICAL ALLERGEN: PEANUT, GLUTEN, NUT]
      </div>
      <div className="px-3 py-1 text-[9px] font-bold text-text-secondary tracking-wide">ACTIVE COURSE</div>
      <div className="px-3 py-1.5 border-b border-border">
        <div className="flex items-center gap-1 text-[11px] font-bold">
          <ChevronDown className="w-3 h-3" /> APPETIZER
        </div>
        <div className="pl-4 mt-1 space-y-1">
          <Row n="1" name="Cheese Selection" chips={[['PEANUT ALLERGEN', 'red']]} />
          <Row n="2" name="Meatballs" chips={[['NUT ALLERGY', 'red']]} />
          <Row n="3" name="Filet Mignon" chips={[['DAIRY ALLERGY', 'blue']]} />
          <Row n="4" name="Eggplant Parmesan" chips={[['DAIRY ALLERGY', 'blue'], ['GLUTEN ALLERGY', 'amber']]} />
        </div>
      </div>
      <div className="px-3 py-1 border-b border-border">
        <div className="flex items-center justify-between text-[10px] text-text-secondary">
          <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> ENTREE (3 items)</span>
          <span>8:57 pm</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-text-secondary mt-0.5">
          <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> DESSERT (3 items)</span>
          <span>8:18 pm</span>
        </div>
      </div>
      <button className="w-full bg-[var(--tkt-accent)] text-[var(--tkt-accent-fg)] text-[11px] font-bold py-2 tracking-wide">
        PREPARING
      </button>
    </Card>
  );
}

function Row({ n, name, chips = [] }: { n: string; name: string; chips?: [string, 'red' | 'amber' | 'blue'][] }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold text-text-secondary w-3">{n}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold leading-tight">{name}</div>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {chips.map(([l, t]) => <AllergenChip key={l} label={l} tone={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ SAFETY FIRST ------------------------------ */

function SafetyFirstTicket({ identifier, agingOverrideSeconds, onTimerClick }: VProps) {
  const { text, elapsed } = useDisplayTimer(1923, agingOverrideSeconds);
  const { getStatusForElapsed } = useStatusRules();
  const status = getStatusForElapsed(elapsed);
  return (
    <Card>
      <div className="bg-[var(--tkt-header-bg)] text-[var(--tkt-header-fg)] px-3 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-[#C0392B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{idLabel(identifier)}</span>
          <span className="text-[11px] font-bold">23</span>
        </div>
        <button type="button" onClick={onTimerClick} style={{ backgroundColor: status.color, color: status.textColor }} className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80">{text}</button>
      </div>
      <div className="px-3 py-0.5 text-[9px] flex justify-between border-b border-border">
        <span>John Peterson</span>
        <span className="text-text-secondary">Maria S · 8:11 PM</span>
      </div>
      <div className="bg-[#E84C3D] text-white text-[10px] font-bold px-3 py-1.5 leading-tight">
        ALLERGENS: PEANUT, GLUTEN | CONTACT: USE CLEAN BOARD, SEP. FRYER
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <SafetyRow n="1" name="Cheese Selection" chip="PEANUT" />
        <SafetyRow n="2" name="Meatballs" chip="Shellfish Allergy" tone="red-outline" />
        <SafetyRow n="1" name="Filet Mignon" note="Medium rare" />
      </div>
      <button className="w-full border-t border-[var(--tkt-hairline)] text-[11px] font-bold py-2 text-[var(--tkt-text)]">
        SERVE
      </button>
    </Card>
  );
}

function SafetyRow({ n, name, chip, note, tone }: { n: string; name: string; chip?: string; note?: string; tone?: 'red-outline' }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-4 h-4 rounded-full bg-muted text-[9px] font-bold flex items-center justify-center shrink-0">{n}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold leading-tight">{name}</div>
        {chip && (
          <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-[1px] rounded ${
            tone === 'red-outline'
              ? 'border border-[var(--tkt-allergen-text)] text-[var(--tkt-allergen-text)]'
              : 'bg-[var(--tkt-allergen-soft)] text-[var(--tkt-allergen-text)]'

          }`}>
            <AlertTriangle className="w-2 h-2 inline mr-0.5" /> {chip}
          </span>
        )}
        {note && <div className="text-[10px] text-text-secondary">{note}</div>}
      </div>
    </div>
  );
}

/* ----------------------------- TIMELINE FLOW ------------------------------ */

function TimelineFlowTicket({ identifier, agingOverrideSeconds, onTimerClick }: VProps) {
  const { text, elapsed } = useDisplayTimer(763, agingOverrideSeconds);
  const { getStatusForElapsed } = useStatusRules();
  const status = getStatusForElapsed(elapsed);
  return (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="text-[10px] font-bold text-text-secondary uppercase mb-1.5 tracking-wide flex items-center gap-1">
        <Flame className="w-3 h-3" style={{ color: status.color }} /> Cooking Lane
      </div>
      <Card>
        <div className="px-3 py-1.5 flex justify-between items-center border-b border-border">
          <div className="text-[12px] font-bold">Order 2</div>
          <button type="button" onClick={onTimerClick} style={{ color: status.color }} className="text-[11px] font-bold font-mono tabular-nums cursor-pointer hover:opacity-80">{text}</button>
        </div>
        <div className="px-3 py-1 flex justify-between text-[10px] border-b border-border">
          <span>21 · Table #</span>
          <span className="text-text-secondary">8:07 PM</span>
        </div>
        <div className="px-3 py-2 space-y-1">
          <div className="flex justify-between border-l-2 border-[#E84C3D] pl-2 text-[11px]">
            <span className="font-semibold">Appetizer</span>
            <span className="font-bold">3</span>
          </div>
          <div className="flex justify-between border-l-2 border-[var(--tkt-accent)] pl-2 text-[11px]">
            <span className="font-semibold">Entrée</span>
            <span className="font-bold">3</span>
          </div>
        </div>
        <div className="px-3 py-1.5 border-t border-border">
          <div className="text-[9px] font-bold text-text-secondary">Allergies</div>
          <div className="text-[10px]">Allow Pina</div>
        </div>
        <button className="w-full border-t border-border text-[11px] font-bold py-2 flex items-center justify-center gap-1.5">
          <Flame className="w-3 h-3" /> COOK
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </Card>
      <div className="text-[9px] text-text-secondary text-center mt-1">
        Next stage → Plating
      </div>
    </div>
  );
}

/* ---------------------------- ADAPTIVE DENSITY ---------------------------- */

function AdaptiveDensityTicket({ identifier, agingOverrideSeconds, onTimerClick }: VProps) {
  const { text, elapsed } = useDisplayTimer(1927, agingOverrideSeconds);
  const { getStatusForElapsed } = useStatusRules();
  const status = getStatusForElapsed(elapsed);
  return (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="flex gap-1 mb-1.5 text-[9px] font-bold">
        <span className="px-1.5 py-0.5 rounded-full bg-muted text-text-secondary">Comfortable</span>
        <span className="px-1.5 py-0.5 rounded-full bg-foreground text-background">Balanced</span>
        <span className="px-1.5 py-0.5 rounded-full bg-muted text-text-secondary">Rush</span>
      </div>
      <Card>
        <div className="px-3 py-1.5 flex justify-between items-center border-b border-border">
          <div className="flex items-center gap-1.5">
            <span style={{ backgroundColor: status.color, color: status.textColor }} className="text-[8px] font-bold px-1.5 py-0.5 rounded">URGENT</span>
            <span className="text-[12px] font-bold">23</span>
          </div>
          <button type="button" onClick={onTimerClick} style={{ backgroundColor: `${status.color}26`, color: status.color }} className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80">{text}</button>
        </div>
        <div className="px-3 py-0.5 text-[10px] flex justify-between border-b border-border">
          <span>John Peterson</span>
          <span className="text-text-secondary">Maria S. · 8:11 PM</span>
        </div>
        <div className="px-3 py-1 text-[9px] font-bold text-[var(--tkt-allergen-text)] border-b border-[var(--tkt-hairline)]">

          ! ALLERGENS: Dairy, Gluten, Nut
        </div>
        <div className="px-3 py-1.5 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-muted text-[9px] font-bold flex items-center justify-center">1</span>
            <span className="text-[11px] font-semibold">Cheese Selection</span>
            <AllergenChip label="PEANUT" />
          </div>
          <div className="text-[9px] font-bold text-text-secondary uppercase pt-1">APPETIZER</div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-muted text-[9px] font-bold flex items-center justify-center">2</span>
            <span className="text-[11px] font-semibold">Cheese Selection</span>
            <AllergenChip label="PEANUT" />
          </div>
        </div>
        <div className="px-3 py-1 space-y-0.5 border-t border-border text-[10px] text-text-secondary">
          <div className="flex justify-between">
            <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> ENTREE (2)</span>
            <span>8:46 pm</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> DESSERT (1)</span>
            <span>8:10 pm</span>
          </div>
          <div className="flex justify-between pt-0.5">
            <span className="italic">33 min. ago</span>
            <span>◉ Seen</span>
          </div>
        </div>
        <button className="w-full bg-[var(--tkt-accent)] text-[var(--tkt-accent-fg)] text-[11px] font-bold py-2 tracking-wide">

          Fulfill
        </button>
      </Card>
    </div>
  );
}

/* --------------------------- DARK COMMAND CENTER -------------------------- */

function DarkCommandTicket({ identifier, agingOverrideSeconds, onTimerClick }: VProps) {
  const { text } = useDisplayTimer(1923, agingOverrideSeconds);
  return (
    <Card dark>
      <div className="px-3 py-1.5 flex justify-between items-center border-b border-[#2A2A44]">
        <div className="flex items-center gap-1.5">
          <span className="bg-[#0D0D1A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{idLabel(identifier)}</span>
          <span className="text-[12px] font-bold">23</span>
        </div>
        <button type="button" onClick={onTimerClick} className="bg-[#3B1F1F] text-[#F5B4AC] text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80">{text}</button>
      </div>
      <div className="px-3 py-0.5 text-[10px] flex justify-between border-b border-[#2A2A44] text-[#B8B8CC]">
        <span>John Peterson</span>
        <span>Maria S. · 8:11 PM</span>
      </div>
      <div className="px-3 py-1 text-[9px] font-bold text-[#F5B4AC] border-b border-[#2A2A44]">
        ! PEANUT, GLUTEN, NUT
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#2A2A44] text-[9px] font-bold flex items-center justify-center">1</span>
            <span className="text-[12px] font-semibold">Cheese Selection</span>
          </div>
          <div className="pl-6 mt-0.5">
            <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-[1px] rounded border border-[#F5B4AC] text-[#F5B4AC]">
              ! PEANUT
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#2A2A44] text-[9px] font-bold flex items-center justify-center">2</span>
            <span className="text-[12px] font-semibold">Meatballs</span>
          </div>
          <div className="pl-6 mt-0.5 text-[10px] text-[#B8B8CC] space-y-0.5">
            <div>Medium Rare</div>
            <div>Extra Cheese</div>
            <div className="italic">"Make it extra spicy please"</div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#2A2A44] text-[9px] font-bold flex items-center justify-center">1</span>
            <span className="text-[12px] font-semibold">Filet Mignon</span>
          </div>
        </div>
      </div>
      <button className="w-full border-t border-[#2A2A44] text-[11px] font-bold py-2 text-[#5EE3C1]">
        MARK PREPARED
      </button>
      <div className="px-3 py-1 text-[9px] text-[#8888A0] border-t border-[#2A2A44] flex items-center gap-1">
        <ChevronRight className="w-3 h-3" /> Collapsed: 1 DESSERTS
      </div>
    </Card>
  );
}

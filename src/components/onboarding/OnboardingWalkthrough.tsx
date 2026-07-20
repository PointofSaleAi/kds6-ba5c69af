import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Eye, Bell, CheckCircle2, ListChecks, LayoutGrid, GraduationCap, AlertTriangle, Tag, Clock, Hash, MessageSquare, Utensils } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useOrderStore } from '@/hooks/use-order-store';
import { makeOnboardingSampleOrder, ONBOARDING_SAMPLE_ORDER_ID } from '@/data/onboarding-sample-order';

type ArrowSide = 'top' | 'bottom' | 'left' | 'right';

type IconType = React.ComponentType<{ size?: number | string; className?: string }>;

interface Step {
  anchor: string; // css selector
  title: string;
  body: string;
  icon: IconType;
  preferSide?: ArrowSide;
}

const SAMPLE = `[data-order-id="${ONBOARDING_SAMPLE_ORDER_ID}"]`;

const STEPS: Step[] = [
  // Ticket card cues
  { anchor: `${SAMPLE} [data-onboarding="ticket-header"]`, title: 'Order type', body: 'Color tells you Dine-in, Take-out, Delivery, or Banquet at a glance.', icon: Tag, preferSide: 'right' },
  { anchor: `${SAMPLE} [data-onboarding="ticket-orderno"]`, title: 'Order or table number', body: 'Big and centered so you can read it across the kitchen.', icon: Hash, preferSide: 'right' },
  { anchor: `${SAMPLE} [data-onboarding="ticket-timer"]`, title: 'Ticket timer', body: 'Counts how long this order has been open. Turns amber, then red as it gets older.', icon: Clock, preferSide: 'left' },
  { anchor: `${SAMPLE} [data-onboarding="item-row"]`, title: 'Item row', body: 'Each row is one item on the order.', icon: Utensils, preferSide: 'right' },
  { anchor: `${SAMPLE} [data-onboarding="item-allergen"]`, title: 'Allergen', body: 'Allergens always show as a red chip. Never miss one.', icon: AlertTriangle, preferSide: 'right' },
  { anchor: `${SAMPLE} [data-onboarding="item-modifier"]`, title: 'Modifiers', body: 'Extras show in blue. Removals show in red with a strikethrough.', icon: MessageSquare, preferSide: 'right' },
  { anchor: `${SAMPLE} [data-onboarding="item-eye"]`, title: 'Mark item seen', body: 'Tap the eye to mark just this item as seen.', icon: Eye, preferSide: 'left' },
  { anchor: `${SAMPLE} [data-onboarding="item-bell"]`, title: 'Mark item cooking', body: 'Tap the bell when the item is on the pass.', icon: Bell, preferSide: 'left' },
  { anchor: `${SAMPLE} [data-onboarding="item-check"]`, title: 'Mark item done', body: 'Tap the check when the item is out and served.', icon: CheckCircle2, preferSide: 'left' },
  { anchor: `${SAMPLE} [data-onboarding="ticket-footer-btn"]`, title: 'Mark ticket seen', body: 'First tap marks every item on the ticket as seen so the line knows it is acknowledged.', icon: Eye, preferSide: 'top' },
  { anchor: `${SAMPLE} [data-onboarding="ticket-footer-btn"]`, title: 'Mark ticket in progress', body: 'Second tap moves the whole ticket to in progress, letting the team know cooking has started.', icon: Bell, preferSide: 'top' },
  { anchor: `${SAMPLE} [data-onboarding="ticket-footer-btn"]`, title: 'Mark ticket done', body: 'Third tap marks the ticket done and removes it from the active queue.', icon: CheckCircle2, preferSide: 'top' },

  // Summary panel cues
  { anchor: '[data-onboarding="summary-header"]', title: 'Summary panel', body: 'A running list of everything still to cook, grouped by category.', icon: ListChecks, preferSide: 'left' },
  { anchor: '[data-onboarding="summary-overtime"]', title: 'Overtime', body: 'Items open too long land here. Fire these first.', icon: AlertTriangle, preferSide: 'left' },
  { anchor: '[data-onboarding="summary-category"]', title: 'Category', body: 'Items are grouped by category. Tap a category to filter the queue.', icon: ListChecks, preferSide: 'left' },
  { anchor: '[data-onboarding="summary-product"]', title: 'Product', body: 'Tap a product to filter the queue to only tickets with that product. Tap again to clear.', icon: ListChecks, preferSide: 'left' },

  // Footer cues
  { anchor: '[data-onboarding="queue-count"]', title: 'Orders in queue', body: 'This is the number of active orders across your queue.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="filter"]', title: 'Filter', body: 'Filter the queue by category.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="revenue"]', title: 'Revenue center', body: 'Filter by revenue center or route printing.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="sort"]', title: 'Sort', body: 'Sort the queue by time, table, or type.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="view-grid"]', title: 'Grid view', body: 'Show tickets in a grid layout.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="view-horizontal"]', title: 'Horizontal view', body: 'Show tickets in a horizontal row layout.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="view-stagger"]', title: 'Stagger view', body: 'Show tickets in a staggered column layout.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="language"]', title: 'Language', body: 'Switch the KDS interface language.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="sound"]', title: 'Sound', body: 'Mute or unmute new-order and alert sounds.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="theme"]', title: 'Theme', body: 'Switch between light and dark theme.', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="ai"]', title: 'Ask AI anything', body: 'Change settings or run actions just by asking. Try "switch to grid view".', icon: LayoutGrid, preferSide: 'top' },
  { anchor: '[data-onboarding="datetime"]', title: 'Date and time', body: 'Local date and time for this device.', icon: LayoutGrid, preferSide: 'top' },
];

interface Rect { top: number; left: number; width: number; height: number; }

function useAnchorRect(selector: string | null, dep: unknown): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);
  useLayoutEffect(() => {
    if (!selector) { setRect(null); return; }
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const el = Array.from(document.querySelectorAll(selector)).find(
        (node) => !(node as HTMLElement).closest('[data-ts-preview]'),
      ) as HTMLElement | undefined;
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect(prev => {
        if (prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height) return prev;
        return { top: r.top, left: r.left, width: r.width, height: r.height };
      });
    };
    measure();
    // Re-measure a few times to catch late layout (fonts, images) without a hot RAF loop.
    const t1 = window.setTimeout(measure, 60);
    const t2 = window.setTimeout(measure, 250);
    const t3 = window.setTimeout(measure, 700);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelled = true;
      window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [selector, dep]);
  return rect;
}

function TooltipCard({
  rect, step, index, total, onNext, onPrev, onSkip,
}: {
  rect: Rect | null; step: Step; index: number; total: number; onNext: () => void; onPrev: () => void; onSkip: () => void;
}) {
  const Icon = step.icon;
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({ w: 340, h: 180 });
  useLayoutEffect(() => {
    if (!cardRef.current) return;
    const w = cardRef.current.offsetWidth;
    const h = cardRef.current.offsetHeight;
    setCardSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
  }, [step.title, step.body]);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const GAP = 16;

  let top = vh / 2 - cardSize.h / 2;
  let left = vw / 2 - cardSize.w / 2;
  let side: ArrowSide = 'top';

  if (rect) {
    const anchorCX = rect.left + rect.width / 2;
    const anchorCY = rect.top + rect.height / 2;
    const spaceAbove = rect.top;
    const spaceBelow = vh - (rect.top + rect.height);
    const spaceLeft = rect.left;
    const spaceRight = vw - (rect.left + rect.width);

    const preferred = step.preferSide || 'top';
    const spaces: Record<ArrowSide, number> = { top: spaceAbove, bottom: spaceBelow, left: spaceLeft, right: spaceRight };
    const needed = (s: ArrowSide) => (s === 'top' || s === 'bottom') ? cardSize.h + GAP + 24 : cardSize.w + GAP + 24;
    side = spaces[preferred] >= needed(preferred)
      ? preferred
      : (Object.entries(spaces) as [ArrowSide, number][]).sort((a, b) => b[1] - a[1])[0][0];

    if (side === 'top') { top = rect.top - cardSize.h - GAP; left = anchorCX - cardSize.w / 2; }
    else if (side === 'bottom') { top = rect.top + rect.height + GAP; left = anchorCX - cardSize.w / 2; }
    else if (side === 'left') { left = rect.left - cardSize.w - GAP; top = anchorCY - cardSize.h / 2; }
    else { left = rect.left + rect.width + GAP; top = anchorCY - cardSize.h / 2; }

    left = Math.max(12, Math.min(left, vw - cardSize.w - 12));
    top = Math.max(12, Math.min(top, vh - cardSize.h - 12));
  }

  const isLast = index === total - 1;

  return (
    <div
      ref={cardRef}
      className="fixed z-[10001] w-[340px] rounded-2xl shadow-2xl p-5"
      style={{ top, left, background: '#1F1F24', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <Icon size={18} className="text-amber-400" />
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight">{step.title}</div>
          <div className="text-[11px] text-white/50 mt-0.5">Step {index + 1} of {total}</div>
        </div>
      </div>
      <p className="text-[13px] text-white/75 leading-relaxed mb-4">{step.body}</p>
      <div className="flex items-center justify-between gap-2">
        {index > 0 && (
          <button
            onClick={onPrev}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-[13px] font-bold text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-full text-[13px] font-bold text-white/70 hover:text-white hover:bg-white/10"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold"
            style={{ background: '#F59E0B', color: '#1a1a1a' }}
          >
            {isLast ? 'Finish' : 'Next'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CompletionCard({ onChoose }: { onChoose: (c: 'training' | 'done') => void }) {
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: '#1F1F24', color: '#fff' }}>
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <GraduationCap size={26} className="text-amber-400" />
          </div>
        </div>
        <h2 className="text-center text-[18px] font-bold mb-2">Feeling good, or want to practice?</h2>
        <p className="text-center text-[13px] text-white/70 mb-6">
          Training mode uses sample orders. No real tickets are at risk while you get comfortable.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onChoose('training')}
            className="w-full py-3 rounded-xl text-[14px] font-bold"
            style={{ background: '#F59E0B', color: '#1a1a1a' }}
          >
            Switch to training mode
          </button>
          <button
            onClick={() => onChoose('done')}
            className="w-full py-3 rounded-xl text-[14px] font-bold text-white/80 hover:bg-white/5"
          >
            No, I'm good
          </button>
        </div>
      </div>
    </div>
  );
}

export function OnboardingWalkthrough() {
  const { active, stepIndex, totalSteps, next, prev, skip, showCompletion, dismissCompletion } = useOnboarding();
  const { orders, setOrders } = useOrderStore();
  const { pathname } = useLocation();
  const isTicketBoardRoute = !pathname.includes('/settings');

  // Step indices that map to the 3-tap ticket footer button progression.
  // Kept in sync with STEPS above (Mark ticket seen / in progress / done).
  const ITEM_EYE_STEP = 6;
  const ITEM_BELL_STEP = 7;
  const ITEM_CHECK_STEP = 8;
  const TICKET_SEEN_STEP = 9;
  const TICKET_IN_PROGRESS_STEP = 10;
  const TICKET_DONE_STEP = 11;

  const clickSample = (sel: string) => {
    const el = Array.from(document.querySelectorAll(`${SAMPLE} ${sel}`)).find(
      (node) => !(node as HTMLElement).closest('[data-ts-preview]'),
    ) as HTMLElement | undefined;
    el?.click();
  };
  const dispatchItem = (type: 'advance' | 'undo') => {
    window.dispatchEvent(new CustomEvent(`kds:onboarding-item-${type}`));
  };

  const lastDirectionRef = useRef<'next' | 'prev' | 'init'>('init');

  const handleNext = () => {
    lastDirectionRef.current = 'next';
    // Progress the sample item state so the correct icon is visible for the next cue.
    if (stepIndex === ITEM_EYE_STEP || stepIndex === ITEM_BELL_STEP) {
      dispatchItem('advance');
    }
    // Advancing OUT of the "seen" or "in progress" cue should visibly tick the
    // sample ticket forward so the footer button label/color updates.
    if (stepIndex === TICKET_SEEN_STEP || stepIndex === TICKET_IN_PROGRESS_STEP) {
      clickSample('[data-onboarding="ticket-footer-btn"]');
    }
    next();
  };

  const handlePrev = () => {
    lastDirectionRef.current = 'prev';
    // Rewind sample item state when stepping back through item cues.
    if (stepIndex === ITEM_BELL_STEP || stepIndex === ITEM_CHECK_STEP) {
      dispatchItem('undo');
    }
    // Going back INTO the "seen", "in progress", or leaving the "seen" cue itself
    // should rewind the sample ticket via undo so the state matches the cue shown.
    if (
      stepIndex === TICKET_SEEN_STEP ||
      stepIndex === TICKET_IN_PROGRESS_STEP ||
      stepIndex === TICKET_DONE_STEP
    ) {
      clickSample('[data-onboarding="ticket-footer-undo"]');
    }
    prev();
  };

  // Inject / remove sample ticket while walkthrough is running.
  // Note: no unmount cleanup effect — React StrictMode's double-mount would
  // then remove the just-injected sample and leave it stripped forever.
  useEffect(() => {
    const shouldInject = isTicketBoardRoute && (active || showCompletion); // keep sample until completion prompt dismissed
    const has = orders.some(o => o.id === ONBOARDING_SAMPLE_ORDER_ID);
    if (shouldInject && !has) {
      setOrders(prev => (prev.some(o => o.id === ONBOARDING_SAMPLE_ORDER_ID) ? prev : [makeOnboardingSampleOrder(), ...prev]));
    }
    if (!shouldInject && has) {
      setOrders(prev => prev.filter(o => o.id !== ONBOARDING_SAMPLE_ORDER_ID));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, showCompletion, isTicketBoardRoute, orders]);

  const step = active ? STEPS[Math.min(stepIndex, STEPS.length - 1)] : null;
  const rect = useAnchorRect(step ? step.anchor : null, stepIndex);

  // Auto-skip a step if its anchor never appears (e.g. Overtime with no items),
  // but only when moving forward. Auto-skipping while the user is pressing Back
  // would immediately snap them forward again.
  useEffect(() => {
    if (!isTicketBoardRoute || !active || !step) return;
    if (lastDirectionRef.current === 'prev') return;
    const t = window.setTimeout(() => {
      const hasAnchor = Array.from(document.querySelectorAll(step.anchor)).some(
        (node) => !(node as HTMLElement).closest('[data-ts-preview]'),
      );
      if (!hasAnchor) {
        next();
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [active, step, stepIndex, next]);

  const spotlightPadding = 6;
  const spotlight = useMemo(() => {
    if (!rect) return null;
    const p = spotlightPadding;
    return { top: rect.top - p, left: rect.left - p, width: rect.width + p * 2, height: rect.height + p * 2 };
  }, [rect]);

  if (!isTicketBoardRoute || (!active && !showCompletion)) return null;

  return (
    <>
      {active && (
        <>
          {/* Overlay with a cut-out via 4 rectangles so spotlight stays interactive-visual */}
          <div className="fixed inset-0 z-[9998] pointer-events-auto" aria-hidden="true">
            {spotlight ? (
              <svg width="100%" height="100%" style={{ display: 'block' }}>
                <defs>
                  <mask id="onb-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={spotlight.left} y={spotlight.top}
                      width={spotlight.width} height={spotlight.height}
                      rx={10} ry={10} fill="black"
                    />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#onb-mask)" />
              </svg>
            ) : (
              <div className="w-full h-full" style={{ background: 'rgba(0,0,0,0.72)' }} />
            )}
          </div>

          {/* Spotlight ring */}
          {spotlight && (
            <div
              className="fixed z-[9999] pointer-events-none rounded-[10px]"
              style={{
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
                boxShadow: '0 0 0 2px #F59E0B, 0 0 24px 4px rgba(245,158,11,0.35)',
              }}
            />
          )}

          {step && (
            <TooltipCard
              rect={rect}
              step={step}
              index={stepIndex}
              total={totalSteps}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={skip}
            />
          )}
        </>
      )}

      {showCompletion && <CompletionCard onChoose={dismissCompletion} />}
    </>
  );
}

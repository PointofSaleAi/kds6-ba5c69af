import { useState, useEffect, useRef, useMemo } from 'react';
import type { Order, OrderItem } from '@/types/kds';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, courseLabel, sortDoneLast } from './variant-utils';
import { formatTime } from '@/lib/datetime';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { OrderCardActions, type TicketState } from '@/components/kds/OrderCardActions';
import { OrderNotesSection } from '@/components/kds/OrderNotesSection';
import { useLongPress } from '@/hooks/use-long-press';
import { RecipeModalV1 } from './RecipeModalV1';
import { Check, Loader2 } from 'lucide-react';

type RowState = 'idle' | 'loading' | 'done';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
  onMarkSeen?: (orderId: string) => void;
  onItemDone?: (orderId: string, itemId: string) => void;
  onItemDismiss?: (orderId: string, item: OrderItem) => void;
  isSeen?: boolean;
}

/**
 * Live ticket card that mirrors the "Calm Board" preview from Ticket Studio.
 * Dark navy header · guest + server sub-row · red allergen strip · course-grouped
 * items · single dark bottom action button (SEEN → PREPARING → SERVED).
 */
export function CalmBoardCard({ order, onBump, onMarkSeen, onItemDone, onItemDismiss, isSeen }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const { ticketHeaderLayout } = useKDSSettings();
  const guestName = order.guestName || order.customerName || 'Guest';
  const identifierPrimary = ticketHeaderLayout === 'guest' ? guestName : `ORDER #${order.orderNumber}`;

  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [bumping, setBumping] = useState(false);
  const [recipeProduct, setRecipeProduct] = useState<OrderItem | null>(null);
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const allItems = order.courses.flatMap((c) => c.items).filter((p) => !removedIds.has(p.id));
  const setRow = (id: string, s: RowState) => setRowStates((p) => ({ ...p, [id]: s }));
  const getRowState = (product: OrderItem): RowState =>
    product.isCompleted ? 'done' : (rowStates[product.id] ?? 'idle');

  const notifySeen = () => { if (!isSeen) onMarkSeen?.(order.id); };
  const toggleRow = (id: string) => {
    setRow(id, 'loading');
    const t = window.setTimeout(() => {
      setRow(id, 'done');
      onItemDone?.(order.id, id);
    }, 500);
    timersRef.current.push(t);
  };

  const allDone = allItems.length > 0 && allItems.every((p) => getRowState(p) === 'done');
  const anyStarted = allItems.some((p) => getRowState(p) !== 'idle');
  const [phaseOverride, setPhaseOverride] = useState<TicketState | null>(null);
  const ticketState: TicketState = useMemo(() => {
    if (phaseOverride) return phaseOverride;
    if (allDone) return 'done';
    if (isSeen || anyStarted) return 'preparing';
    return 'seen';
  }, [phaseOverride, allDone, isSeen, anyStarted]);

  const runBumpAnimation = (onComplete?: () => void) => {
    setRowStates((prev) => {
      const next = { ...prev };
      allItems.forEach((p) => { if (next[p.id] !== 'done') next[p.id] = 'loading'; });
      return next;
    });
    allItems.forEach((p, idx) => {
      const t = window.setTimeout(() => setRow(p.id, 'done'), 200 + idx * 100);
      timersRef.current.push(t);
    });
    const total = 200 + allItems.length * 100 + 300;
    const finish = window.setTimeout(() => { onComplete?.(); }, total);
    timersRef.current.push(finish);
  };

  const handleTicketAdvance = () => {
    if (bumping) return;
    if (ticketState === 'seen') { notifySeen(); setPhaseOverride('preparing'); return; }
    if (ticketState === 'preparing') {
      notifySeen();
      setBumping(true);
      runBumpAnimation(() => { setBumping(false); setPhaseOverride('done'); });
      return;
    }
    onBump?.(order.id);
  };

  const handleTicketRecall = () => {
    if (ticketState === 'done') { setRowStates({}); setPhaseOverride('preparing'); return; }
    if (ticketState === 'preparing') { setRowStates({}); setPhaseOverride('seen'); }
  };

  const allAllergens = order.courses.flatMap((c) => c.items.flatMap((i) => i.allergens));
  const uniqueAllergens = Array.from(new Map(allAllergens.map((a) => [a.type, a])).values());

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border shadow-sm flex flex-col">
      {/* Dark navy header */}
      <div className="bg-[#1A1A2E] text-white px-3 py-2 flex justify-between items-center">
        <div className="text-[13px] font-bold tracking-wide truncate">{identifierPrimary}</div>
        <div className="text-[13px] font-mono-timer">{fmtElapsed(elapsed)}</div>
      </div>

      {/* Meta row */}
      <div className="px-3 py-1.5 flex justify-between items-center text-[11px] border-b border-border">
        <span className="truncate">
          <span className="font-bold">{order.orderNumber}</span>{' '}
          <span className="text-text-secondary">{guestName}</span>
        </span>
        <span className="text-text-secondary shrink-0 ml-2">
          {order.serverName ? `${order.serverName} · ` : ''}{formatTime(order.timeReceived)}
        </span>
      </div>

      {/* Allergen strip */}
      {uniqueAllergens.length > 0 && (
        <div className="px-3 py-1 text-[10px] font-bold text-[#C0392B] border-b border-border uppercase tracking-wide">
          ALLERGENS: {uniqueAllergens.map((a) => a.type).join(', ')}
        </div>
      )}

      {order.orderNotes && <OrderNotesSection notes={order.orderNotes} orderId={order.id} />}

      {/* Courses */}
      <div className="flex-1 px-3 py-2 space-y-2">
        {order.courses.map((course, idx) => {
          const items = sortDoneLast(
            course.items.filter((p) => !removedIds.has(p.id)),
            (p) => getRowState(p) === 'done',
          );
          if (items.length === 0) return null;
          return (
            <div key={`${course.course}-${idx}`}>
              <div className="text-[10px] font-bold text-text-secondary tracking-wide mb-1">
                {courseLabel(course.course)}
              </div>
              <div className="space-y-0.5">
                {items.map((product) => (
                  <CalmProductRow
                    key={product.id}
                    product={product}
                    state={getRowState(product)}
                    onToggle={() => toggleRow(product.id)}
                    onLongPress={setRecipeProduct}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer action button — reuses shared 3-state control */}
      <OrderCardActions
        orderId={order.id}
        ticketState={ticketState}
        onTicketAdvance={handleTicketAdvance}
        onTicketRecall={handleTicketRecall}
      />

      <RecipeModalV1 product={recipeProduct} onClose={() => setRecipeProduct(null)} />
    </div>
  );
}

function CalmProductRow({
  product,
  state,
  onToggle,
  onLongPress,
}: {
  product: OrderItem;
  state: RowState;
  onToggle: () => void;
  onLongPress: (p: OrderItem) => void;
}) {
  const longPress = useLongPress({ onLongPress: () => onLongPress(product), threshold: 450 });
  const done = state === 'done';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      {...longPress}
      className={`flex items-center justify-between gap-2 py-1 rounded cursor-pointer select-none ${
        done ? 'opacity-60' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className={`text-[13px] font-semibold leading-tight truncate ${done ? 'line-through' : ''}`}>
          {product.quantity > 1 ? `${product.quantity}× ` : ''}{product.name}
        </div>
        {product.modifiers && product.modifiers.length > 0 && (
          <div className="text-[10px] text-text-secondary truncate">
            {product.modifiers.map((m) => m.name).join(', ')}
          </div>
        )}
      </div>
      <div className="shrink-0 w-4 h-4 flex items-center justify-center">
        {state === 'loading' ? (
          <Loader2 size={12} className="animate-spin text-text-secondary" />
        ) : done ? (
          <Check size={14} className="text-[#16A085]" />
        ) : null}
      </div>
    </div>
  );
}

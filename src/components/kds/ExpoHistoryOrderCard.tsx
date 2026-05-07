import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import type { Order, OrderItem } from '@/types/kds';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';
import { AllergenBadge } from './AllergenBadge';
import { OrderNotesSection } from './OrderNotesSection';

const orderTypeLabel: Record<string, string> = {
  'dine-in': 'DINE IN',
  'take-out': 'TAKE OUT',
  delivery: 'DELIVERY',
  banquet: 'BANQUET',
  'drive-thru': 'DRIVE THRU',
  'curb-side': 'CURB SIDE',
  scheduled: 'SCHEDULED',
  'phone-in': 'PHONE-IN',
  custom: 'CUSTOM',
};

const NEUTRAL_DARK = '#3a3a4a';

interface ExpoHistoryOrderCardProps {
  order: Order;
  /** Recall as remake: items go back as Queued, also reappear on standard KDS */
  onRecallRemake?: (orderId: string) => void;
  /** Recall as mistake: items go back as Ready (already cooked, expediter forgot to send) */
  onRecallMistake?: (orderId: string) => void;
  /** Item-level recall: same two modes */
  onRecallItemRemake?: (orderId: string, item: OrderItem) => void;
  onRecallItemMistake?: (orderId: string, item: OrderItem) => void;
}

interface ExpoHistoryItemRowProps {
  item: OrderItem;
  orderId: string;
  isLast: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onRecallMistake?: () => void;
  onRecallRemake?: () => void;
  tp: (s: string) => string;
  tn: (s: string) => string;
}

function ExpoHistoryItemRow({
  item,
  isLast,
  expanded,
  onToggleExpand,
  onRecallMistake,
  onRecallRemake,
  tp,
  tn,
}: ExpoHistoryItemRowProps) {
  // Hide neutral cooking instructions; keep only removals/adds
  const visibleMods = item.modifiers.filter((m) => {
    const t = m.text.trim();
    if (m.type === 'remove' || /^(no |without |sub |replace )/i.test(t)) return true;
    if (m.type === 'extra' || t.startsWith('+') || /^extra /i.test(t)) return true;
    return false;
  });

  return (
    <div
      className={`-mx-1 px-1 select-none ${isLast ? '' : 'border-b border-border/50'}`}
      style={{ paddingTop: '4px', paddingBottom: '4px' }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        className="flex items-start cursor-pointer hover:bg-muted/30 active:bg-muted/40 transition-colors rounded"
        style={{ gap: '4px' }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-nowrap min-w-0" style={{ gap: '4px', lineHeight: 1.1 }}>
            <span
              className="font-normal shrink-0 line-through"
              style={{
                fontSize: 'var(--kds-item-qty)',
                color: 'hsl(var(--text-secondary))',
                lineHeight: 1.1,
                width: '2.25ch',
                textAlign: 'right',
                display: 'inline-block',
              }}
            >
              {item.quantity}x
            </span>
            <span
              className="font-bold uppercase text-text-muted line-through min-w-0 flex-1 break-words"
              style={{ fontSize: 'var(--kds-item-name)', lineHeight: 1.1, wordBreak: 'break-word' }}
            >
              {tp(item.name)}
            </span>
          </div>
          {item.allergens.length > 0 && (
            <div className="flex items-start" style={{ gap: '4px', marginTop: '2px', paddingLeft: 'calc(2.25ch + 4px)', lineHeight: 1 }}>
              <div className="flex flex-wrap items-start" style={{ gap: '4px', rowGap: '2px', lineHeight: 1 }}>
                {item.allergens.map((a) => (
                  <AllergenBadge key={a.type} allergen={a} variant="item" />
                ))}
              </div>
            </div>
          )}
          {visibleMods.length > 0 && (
            <div style={{ marginTop: '1px', display: 'flex', flexDirection: 'column', gap: '0px', paddingLeft: 'calc(2.25ch + 4px)' }}>
              {visibleMods
                .sort((a, b) => (a.type === 'remove' ? -1 : 1) - (b.type === 'remove' ? -1 : 1))
                .map((m, idx) => {
                  const isRemove = m.type === 'remove' || /^(no |without |sub |replace )/i.test(m.text.trim());
                  const colorClass = isRemove ? 'text-modifier-remove' : 'text-modifier-extra';
                  const display = isRemove
                    ? m.text
                    : m.text.startsWith('+')
                      ? m.text
                      : `+ ${m.text}`;
                  return (
                    <span
                      key={idx}
                      className={`font-semibold ${colorClass} line-through`}
                      style={{ fontSize: 'var(--kds-modifier)', lineHeight: 1, opacity: 0.9 }}
                    >
                      {display}
                    </span>
                  );
                })}
            </div>
          )}
          {item.notes && (
            <div className="italic text-text-muted line-through" style={{ fontSize: 'var(--kds-modifier)', paddingLeft: 'calc(2.25ch + 4px)', marginTop: '1px' }}>
              "{tn(item.notes)}"
            </div>
          )}
        </div>
      </div>
      {expanded && (
        <div className="flex gap-1.5 mt-1.5 pl-[calc(2.25ch+4px)]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRecallMistake?.();
            }}
            className="flex-1 py-1 px-2 border border-warning text-warning text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1 hover:bg-warning/10 transition-colors"
          >
            <RotateCcw size={10} /> Recall, mistake
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRecallRemake?.();
            }}
            className="flex-1 py-1 px-2 border border-destructive text-destructive text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1 hover:bg-destructive/10 transition-colors"
          >
            <RotateCcw size={10} /> Recall, remake
          </button>
        </div>
      )}
    </div>
  );
}

export function ExpoHistoryOrderCard({
  order,
  onRecallRemake,
  onRecallMistake,
  onRecallItemRemake,
  onRecallItemMistake,
}: ExpoHistoryOrderCardProps) {
  const { tp, tn, tl, timeFormat } = useLanguage();
  const { orderTypeColors } = useKDSSettings();
  const headerBg = orderTypeColors[order.orderType] || DEFAULT_ORDER_TYPE_COLORS[order.orderType];
  const allItems = order.courses.flatMap((c) => c.items);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const ticketAllergens = useMemo(() => {
    const all = allItems.flatMap((i) => i.allergens);
    return Array.from(new Map(all.map((a) => [a.type, a])).values());
  }, [allItems]);

  // "Sent time" = when the ticket was sent out (timeReceived + elapsedSeconds)
  const sentDate = new Date(order.timeReceived.getTime() + order.elapsedSeconds * 1000);
  const sentLabel = `${tl('Sent')} ${formatTimeForKDS(sentDate, timeFormat)}`;
  const typeLabel = orderTypeLabel[order.orderType] || order.orderType.toUpperCase();
  const typeText = order.tableName ? `${typeLabel} · ${order.tableName}` : typeLabel;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg overflow-hidden bg-surface-card shadow-sm transition-all"
      style={{ minWidth: 'min(220px, 100%)' }}
    >
      {/* Row 1: Order type strip */}
      <div
        className="flex items-center px-2"
        style={{ backgroundColor: headerBg, height: '28px' }}
      >
        <span className="text-[11px] font-medium uppercase tracking-wide text-white leading-none truncate">
          {typeText}
        </span>
      </div>

      {/* Row 2: Ticket info row (neutral dark) */}
      <div
        className="flex items-center justify-between px-2"
        style={{ backgroundColor: NEUTRAL_DARK, height: '36px' }}
      >
        <span
          className="text-[18px] font-extrabold text-white leading-none tabular-nums"
          style={{ letterSpacing: '0.01em' }}
        >
          #{order.orderNumber}
        </span>
        <span className="text-[12px] font-medium text-white/90 leading-none tabular-nums">
          {sentLabel}
        </span>
      </div>

      {/* Allergens (only if present) */}
      {ticketAllergens.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-1 border-b border-border/40"
          style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px' }}
        >
          {ticketAllergens.map((a) => (
            <AllergenBadge key={a.type} allergen={a} variant="order" />
          ))}
        </div>
      )}

      {/* Order notes (only if present) */}
      {order.orderNotes && (
        <OrderNotesSection notes={order.orderNotes} orderId={order.id} />
      )}

      {/* Flat items list (no course headers, no station/status icons) */}
      <div className="border-t border-border px-1" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
        {allItems.map((item, idx) => (
          <ExpoHistoryItemRow
            key={item.id}
            item={item}
            orderId={order.id}
            isLast={idx === allItems.length - 1}
            expanded={expandedItemId === item.id}
            onToggleExpand={() =>
              setExpandedItemId((prev) => (prev === item.id ? null : item.id))
            }
            onRecallMistake={() => onRecallItemMistake?.(order.id, item)}
            onRecallRemake={() => onRecallItemRemake?.(order.id, item)}
            tp={tp}
            tn={tn}
          />
        ))}
      </div>

      {/* Footer recall buttons (ticket-level) */}
      <div className="border-t border-border flex gap-1.5" style={{ padding: '8px' }}>
        <button
          type="button"
          onClick={() => onRecallMistake?.(order.id)}
          className="flex-1 py-2 border border-warning text-warning text-[11px] font-bold uppercase rounded flex items-center justify-center gap-1.5 hover:bg-warning/10 transition-colors min-h-[36px]"
        >
          <RotateCcw size={12} /> Recall, mistake
        </button>
        <button
          type="button"
          onClick={() => onRecallRemake?.(order.id)}
          className="flex-1 py-2 border border-destructive text-destructive text-[11px] font-bold uppercase rounded flex items-center justify-center gap-1.5 hover:bg-destructive/10 transition-colors min-h-[36px]"
        >
          <RotateCcw size={12} /> Recall, remake
        </button>
      </div>
    </motion.div>
  );
}

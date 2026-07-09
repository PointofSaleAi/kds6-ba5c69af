import { useState, useEffect, useLayoutEffect, useRef, useCallback, type ReactNode } from 'react';
import { Check, Loader2, FileText, Languages } from 'lucide-react';
import type { Order, OrderItem } from '@/types/kds';
import { useLongPress } from '@/hooks/use-long-press';
import { RecipeModalV1 } from './RecipeModalV1';
import { V2Header } from './headers/V2Header';

import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useLanguage } from '@/hooks/use-language';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
  onMarkSeen?: (orderId: string) => void;
  onItemDone?: (orderId: string, itemId: string) => void;
  onItemDismiss?: (orderId: string, item: OrderItem) => void;
  isSeen?: boolean;
}

type Translators = {
  tp: (s: string) => string;
  tpSecondary: (s: string) => string;
  tm: (s: string) => string;
  tmSecondary: (s: string) => string;
  tn: (s: string) => string;
  tnSecondary: (s: string) => string;
  ta: (s: string) => string;
  showSecondaryMenu: boolean;
  displayMode: string;
  secondaryDir: 'ltr' | 'rtl';
};

type RowState = 'idle' | 'loading' | 'done';


function modifierPrefix(type: 'extra' | 'remove' | 'neutral'): string {
  if (type === 'extra') return '+';
  if (type === 'remove') return '-';
  return '\u2022';
}

function ProductPill({
  product,
  state,
  onToggle,
  onReset,
  onRemove,
  onLongPress,
  tx,
}: {
  product: OrderItem;
  state: RowState;
  onToggle: () => void;
  onReset: () => void;
  onRemove: () => void;
  onLongPress: (p: OrderItem) => void;
  tx: Translators;
}) {
  const done = state === 'done';
  const loading = state === 'loading';
  const longPress = useLongPress(() => onLongPress(product), { delay: 500 });

  const handleClick = () => {
    if (loading) return;
    if (done) {
      onRemove();
      return;
    }
    onToggle();
  };

  const hasDetails =
    product.modifiers.length > 0 || product.allergens.length > 0 || !!product.notes;

  return (
    <div
      role="button"
      tabIndex={loading ? -1 : 0}
      onClick={handleClick}
      onDoubleClick={(e) => {
        if (done) {
          e.stopPropagation();
          onReset();
        }
      }}
      onKeyDown={(e) => {
        if (!loading && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      {...longPress}
      aria-pressed={done}
      aria-disabled={loading}
      className={`v5-pill relative rounded-xl select-none cursor-pointer transition-opacity bg-muted border border-border/60 shadow-sm ${
        loading ? 'opacity-70 pointer-events-none' : done ? 'opacity-60' : ''
      }`}
      style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 'var(--kds-row-py)', paddingBottom: 'var(--kds-row-py)' }}

    >
      <div className="flex items-center gap-2">
        {/* Quantity circle */}
        <span
          className="shrink-0 inline-flex items-center justify-center rounded-full bg-white text-gray-900"
          style={{
            width: 22,
            height: 22,
            fontSize: 'var(--kds-item-qty)',
            fontWeight: 700,
          }}
        >
          {product.quantity}
        </span>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div style={{ display: 'inline-block', maxWidth: '100%', minWidth: 0 }}>
            <div
              className="truncate text-foreground"
              style={{
                fontSize: 'var(--kds-item-name)',
                fontWeight: 700,
                textDecoration: done ? 'line-through' : 'none',
              }}
            >
              {tx.tp(product.name)}
            </div>
            {tx.displayMode === 'dual' && tx.showSecondaryMenu && (
              <div className="flex items-center gap-1" style={{ justifyContent: tx.secondaryDir === 'rtl' ? 'flex-end' : 'flex-start' }}>
                {tx.secondaryDir !== 'rtl' && <Languages size={10} className="text-muted-foreground shrink-0" />}
                <div
                  className="truncate text-muted-foreground"
                  dir={tx.secondaryDir}
                  style={{
                    fontSize: 'var(--kds-modifier)',
                    fontWeight: 500,
                    textAlign: tx.secondaryDir === 'rtl' ? 'right' : 'left',
                    textDecoration: done ? 'line-through' : 'none',
                  }}
                >
                  {tx.tpSecondary(product.name)}
                </div>
                {tx.secondaryDir === 'rtl' && <Languages size={10} className="text-muted-foreground shrink-0" />}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        {loading && (
          <Loader2 size={14} className="animate-spin shrink-0 text-muted-foreground" />
        )}
        {done && (
          <span
            className="shrink-0 inline-flex items-center justify-center rounded-full animate-scale-in bg-success"
            style={{ width: 18, height: 18 }}
            aria-label="Product done"
          >
            <Check size={12} color="#fff" strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Modifier / allergen / notes tree */}
      {hasDetails && (
        <div className="mt-1.5 pl-2">
          {product.modifiers.map((m, i) => {
            const raw = m.type === 'extra' ? m.text.replace(/^\+\s*/, '') : m.text;
            return (
              <ModifierRow
                key={`m-${i}`}
                prefix={modifierPrefix(m.type)}
                text={tx.tm(raw)}
                secondaryText={
                  tx.displayMode === 'dual' && tx.showSecondaryMenu ? tx.tmSecondary(raw) : undefined
                }
                secondaryDir={tx.secondaryDir}
                done={done}
              />
            );
          })}
          {product.allergens.length > 0 && (
            <ModifierRow
              prefix="!"
              text={product.allergens.map((a) => tx.ta(a.label)).join(', ')}
              done={done}
              tone="allergen"
            />
          )}
          {product.notes && (
            <ModifierRow
              prefix={"\u2022"}
              text={`"${tx.tn(product.notes)}"`}
              secondaryText={
                tx.displayMode === 'dual' && tx.showSecondaryMenu
                  ? `"${tx.tnSecondary(product.notes)}"`
                  : undefined
              }
              secondaryDir={tx.secondaryDir}
              done={done}
              italic
            />
          )}
        </div>
      )}
    </div>
  );
}

function ModifierRow({
  prefix,
  text,
  secondaryText,
  secondaryDir,
  done,
  italic,
  tone,
}: {
  prefix: string;
  text: string;
  secondaryText?: string;
  secondaryDir?: 'ltr' | 'rtl';
  done: boolean;
  italic?: boolean;
  tone?: 'allergen';
}) {
  const colorClass = tone === 'allergen' ? 'text-red-400' : 'text-muted-foreground';
  return (
    <div className="flex items-center gap-1.5" style={{ lineHeight: 1.25 }}>
      <span
        aria-hidden
        className="shrink-0 select-none text-muted-foreground"
        style={{ fontFamily: 'monospace', fontSize: 'var(--kds-modifier)' }}
      >
        {'\u2514\u2500'}
      </span>
      <span
        className={`shrink-0 ${colorClass}`}
        style={{
          fontSize: 'var(--kds-modifier)',
          width: 10,
          textAlign: 'center',
          lineHeight: 1.25,
          fontWeight: tone === 'allergen' ? 700 : 500,
        }}
      >
        {prefix}
      </span>
      <div className="flex-1 min-w-0">
        <div style={{ display: 'inline-block', maxWidth: '100%', minWidth: 0 }}>
          <div
            className={`break-words ${colorClass}`}
            style={{
              fontSize: 'var(--kds-modifier)',
              fontWeight: 500,
              fontStyle: italic ? 'italic' : 'normal',
              textDecoration: done ? 'line-through' : 'none',
            }}
          >
            {text}
          </div>
          {secondaryText && (
            <div
              className="flex items-center gap-1"
              style={{ justifyContent: secondaryDir === 'rtl' ? 'flex-end' : 'flex-start' }}
            >
              {secondaryDir !== 'rtl' && (
                <Languages size={10} className="text-muted-foreground shrink-0" />
              )}
              <div
                className="break-words text-muted-foreground"
                dir={secondaryDir}
                style={{
                  fontSize: 'var(--kds-modifier)',
                  fontStyle: italic ? 'italic' : 'normal',
                  textDecoration: done ? 'line-through' : 'none',
                  textAlign: secondaryDir === 'rtl' ? 'right' : 'left',
                  minWidth: 0,
                }}
              >
                {secondaryText}
              </div>
              {secondaryDir === 'rtl' && (
                <Languages size={10} className="text-muted-foreground shrink-0" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Renders a primary text block at its natural (wrapping) width and, if a
 * secondary block is provided, sizes the secondary container to the widest
 * rendered line of the primary. The primary itself is never width-constrained,
 * so it wraps naturally; only the secondary aligns to the primary's true edge.
 */
function TightWidthBox({
  primary,
  secondary,
  deps = [],
  className,
  style,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  deps?: unknown[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const primaryRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const el = primaryRef.current;
    if (!el) return;
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = range.getClientRects();
      let max = 0;
      for (let i = 0; i < rects.length; i++) {
        if (rects[i].width > max) max = rects[i].width;
      }
      range.detach?.();
      if (max > 0) setWidth(Math.ceil(max));
    } catch {
      /* noop */
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && wrapperRef.current?.parentElement) {
      ro = new ResizeObserver(() => measure());
      ro.observe(wrapperRef.current.parentElement);
    }
    const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
    fonts?.ready?.then(() => measure());
    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps]);

  return (
    <div ref={wrapperRef} className={className} style={{ minWidth: 0, ...style }}>
      <div ref={primaryRef} style={{ width, maxWidth: '100%' }}>{primary}</div>
      {secondary && (
        <div style={{ width, maxWidth: '100%' }}>{secondary}</div>
      )}
    </div>
  );
}

export function OrderCardV5({ order, onBump, onMarkSeen, onItemDone, onItemDismiss, isSeen }: Props) {
  const { ticketLayout, showAllergens, showHeaderAllergens } = useKDSSettings();
  const { tp, tpSecondary, tm, tmSecondary, tn, tnSecondary, ta, showSecondaryMenu, displayMode, secondaryLang } = useLanguage();
  const tx: Translators = {
    tp, tpSecondary, tm, tmSecondary, tn, tnSecondary, ta,
    showSecondaryMenu, displayMode,
    secondaryDir: secondaryLang === 'ar' ? 'rtl' : 'ltr',
  };
  const isHeaderOnly = ticketLayout === 'header';

  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [bumping, setBumping] = useState(false);
  const [recipeProduct, setRecipeProduct] = useState<OrderItem | null>(null);
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const notifySeen = () => { if (!isSeen) onMarkSeen?.(order.id); };
  const setRow = (id: string, s: RowState) =>
    setRowStates((p) => ({ ...p, [id]: s }));
  const getRowState = (product: OrderItem): RowState => product.isCompleted ? 'done' : (rowStates[product.id] ?? 'idle');

  const toggleRow = (id: string) => {
    setRow(id, 'loading');
    const t = window.setTimeout(() => {
      setRow(id, 'done');
      onItemDone?.(order.id, id);
      setRowStates((current) => {
        const allTouched = allItems.every(p => p.isCompleted || (current[p.id] ?? 'idle') !== 'idle');
        if (allTouched && !isSeen) onMarkSeen?.(order.id);
        return current;
      });
    }, 600);
    timersRef.current.push(t);
  };
  const removeRow = (id: string) => {
    if (order.status === 'served') return;
    const item = order.courses.flatMap((c) => c.items).find((i) => i.id === id);
    if (item && onItemDismiss) onItemDismiss(order.id, item);
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const allItems = order.courses.flatMap((c) => c.items).filter((p) => !removedIds.has(p.id));

  const handleBump = () => {
    if (bumping) return;
    notifySeen();
    setBumping(true);
    setRowStates((prev) => {
      const next = { ...prev };
      allItems.forEach((p) => {
        if (next[p.id] !== 'done') next[p.id] = 'loading';
      });
      return next;
    });
    allItems.forEach((p, idx) => {
      const t = window.setTimeout(() => setRow(p.id, 'done'), 250 + idx * 120);
      timersRef.current.push(t);
    });
    const total = 250 + allItems.length * 120 + 350;
    const finish = window.setTimeout(() => onBump?.(order.id), total);
    timersRef.current.push(finish);
  };

  return (
    <div className="v5-card bg-card rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* HEADER: reuse V2 header */}
      <div onClick={handleBump} role="button" className="cursor-pointer">
        <V2Header order={order} />
      </div>

      {!isHeaderOnly && showAllergens && showHeaderAllergens && (() => {
        const allAllergens = order.courses.flatMap((c) => c.items.flatMap((i) => i.allergens));
        const unique = Array.from(new Map(allAllergens.map((a) => [a.type, a])).values());
        if (unique.length === 0) return null;
        return (
          <div className="px-2 pt-1 flex items-center gap-1.5">
            <span
              className="shrink-0 text-red-400"
              style={{ fontSize: 'var(--kds-modifier)', fontWeight: 700, width: 10, textAlign: 'center', lineHeight: 1.25 }}
            >
              !
            </span>
            <span
              className="text-red-400 break-words"
              style={{ fontSize: 'var(--kds-modifier)', fontWeight: 700, lineHeight: 1.25 }}
            >
              {unique.map((a) => ta(a.label)).join(', ')}
            </span>
          </div>
        );
      })()}

      {/* Order notes strip */}
      {order.orderNotes && (
        <div className="px-2 pt-2">
          <div className="v5-pill rounded-xl px-2.5 py-2 flex items-start gap-2 bg-muted border border-border/60">
            <FileText size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <TightWidthBox
                deps={[order.orderNotes, displayMode, showSecondaryMenu, tx.secondaryDir, tn, tnSecondary]}
                primary={
                  <div className="text-foreground break-words" style={{ fontSize: 'var(--kds-item-name)', fontWeight: 500 }}>
                    {tn(order.orderNotes)}
                  </div>
                }
                secondary={
                  displayMode === 'dual' && showSecondaryMenu ? (
                    <div
                      className="flex items-start gap-1 mt-0.5"
                      style={{
                        flexDirection: tx.secondaryDir === 'rtl' ? 'row-reverse' : 'row',
                        justifyContent: 'flex-start',
                      }}
                    >
                      <Languages size={10} className="mt-0.5 shrink-0 text-muted-foreground" />
                      <div
                        className="break-words text-muted-foreground"
                        dir={tx.secondaryDir}
                        style={{
                          fontSize: 'var(--kds-modifier)',
                          fontWeight: 500,
                          textAlign: tx.secondaryDir === 'rtl' ? 'right' : 'left',
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {tnSecondary(order.orderNotes)}
                      </div>
                    </div>
                  ) : undefined
                }
              />

            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {!isHeaderOnly && (
        <div className="flex flex-col" style={{ padding: 'var(--kds-card-padding)', gap: 'var(--kds-item-gap)' }}>
          {allItems.map((product) => (
            <ProductPill
              key={product.id}
              product={product}
              state={getRowState(product)}
              onToggle={() => toggleRow(product.id)}
              onReset={() => setRow(product.id, 'idle')}
              onRemove={() => removeRow(product.id)}
              onLongPress={setRecipeProduct}
              tx={tx}
            />
          ))}
        </div>
      )}

      <RecipeModalV1 product={recipeProduct} onClose={() => setRecipeProduct(null)} />
    </div>
  );
}

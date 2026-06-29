import { useState, useEffect, useRef } from 'react';
import { Check, Loader2, FileText } from 'lucide-react';
import type { Order, OrderItem } from '@/types/kds';
import { useLongPress } from '@/hooks/use-long-press';
import { RecipeModalV1 } from './RecipeModalV1';
import { V2Header } from './headers/V2Header';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useLanguage } from '@/hooks/use-language';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
}

type Translators = {
  tp: (s: string) => string;
  tpSecondary: (s: string) => string;
  tm: (s: string) => string;
  tmSecondary: (s: string) => string;
  tn: (s: string) => string;
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
  onLongPress,
  tx,
}: {
  product: OrderItem;
  state: RowState;
  onToggle: () => void;
  onReset: () => void;
  onLongPress: (p: OrderItem) => void;
  tx: Translators;
}) {
  const done = state === 'done';
  const loading = state === 'loading';
  const longPress = useLongPress(() => onLongPress(product), { delay: 500 });

  const handleClick = () => {
    if (loading) return;
    if (done) return;
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
      className={`relative rounded-xl px-2.5 py-2 select-none cursor-pointer transition-opacity ${
        loading ? 'opacity-70 pointer-events-none' : done ? 'opacity-60' : ''
      }`}
      style={{
        background:
          'linear-gradient(180deg, rgba(60,64,73,0.95) 0%, rgba(40,43,50,0.95) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center gap-2">
        {/* Quantity circle */}
        <span
          className="shrink-0 inline-flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            background: '#FFFFFF',
            color: '#1A1A2E',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {product.quantity}
        </span>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div
            className="truncate text-white"
            style={{
              fontSize: 13,
              fontWeight: 700,
              textDecoration: done ? 'line-through' : 'none',
            }}
          >
            {tx.tp(product.name)}
          </div>
          {tx.displayMode === 'dual' && tx.showSecondaryMenu && (
            <div
              className="truncate"
              dir={tx.secondaryDir}
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#9CA3AF',
                textDecoration: done ? 'line-through' : 'none',
              }}
            >
              {tx.tpSecondary(product.name)}
            </div>
          )}
        </div>

        {/* Status */}
        {loading && (
          <Loader2 size={14} className="animate-spin shrink-0" color="#9CA3AF" />
        )}
        {done && (
          <span
            className="shrink-0 inline-flex items-center justify-center rounded-full animate-scale-in"
            style={{ background: '#27AE60', width: 18, height: 18 }}
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
            <ModifierRow prefix="\u2022" text={`"${tx.tn(product.notes)}"`} done={done} italic />
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
  const color = tone === 'allergen' ? '#FCA5A5' : '#D1D5DB';
  return (
    <div className="flex items-start gap-1.5" style={{ lineHeight: 1.25 }}>
      <span
        aria-hidden
        className="shrink-0 select-none"
        style={{ color: '#6B7280', fontFamily: 'monospace', fontSize: 11, marginTop: 1 }}
      >
        {'\u2514\u2500'}
      </span>
      <span
        className="shrink-0"
        style={{ color, fontSize: 11, width: 10, textAlign: 'center' }}
      >
        {prefix}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{
            color,
            fontSize: 11,
            fontStyle: italic ? 'italic' : 'normal',
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {text}
        </div>
        {secondaryText && secondaryText !== text && (
          <div
            className="truncate"
            dir={secondaryDir}
            style={{
              color: '#9CA3AF',
              fontSize: 10,
              fontStyle: italic ? 'italic' : 'normal',
              textDecoration: done ? 'line-through' : 'none',
            }}
          >
            {secondaryText}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrderCardV5({ order, onBump }: Props) {
  const { ticketLayout } = useKDSSettings();
  const { tp, tpSecondary, tm, tmSecondary, tn, ta, showSecondaryMenu, displayMode, secondaryLang } = useLanguage();
  const tx: Translators = {
    tp, tpSecondary, tm, tmSecondary, tn, ta,
    showSecondaryMenu, displayMode,
    secondaryDir: secondaryLang === 'ar' ? 'rtl' : 'ltr',
  };
  const isHeaderOnly = ticketLayout === 'header';

  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [bumping, setBumping] = useState(false);
  const [recipeProduct, setRecipeProduct] = useState<OrderItem | null>(null);
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const setRow = (id: string, s: RowState) =>
    setRowStates((p) => ({ ...p, [id]: s }));

  const toggleRow = (id: string) => {
    setRow(id, 'loading');
    const t = window.setTimeout(() => setRow(id, 'done'), 600);
    timersRef.current.push(t);
  };

  const allItems = order.courses.flatMap((c) => c.items);

  const handleBump = () => {
    if (bumping) return;
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
    <div
      className="rounded-md overflow-hidden border border-border shadow-sm flex flex-col"
      style={{ background: '#1F2128' }}
    >
      {/* HEADER: reuse V2 header */}
      <div onClick={handleBump} role="button" className="cursor-pointer">
        <V2Header order={order} />
      </div>

      {/* Order notes strip */}
      {order.orderNotes && (
        <div className="px-2 pt-2">
          <div
            className="rounded-xl px-2.5 py-2 flex items-center gap-2"
            style={{
              background:
                'linear-gradient(180deg, rgba(60,64,73,0.95) 0%, rgba(40,43,50,0.95) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <FileText size={14} color="#D1D5DB" className="shrink-0" />
            <span className="text-white break-words" style={{ fontSize: 12, fontWeight: 500 }}>
              {tn(order.orderNotes)}
            </span>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {!isHeaderOnly && (
        <div className="p-2 space-y-1.5">
          {allItems.map((product) => (
            <ProductPill
              key={product.id}
              product={product}
              state={rowStates[product.id] ?? 'idle'}
              onToggle={() => toggleRow(product.id)}
              onReset={() => setRow(product.id, 'idle')}
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

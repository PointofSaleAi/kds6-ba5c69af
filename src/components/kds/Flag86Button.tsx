import { useState, useMemo, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Minus, Plus, Bell } from 'lucide-react';

import { useOrderStore } from '@/hooks/use-order-store';

interface QuantityAdjusterProps {
  value: number;
  onChange: (n: number) => void;
}

function QuantityAdjuster({ value, onChange }: QuantityAdjusterProps) {
  const dec = (e: React.MouseEvent) => { e.stopPropagation(); onChange(Math.max(0, value - 1)); };
  const inc = (e: React.MouseEvent) => { e.stopPropagation(); onChange(value + 1); };
  const btn: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#252838', border: '1px solid #374151',
    color: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  };
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, padding: '10px 12px', marginTop: 10, marginBottom: 10,
        backgroundColor: '#171923', border: '1px solid #2A2F3F', borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', color: '#9CA3AF', textTransform: 'uppercase' }}>
          Available quantity
        </span>
        <span style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>
          {value === 0 ? 'None left, 86 immediately' : `${value} left before 86`}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" onClick={dec} style={btn} aria-label="Decrease quantity">
          <Minus size={16} />
        </button>
        <span style={{ minWidth: 24, textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
          {value}
        </span>
        <button type="button" onClick={inc} style={btn} aria-label="Increase quantity">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
import { useFlag86 } from '@/hooks/use-flag86';

export type Flag86Scope = 'item' | 'course' | 'ticket';

interface Flag86ModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** Optional list of item names rendered as a small list (used for ticket scope). */
  itemNames?: string[];
  /** When provided, renders the "N pending orders" line (item scope only). */
  pendingCount?: number;
  /** Subtext under the title. */
  subtext: string;
  primaryLabel: string;
  /** Show a quantity adjuster; controls placement relative to the modal content. */
  showQuantityAdjuster?: 'below-title' | 'below-subtext';
}

export function Flag86Modal({
  open,
  onClose,
  onConfirm,
  title,
  itemNames,
  pendingCount,
  subtext,
  primaryLabel,
  showQuantityAdjuster,
}: Flag86ModalProps) {
  const [qty, setQty] = useState(0);
  useEffect(() => { if (open) setQty(0); }, [open]);
  if (!open) return null;
  return createPortal(
    <div
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          backgroundColor: '#1E2130',
          border: '1px solid #374151',
          borderRadius: 14,
          padding: '22px 20px 18px',
          width: '100%',
          maxWidth: 380,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        {primaryLabel === 'Request 86' && (
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', color: '#F59E0B', textTransform: 'uppercase', marginBottom: 6 }}>
            Mark as 86 (unavailable)
          </div>
        )}
        <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, marginBottom: 6 }}>
          {title}
        </div>

        {showQuantityAdjuster === 'below-title' && (
          <QuantityAdjuster value={qty} onChange={setQty} />
        )}

        {typeof pendingCount === 'number' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#F59E0B',
              marginBottom: 6,
            }}
          >
            <Clock size={14} color="#F59E0B" />
            <span>{pendingCount === 0 ? 'No other pending orders' : `${pendingCount} pending orders`}</span>
          </div>
        )}

        {itemNames && itemNames.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '8px 0 12px',
              maxHeight: 140,
              overflowY: 'auto',
              borderTop: '1px solid #2A2F3F',
              borderBottom: '1px solid #2A2F3F',
            }}
          >
            {itemNames.map((n, i) => (
              <li
                key={`${n}-${i}`}
                style={{
                  fontSize: 12,
                  color: '#D1D5DB',
                  padding: '4px 0',
                  borderBottom: i === itemNames.length - 1 ? 'none' : '1px solid #232838',
                }}
              >
                {n}
              </li>
            ))}
          </ul>
        )}

        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4, marginBottom: showQuantityAdjuster === 'below-subtext' ? 0 : 20 }}>
          {subtext}
        </div>

        {showQuantityAdjuster === 'below-subtext' && (
          <QuantityAdjuster value={qty} onChange={setQty} />
        )}

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{
              flex: 1,
              backgroundColor: '#252838',
              border: '1px solid #374151',
              borderRadius: 8,
              padding: 13,
              fontSize: 13,
              fontWeight: 600,
              color: '#9CA3AF',
              cursor: 'pointer',
            }}
          >
            Not now
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onConfirm(); }}
            style={{
              flex: 2,
              backgroundColor: '#1A1A2E',
              border: 'none',
              borderRadius: 8,
              padding: 13,
              fontSize: 13,
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────
 * Item86Modal — unified item-level 86 popup
 * Used everywhere an item-level 86 action is triggered
 * (AI-suggested badge tap, manual long-press on any item row).
 * ────────────────────────────────────────────────────────────*/

interface Item86ModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  productName: string;
  currentQuantity: number;
}

export function Item86Modal({ open, onClose, onConfirm, productName, currentQuantity }: Item86ModalProps) {
  const { orders } = useOrderStore();
  const [qty, setQty] = useState(currentQuantity);
  useEffect(() => { if (open) setQty(Math.max(1, currentQuantity || 1)); }, [open, currentQuantity]);

  const pendingCount = useMemo(() => {
    let count = 0;
    for (const o of orders) {
      if (o.status === 'served') continue;
      const hasItem = o.courses.some(c =>
        c.items.some(i => i.name === productName && !i.isCompleted && !i.isCancelled)
      );
      if (hasItem) count += 1;
    }
    return count;
  }, [orders, productName]);

  if (!open) return null;

  const dec = (e: React.MouseEvent) => { e.stopPropagation(); setQty(q => Math.max(0, q - 1)); };
  const inc = (e: React.MouseEvent) => { e.stopPropagation(); setQty(q => q + 1); };

  const stepBtn: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#252838', border: '1px solid #374151',
    color: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  };

  return createPortal(
    <div
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`86 ${productName}`}
        style={{
          backgroundColor: '#1E2130',
          border: '1px solid #374151',
          borderRadius: 14,
          padding: '20px 20px 18px',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header row: name + chip group */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, flex: '1 1 auto', minWidth: 0 }}>
            {productName}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
            {pendingCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                padding: '4px 9px', borderRadius: 999,
                fontSize: 11, fontWeight: 700,
              }}>
                <Clock size={12} />
                {pendingCount} pending
              </span>
            )}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              backgroundColor: 'rgba(148, 163, 184, 0.15)',
              color: '#94A3B8',
              padding: '4px 9px', borderRadius: 999,
              fontSize: 11, fontWeight: 600,
            }}>
              <Bell size={12} />
              FOH notified
            </span>
          </div>
        </div>

        {/* Quantity card */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '12px 14px', marginBottom: 16,
          backgroundColor: '#171728',
          border: '1px solid #EF9F27',
          borderRadius: 10,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', color: '#F3F4F6', textTransform: 'uppercase' }}>
            Quantity to 86
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button" onClick={dec} style={stepBtn} aria-label="Decrease quantity">
              <Minus size={16} />
            </button>
            <span style={{ minWidth: 28, textAlign: 'center', fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>
              {qty}
            </span>
            <button type="button" onClick={inc} style={stepBtn} aria-label="Increase quantity">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{
              flex: 1,
              backgroundColor: '#252838',
              border: '1px solid #374151',
              borderRadius: 8,
              padding: 13,
              fontSize: 13,
              fontWeight: 600,
              color: '#E5E7EB',
              cursor: 'pointer',
            }}
          >
            Not now
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onConfirm(qty); }}
            style={{
              flex: 1,
              backgroundColor: '#E84C3D',
              border: 'none',
              borderRadius: 8,
              padding: 13,
              fontSize: 13,
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            86 it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}



interface Flag86ButtonProps {
  itemId: string;
  productName: string;
}

export function Flag86Button({ itemId, productName }: Flag86ButtonProps) {
  const [open, setOpen] = useState(false);
  const { orders } = useOrderStore();
  const { clear, confirm, isConfirmed } = useFlag86();
  const confirmed = isConfirmed(itemId);

  const pendingCount = useMemo(() => {
    let count = 0;
    for (const o of orders) {
      if (o.status === 'served') continue;
      const hasItem = o.courses.some(c =>
        c.items.some(i => i.name === productName && !i.isCompleted && !i.isCancelled)
      );
      if (hasItem) count += 1;
    }
    return count;
  }, [orders, productName]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmed) return;
    setOpen(true);
  };

  const handleNotNow = () => {
    setOpen(false);
    clear(itemId);
  };

  const handle86 = () => {
    setOpen(false);
    confirm(itemId);
    // eslint-disable-next-line no-console
    console.log(`86 confirmed: ${productName}`);
  };

  if (confirmed) {
    return (
      <span
        aria-label={`${productName} 86'd`}
        className="shrink-0 inline-flex items-center justify-center"
        style={{
          backgroundColor: '#F1F5F9',
          border: '1px solid #E2E8F0',
          borderRadius: 10,
          padding: '2px 8px',
          marginLeft: 8,
          marginRight: 4,
          color: '#9CA3AF',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.3px',
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        86'd
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onDoubleClick={(e) => e.stopPropagation()}
        aria-label={`86 ${productName}`}
        className="shrink-0 inline-flex items-center justify-center animate-flag86-pulse"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: '#1A1A2E',
          border: '2px solid #1A1A2E',
          marginLeft: 8,
          marginRight: 4,
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.5px',
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        86

      </button>

      <Flag86Modal
        open={open}
        onClose={handleNotNow}
        onConfirm={handle86}
        title={productName}
        pendingCount={pendingCount}
        subtext="FOH notified. Manager will handle pending orders."
        primaryLabel="86 it"
        showQuantityAdjuster="below-subtext"
      />
    </>
  );
}

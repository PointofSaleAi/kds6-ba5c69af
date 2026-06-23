import { useState, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { useOrderStore } from '@/hooks/use-order-store';
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
}: Flag86ModalProps) {
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
        <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, marginBottom: 6 }}>
          {title}
        </div>

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

        <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4, marginBottom: 20 }}>
          {subtext}
        </div>

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
              backgroundColor: '#DC2626',
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
          backgroundColor: '#DC2626',
          border: '2px solid #EF4444',
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
      />
    </>
  );
}

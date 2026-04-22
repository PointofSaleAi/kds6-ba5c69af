import { useState } from 'react';

interface OrderNotesSectionProps {
  notes: string;
  orderId: string;
  onAcknowledgeNotes?: (orderId: string) => void;
}

export function OrderNotesSection({ notes, orderId, onAcknowledgeNotes }: OrderNotesSectionProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const toggle = () => {
    const next = !acknowledged;
    setAcknowledged(next);
    if (next) {
      onAcknowledgeNotes?.(orderId);
    }
  };

  const rowBg = acknowledged ? 'rgba(29, 158, 117, 0.10)' : undefined;

  return (
    <div className="border-t border-border">
      <div className="flex items-center justify-between bg-muted" style={{ padding: '4px 8px' }}>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-text-primary">
          Order Notes
        </span>
      </div>
      <div className="px-2 py-0.5" style={{ backgroundColor: rowBg }}>
        <div
          role="button"
          tabIndex={0}
          aria-label={acknowledged ? 'Mark notes as unseen' : 'Acknowledge notes'}
          title={acknowledged ? 'Tap to mark notes as unseen' : 'Tap to acknowledge notes'}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
          className="flex items-center border-b border-border/50 cursor-pointer active:bg-muted/50 transition-colors select-none"
          style={{ padding: '4px 0 4px 4px', gap: 0 }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-text-primary leading-snug" data-kds-order-notes>
              {notes}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

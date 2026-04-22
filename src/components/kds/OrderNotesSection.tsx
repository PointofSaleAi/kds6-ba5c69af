import { useState } from 'react';
import { StickyNote } from 'lucide-react';

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
    <div className="border-t border-border" style={{ backgroundColor: rowBg }}>
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
        className="flex items-start cursor-pointer active:bg-muted/50 transition-colors select-none"
        style={{ padding: '4px 8px', gap: '6px' }}
      >
        <StickyNote
          size={13}
          className="shrink-0 text-text-secondary"
          style={{ marginTop: '1px' }}
          aria-hidden="true"
        />
        <div
          className="flex-1 min-w-0 text-[13px] text-text-primary"
          style={{ lineHeight: 1.25 }}
        >
          {notes}
        </div>
      </div>
    </div>
  );
}

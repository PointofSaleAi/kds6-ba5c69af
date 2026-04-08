import { useState } from 'react';
import seenIcon from '@/assets/seen-icon.svg';

interface OrderNotesSectionProps {
  notes: string;
  orderId: string;
  onAcknowledgeNotes?: (orderId: string) => void;
}

export function OrderNotesSection({ notes, orderId, onAcknowledgeNotes }: OrderNotesSectionProps) {
  const [notesAcknowledged, setNotesAcknowledged] = useState(false);

  return (
    <div className="border-t border-border">
      <div className="flex items-center justify-between bg-muted" style={{ padding: '4px 8px' }}>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-text-primary">
          Order Notes
        </span>
      </div>
      <div className="flex items-start justify-between" style={{ padding: '4px', gap: 0 }}>
        <span className="text-[13px] text-text-primary leading-snug flex-1">
          {notes}
        </span>
        <button
          onClick={() => {
            setNotesAcknowledged(!notesAcknowledged);
            onAcknowledgeNotes?.(orderId);
          }}
          className="shrink-0 min-w-[44px] min-h-[33px] overflow-hidden rounded-[3px] flex items-center justify-center"
          title={notesAcknowledged ? 'Acknowledged' : 'Acknowledge notes'}
        >
          <img src={seenIcon} alt="Acknowledge" style={{ width: 40, height: 30 }} />
        </button>
      </div>
    </div>
  );
}

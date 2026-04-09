import { useState } from 'react';
import { KdsActionIcon } from './KdsActionIcon';

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
      <div className="px-2 py-0.5">
        <div className={`flex items-center border-b border-border/50 ${notesAcknowledged ? 'opacity-50' : ''}`} style={{ padding: '4px 0 4px 4px', gap: 0 }}>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-text-primary leading-snug">
              {notes}
            </div>
          </div>
          <div className="flex items-center shrink-0 ml-auto">
            <KdsActionIcon
              icon={notesAcknowledged ? 'acknowledged' : 'seen'}
              onClick={() => {
                setNotesAcknowledged(!notesAcknowledged);
                onAcknowledgeNotes?.(orderId);
              }}
              title={notesAcknowledged ? 'Acknowledged' : 'Acknowledge notes'}
              label={notesAcknowledged ? 'Acknowledged' : 'Acknowledge notes'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

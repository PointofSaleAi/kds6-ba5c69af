import { useState } from 'react';
import { KdsActionIcon, KdsIconType } from './KdsActionIcon';

type NoteState = 'unseen' | 'seen' | 'acknowledged';

const stateFlow: NoteState[] = ['unseen', 'seen', 'acknowledged'];
const stateToIcon: Record<NoteState, KdsIconType> = {
  unseen: 'seen',
  seen: 'preparing',
  acknowledged: 'acknowledged',
};
const stateToTitle: Record<NoteState, string> = {
  unseen: 'Acknowledge notes',
  seen: 'Confirm acknowledged',
  acknowledged: 'Acknowledged',
};

interface OrderNotesSectionProps {
  notes: string;
  orderId: string;
  onAcknowledgeNotes?: (orderId: string) => void;
}

export function OrderNotesSection({ notes, orderId, onAcknowledgeNotes }: OrderNotesSectionProps) {
  const [noteState, setNoteState] = useState<NoteState>('unseen');

  const advance = () => {
    const idx = stateFlow.indexOf(noteState);
    if (idx < stateFlow.length - 1) {
      const next = stateFlow[idx + 1];
      setNoteState(next);
      if (next === 'acknowledged') {
        onAcknowledgeNotes?.(orderId);
      }
    }
  };

  return (
    <div className="border-t border-border">
      <div className="flex items-center justify-between bg-muted" style={{ padding: '4px 8px' }}>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-text-primary">
          Order Notes
        </span>
      </div>
      <div className="px-2 py-0.5">
        <div className={`flex items-center border-b border-border/50 ${noteState === 'acknowledged' ? 'opacity-50' : ''}`} style={{ padding: '4px 0 4px 4px', gap: 0 }}>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-text-primary leading-snug">
              {notes}
            </div>
          </div>
          <div className="flex items-center shrink-0 ml-auto">
            <KdsActionIcon
              icon={stateToIcon[noteState]}
              onClick={advance}
              disabled={noteState === 'acknowledged'}
              title={stateToTitle[noteState]}
              label={stateToTitle[noteState]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

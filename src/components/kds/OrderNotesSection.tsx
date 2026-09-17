import { useState } from 'react';
import noteIcon from '@/assets/note-bold.svg';
import { useLanguage } from '@/hooks/use-language';

interface OrderNotesSectionProps {
  notes: string;
  orderId: string;
  onAcknowledgeNotes?: (orderId: string) => void;
  onUnacknowledgeNotes?: (orderId: string) => void;
}

export function OrderNotesSection({ notes, orderId, onAcknowledgeNotes, onUnacknowledgeNotes }: OrderNotesSectionProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const { tn, tui } = useLanguage();

  const toggle = () => {
    const next = !acknowledged;
    setAcknowledged(next);
    if (next) {
      onAcknowledgeNotes?.(orderId);
    } else {
      onUnacknowledgeNotes?.(orderId);
    }
  };

  const rowBg = acknowledged ? 'rgba(29, 158, 117, 0.10)' : undefined;

  return (
    <div className="border-t border-border" style={{ backgroundColor: rowBg }}>
      <div
        role="button"
        tabIndex={0}
        aria-label={acknowledged ? tui('Mark notes as unseen') : tui('Acknowledge notes')}
        title={acknowledged ? tui('Tap to mark notes as unseen') : tui('Tap to acknowledge notes')}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        className="flex items-start cursor-pointer active:bg-muted/50 transition-colors select-none"
        style={{ padding: '2px 8px', gap: '3px' }}
      >
        <img
          src={noteIcon}
          width={11}
          height={11}
          className="shrink-0"
          style={{ marginTop: '1px', filter: 'brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(541%) hue-rotate(182deg) brightness(94%) contrast(86%)' }}
          alt=""
          aria-hidden="true"
        />
        <div
          className="flex-1 min-w-0 text-[11px] text-text-primary"
          style={{ lineHeight: 1.2 }}
        >
          {tn(notes)}
        </div>
      </div>
    </div>
  );
}

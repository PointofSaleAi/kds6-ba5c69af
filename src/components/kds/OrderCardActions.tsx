import { Eye, ConciergeBell, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import undoIcon from '@/assets/undo-icon.svg';

export type TicketState = 'seen' | 'in-progress' | 'done';

interface OrderCardActionsProps {
  orderId: string;
  ticketState: TicketState;
  onTicketAdvance?: (orderId: string) => void;
  onTicketRecall?: (orderId: string) => void;
}

export function OrderCardActions({ orderId, ticketState, onTicketAdvance, onTicketRecall }: OrderCardActionsProps) {
  const { t } = useLanguage();

  const buttonLabel = ticketState === 'seen'
    ? t.seen
    : ticketState === 'in-progress'
      ? t.inProgress.toUpperCase()
      : t.done;

  const buttonColorClass = ticketState === 'seen'
    ? ''
    : ticketState === 'in-progress'
      ? 'bg-btn-in-progress'
      : 'bg-btn-done';

  const showUndo = ticketState !== 'seen';

  const IconComponent = ticketState === 'seen'
    ? Eye
    : ticketState === 'in-progress'
      ? ConciergeBell
      : CheckCircle;

  return (
    <div className="p-1.5 border-t border-border flex gap-1.5">
      {showUndo && (
        <button
          onClick={() => onTicketRecall?.(orderId)}
          className="w-[44px] min-h-[44px] bg-muted rounded flex items-center justify-center hover:opacity-80 transition-colors shrink-0"
          title="Go back"
        >
          <img src={undoIcon} alt="Back" className="w-8 h-6" />
        </button>
      )}
      <button
        onClick={() => onTicketAdvance?.(orderId)}
        className={`flex-1 py-2.5 ${buttonColorClass} text-primary-foreground rounded flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors min-h-[44px]`}
        style={{ fontSize: '16px', fontWeight: 700, ...(ticketState === 'seen' ? { backgroundColor: '#1E293B' } : {}) }}
      >
        <IconComponent size={22} color="#FFFFFF" strokeWidth={2.5} />
        {buttonLabel}
      </button>
    </div>
  );
}

import { Eye, ConciergeBell, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import undoIcon from '@/assets/undo-icon.svg';
import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import itemReadyIcon from '@/assets/item-ready-icon.svg';

export type TicketState = 'seen' | 'in-progress' | 'done';

interface OrderCardActionsProps {
  orderId: string;
  ticketState: TicketState;
  onTicketAdvance?: (orderId: string) => void;
  onTicketRecall?: (orderId: string) => void;
  /** When true, use the rounded-square pill color set from the /old design. */
  legacyActions?: boolean;
}

export function OrderCardActions({ orderId, ticketState, onTicketAdvance, onTicketRecall, legacyActions }: OrderCardActionsProps) {
  const { t } = useLanguage();

  const buttonLabel = ticketState === 'seen'
    ? t.seen
    : ticketState === 'in-progress'
      ? t.inProgress.toUpperCase()
      : t.done;

  const legacyBg =
    ticketState === 'seen' ? '#3F6FD8'
    : ticketState === 'in-progress' ? '#E74C3C'
    : '#7D3C98';

  const defaultBgInline = ticketState === 'seen' ? { backgroundColor: '#1E293B' } : {};
  const buttonColorClass = !legacyActions && ticketState === 'in-progress'
    ? 'bg-btn-in-progress'
    : !legacyActions && ticketState === 'done'
      ? 'bg-btn-done'
      : '';

  const showUndo = ticketState !== 'seen';

  const IconComponent = ticketState === 'seen'
    ? Eye
    : ticketState === 'in-progress'
      ? ConciergeBell
      : legacyActions ? Check : CheckCircle;

  const legacyIconBg =
    ticketState === 'seen' ? '#D9EAFF'
    : ticketState === 'in-progress' ? '#FADBD8'
    : '#E8DAEF';
  const legacyIconColor =
    ticketState === 'seen' ? '#176ACA'
    : ticketState === 'in-progress' ? '#E74C3C'
    : '#7D3C98';

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
        style={{ fontSize: '16px', fontWeight: 700, ...(legacyActions ? { backgroundColor: legacyBg } : defaultBgInline) }}
      >
        {legacyActions ? (
          <span
            className="flex items-center justify-center"
            style={{ width: 32, height: 24, borderRadius: 4, backgroundColor: legacyIconBg }}
          >
            <IconComponent size={16} color={legacyIconColor} strokeWidth={2.5} />
          </span>
        ) : (
          <IconComponent size={22} color="#FFFFFF" strokeWidth={2.5} />
        )}
        {buttonLabel}
      </button>
    </div>
  );
}

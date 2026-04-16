import { useLanguage } from '@/hooks/use-language';
import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import readyIcon from '@/assets/item-ready-icon.svg';
import undoIcon from '@/assets/undo-icon.svg';

const iconSrcMap = {
  seen: seenIcon,
  preparing: preparingIcon,
  ready: readyIcon,
  undo: undoIcon,
} as const;

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

  const buttonIcon: keyof typeof iconSrcMap = ticketState === 'seen'
    ? 'seen'
    : ticketState === 'in-progress'
      ? 'preparing'
      : 'ready';

  const buttonColorClass = ticketState === 'seen'
    ? 'bg-btn-seen'
    : ticketState === 'in-progress'
      ? 'bg-btn-in-progress'
      : 'bg-btn-done';

  const showUndo = ticketState !== 'seen';

  return (
    <div className="p-1.5 border-t border-border flex items-center justify-center gap-1.5">
      {showUndo && (
        <button
          onClick={() => onTicketRecall?.(orderId)}
          className="w-[44px] min-h-[44px] bg-muted rounded flex items-center justify-center hover:opacity-80 transition-colors shrink-0"
          title="Go back"
        >
          <img src={undoIcon} alt="Back" className="w-8 h-6" />
        </button>
      )}
      {ticketState === 'seen' ? (
        <button
          onClick={() => onTicketAdvance?.(orderId)}
          className="rounded-[6px] flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors"
          style={{ fontSize: '12px', fontWeight: 500, backgroundColor: '#1E293B', color: '#FFFFFF', padding: '6px 20px' }}
        >
          <img src={iconSrcMap[buttonIcon]} alt="" className="w-5 h-4 rounded-sm" style={{ filter: 'brightness(0) invert(1)' }} />
          {buttonLabel}
        </button>
      ) : (
        <button
          onClick={() => onTicketAdvance?.(orderId)}
          className={`flex-1 py-2.5 ${buttonColorClass} text-primary-foreground rounded flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors min-h-[44px]`}
          style={{ fontSize: 'var(--kds-cta)' }}
        >
          <img src={iconSrcMap[buttonIcon]} alt="" className="w-6 h-5 rounded-sm" />
          {buttonLabel}
        </button>
      )}
    </div>
  );
}

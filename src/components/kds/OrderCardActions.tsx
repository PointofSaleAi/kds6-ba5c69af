import { ConciergeBell, Check, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import undoIcon from '@/assets/undo-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import itemReadyIcon from '@/assets/item-ready-icon.svg';

export type TicketState = 'seen' | 'preparing' | 'ready' | 'done';

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

  /** The button names the action it performs, so it reflects the next state. */
  const nextState: TicketState =
    ticketState === 'seen' ? 'preparing'
    : ticketState === 'preparing' ? 'ready'
    : 'done';

  const buttonLabel =
    nextState === 'preparing' ? t.preparing.toUpperCase()
    : nextState === 'ready' ? 'READY'
    : t.done;

  const legacyBg =
    nextState === 'preparing' ? '#E74C3C'
    : nextState === 'ready' ? '#16A34A'
    : '#7D3C98';

  const defaultBgInline =
    nextState === 'ready' ? { backgroundColor: '#16A34A' }
    : {};
  const buttonColorClass = !legacyActions && nextState === 'preparing'
    ? 'bg-btn-preparing'
    : !legacyActions && nextState === 'done'
      ? 'bg-btn-done'
      : '';

  const showUndo = ticketState !== 'seen';

  const IconComponent =
    nextState === 'preparing' ? ConciergeBell
    : nextState === 'ready' ? Check
    : CheckCircle;

  const legacyIconSrc =
    nextState === 'preparing' ? preparingIcon
    : itemReadyIcon;

  return (
    <div className="p-1.5 border-t border-border flex gap-1.5">
      {showUndo && (
        <button
          data-onboarding="ticket-footer-undo"
          onClick={() => onTicketRecall?.(orderId)}
          className="w-[44px] min-h-[44px] bg-muted rounded flex items-center justify-center hover:opacity-80 transition-colors shrink-0"
          title="Go Back"
        >
          <img src={undoIcon} alt="Back" className="w-8 h-6" />
        </button>
      )}
      <button
        data-onboarding="ticket-footer-btn"
        onClick={() => onTicketAdvance?.(orderId)}
        className={`flex-1 py-2.5 ${buttonColorClass} text-primary-foreground rounded flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors min-h-[44px]`}
        style={{ fontSize: '16px', fontWeight: 700, ...(legacyActions ? { backgroundColor: legacyBg } : defaultBgInline) }}
      >
        {legacyActions ? (
          <img src={legacyIconSrc} alt="" style={{ width: 40, height: 30 }} />
        ) : (
          <IconComponent size={22} color="#FFFFFF" strokeWidth={2.5} />
        )}
        {buttonLabel}
      </button>
    </div>
  );
}

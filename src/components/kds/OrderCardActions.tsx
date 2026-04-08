import type { OrderStatus } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import readyIcon from '@/assets/item-ready-icon.svg';
import undoIcon from '@/assets/undo-icon.svg';

interface OrderCardActionsProps {
  orderId: string;
  status: OrderStatus;
  onBump?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
}

export function OrderCardActions({ orderId, status, onBump, onRecall }: OrderCardActionsProps) {
  const { t } = useLanguage();
  const isServed = status === 'served';

  const buttonLabel = status === 'new' ? t.seen :
    status === 'seen' ? t.inProgress.toUpperCase() : t.done;

  const buttonIcon = status === 'new' ? seenIcon :
    status === 'seen' ? preparingIcon : readyIcon;

  const buttonColorClass = status === 'new' ? 'bg-btn-seen' :
    status === 'seen' ? 'bg-btn-in-progress' : 'bg-btn-done';

  return (
    <div className="p-1.5 border-t border-border flex gap-1.5">
      {!isServed && status !== 'new' && (
        <button
          onClick={() => onRecall?.(orderId)}
          className="w-[44px] min-h-[44px] bg-muted rounded flex items-center justify-center hover:opacity-80 transition-colors shrink-0"
          title="Go back"
        >
          <img src={undoIcon} alt="Back" className="w-8 h-6" />
        </button>
      )}
      {!isServed && (
        <button
          onClick={() => onBump?.(orderId)}
          className={`flex-1 py-2.5 ${buttonColorClass} text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors min-h-[44px]`}
        >
          <img src={buttonIcon} alt="" className="w-6 h-5 rounded-sm" />
          {buttonLabel}
        </button>
      )}
    </div>
  );
}

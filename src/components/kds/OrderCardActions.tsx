import type { OrderStatus } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { KdsActionIcon } from './KdsActionIcon';

interface OrderCardActionsProps {
  orderId: string;
  status: OrderStatus;
  isDineIn?: boolean;
  onBump?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
}

export function OrderCardActions({ orderId, status, isDineIn, onBump, onRecall }: OrderCardActionsProps) {
  const { t } = useLanguage();
  const isServed = status === 'served';

  // Dine-in skips SEEN (items have individual eye icons), starts from IN PROGRESS
  const buttonLabel = isDineIn
    ? (status === 'new' || status === 'seen' ? t.inProgress.toUpperCase() : t.done)
    : (status === 'new' ? t.seen : status === 'seen' ? t.inProgress.toUpperCase() : t.done);

  const buttonIcon: 'seen' | 'preparing' | 'ready' = isDineIn
    ? (status === 'new' || status === 'seen' ? 'preparing' : 'ready')
    : (status === 'new' ? 'seen' : status === 'seen' ? 'preparing' : 'ready');

  const buttonColorClass = isDineIn
    ? (status === 'new' || status === 'seen' ? 'bg-btn-in-progress' : 'bg-btn-done')
    : (status === 'new' ? 'bg-btn-seen' : status === 'seen' ? 'bg-btn-in-progress' : 'bg-btn-done');

  // Show undo for non-new statuses; for dine-in also hide on 'new'
  const showUndo = !isServed && status !== 'new';

  return (
    <div className="p-1.5 border-t border-border flex gap-1.5">
      {showUndo && (
        <button
          onClick={() => onRecall?.(orderId)}
          className="w-[44px] min-h-[44px] bg-muted rounded flex items-center justify-center hover:opacity-80 transition-colors shrink-0"
          title="Go back"
        >
          <KdsActionIcon icon="undo" />
        </button>
      )}
      {!isServed && (
        <button
          onClick={() => onBump?.(orderId)}
          className={`flex-1 py-2.5 ${buttonColorClass} text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors min-h-[44px]`}
        >
          <KdsActionIcon icon={buttonIcon} />
          {buttonLabel}
        </button>
      )}
    </div>
  );
}

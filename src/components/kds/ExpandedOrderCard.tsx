import { X, Bell } from 'lucide-react';
import seenIcon from '@/assets/seen-icon.svg';
import { motion } from 'framer-motion';
import type { Order } from '@/types/kds';
import { OrderTypeBadge } from './OrderTypeBadge';
import { TimerBadge, getTimerUrgency } from './TimerBadge';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine } from './ModifierLine';
import { useElapsedSeconds } from '@/hooks/use-elapsed';

interface ExpandedOrderCardProps {
  order: Order;
  onClose: () => void;
  onBump?: (orderId: string) => void;
  anchorRect?: DOMRect | null;
}

function formatTimeReceived(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function ExpandedOrderCard({ order, onClose, onBump, anchorRect }: ExpandedOrderCardProps) {
  const liveElapsed = useElapsedSeconds(order.timeReceived);
  const urgency = getTimerUrgency(liveElapsed, order.targetSeconds);
  const isServed = order.status === 'served';

  const buttonLabel = order.status === 'new' ? 'SEEN' :
    order.status === 'seen' ? 'IN PROGRESS' : 'DONE';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Expanded card */}
      <motion.div
        className="relative z-10 w-[90vw] max-w-[560px] max-h-[80vh] bg-surface-card rounded-lg shadow-2xl overflow-hidden flex flex-col"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="relative">
          <OrderTypeBadge
            type={order.orderType}
            time={formatTimeReceived(order.timeReceived)}
            tableInfo={order.tableName}
          />
          <button
            onClick={onClose}
            className="absolute top-1.5 right-1.5 p-2 rounded-full bg-black/20 hover:bg-black/40 text-primary-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close expanded card"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Order number */}
          <div className="text-center py-3">
            <div className="text-order-num text-text-primary leading-none">
              {order.orderNumber}
            </div>
            <div className="text-modifier text-text-secondary mt-1">
              {order.serverName}
            </div>
          </div>

          {/* Timer row */}
          <div className="flex items-center justify-center gap-3 px-3 pb-2">
            <TimerBadge seconds={liveElapsed} urgency={urgency} />
          </div>

          {/* Course sections */}
          <div className="border-t border-border">
            {order.courses.map((courseGroup) => {
              const isFired = courseGroup.isFired;
              return (
                <div key={courseGroup.course} className={isFired ? 'opacity-50' : ''}>
                  <div className="flex items-center justify-between bg-muted px-3 py-1.5">
                    <span className="text-section-label uppercase text-text-secondary tracking-widest">
                      {courseGroup.course}
                    </span>
                    {isFired && (
                      <span className="text-[10px] font-bold uppercase text-success">FIRED</span>
                    )}
                  </div>

                  <div className="px-3 py-1">
                    {courseGroup.items.map((item) => (
                      <div key={item.id} className={`py-1.5 ${item.isCancelled ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`text-item-name ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`}>
                              {item.quantity}&times; {item.name}
                            </span>
                            {item.isCancelled && (
                              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                                CANCELLED
                              </span>
                            )}
                            {item.isCompleted && !item.isCancelled && (
                              <span className="text-success text-sm">&#10003;</span>
                            )}
                          </div>
                          {!item.isCancelled && (
                            <button className="p-2.5 rounded hover:bg-muted transition-colors text-text-muted hover:text-text-primary min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Mark seen">
                              <img src={seenIcon} alt="Seen" width={20} height={15} />
                            </button>
                          )}
                        </div>

                        {item.modifiers.map((mod, idx) => (
                          <ModifierLine key={idx} modifier={mod} />
                        ))}

                        {item.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 pl-5">
                            {item.allergens.map((a) => (
                              <AllergenBadge key={a.type} allergen={a} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        {!isServed && (
          <div className="p-2 border-t border-border">
            <button
              onClick={() => { onBump?.(order.id); onClose(); }}
              className="w-full py-3 bg-brand-dark text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:bg-brand-dark/90 transition-colors min-h-[44px]"
            >
              <Bell size={14} />
              {buttonLabel}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

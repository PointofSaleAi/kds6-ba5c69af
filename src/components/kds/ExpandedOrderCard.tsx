import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { X } from 'lucide-react';
import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import undoIcon from '@/assets/undo-icon.svg';
import readyIcon from '@/assets/item-ready-icon.svg';
import type { ItemStatus } from './CourseSection';
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

export function ExpandedOrderCard({ order, onClose, onBump }: ExpandedOrderCardProps) {
  const { tp, tc } = useLanguage();
  const liveElapsed = useElapsedSeconds(order.timeReceived);
  const urgency = getTimerUrgency(liveElapsed, order.targetSeconds);
  const isServed = order.status === 'served';
  const [itemStatuses, setItemStatuses] = useState<Map<string, ItemStatus>>(new Map());

  const allItemIds = useMemo(() => 
    order.courses.flatMap(c => c.items.filter(i => !i.isCancelled).map(i => i.id)),
    [order.courses]
  );

  const handleAdvanceItem = useCallback((itemId: string) => {
    setItemStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(itemId);
      if (!current) next.set(itemId, 'preparing');
      else if (current === 'preparing') next.set(itemId, 'ready');
      else if (current === 'ready') next.set(itemId, 'done');
      return next;
    });
  }, []);

  useEffect(() => {
    if (allItemIds.length > 0 && allItemIds.every(id => itemStatuses.get(id) === 'done')) {
      onBump?.(order.id);
      onClose();
    }
  }, [itemStatuses, allItemIds, onBump, onClose, order.id]);

  const handleUndoItem = useCallback((itemId: string) => {
    setItemStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(itemId);
      if (current === 'ready') next.set(itemId, 'preparing');
      else next.delete(itemId);
      return next;
    });
  }, []);

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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.div
        className="relative z-10 w-[90vw] max-w-[560px] max-h-[80vh] bg-surface-card rounded-lg shadow-2xl overflow-hidden flex flex-col"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
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

        <div className="flex-1 overflow-y-auto">
          <div className="text-center py-3">
            <div className="text-order-num text-text-primary leading-none">
              {order.orderNumber}
            </div>
            <div className="text-modifier text-text-secondary mt-1">
              {order.serverName}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 px-3 pb-2">
            <TimerBadge seconds={liveElapsed} urgency={urgency} />
          </div>

          <div className="border-t border-border">
            {order.courses.map((courseGroup) => {
              const isFired = courseGroup.isFired;
              const allDone = courseGroup.items
                .filter(i => !i.isCancelled)
                .every(i => itemStatuses.get(i.id) === 'done');
              if (allDone) return null;
              return (
                <div key={courseGroup.course} className={isFired ? 'opacity-50' : ''}>
                  <div className="flex items-center justify-between bg-muted px-3 py-1.5">
                    <span className="text-section-label uppercase text-text-secondary tracking-widest">
                      {tc(courseGroup.course)}
                    </span>
                    {isFired && (
                      <span className="text-[10px] font-bold uppercase text-success">FIRED</span>
                    )}
                  </div>

                  <div className="px-3 py-1">
                    {courseGroup.items.map((item) => {
                      const status = itemStatuses.get(item.id);
                      return (
                        <div key={item.id} className={`py-1.5 ${item.isCancelled ? 'opacity-50' : ''} ${status === 'done' ? 'hidden' : ''}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className={`text-item-name ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`}>
                                {item.quantity}&times; {tp(item.name)}
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
                              <div className="flex items-center shrink-0">
                                {status === 'ready' ? (
                                  <>
                                    <button
                                      onClick={() => handleUndoItem(item.id)}
                                      className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                                      aria-label="Undo"
                                    >
                                      <img src={undoIcon} alt="Undo" width={28} height={21} />
                                    </button>
                                    <button
                                      onClick={() => handleAdvanceItem(item.id)}
                                      className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                                      aria-label="Mark done"
                                    >
                                      <img src={readyIcon} alt="Ready" width={28} height={21} />
                                    </button>
                                  </>
                                ) : status === 'preparing' ? (
                                  <>
                                    <button
                                      onClick={() => handleUndoItem(item.id)}
                                      className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                                      aria-label="Undo"
                                    >
                                      <img src={undoIcon} alt="Undo" width={28} height={21} />
                                    </button>
                                    <button
                                      onClick={() => handleAdvanceItem(item.id)}
                                      className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                                      aria-label="Mark ready"
                                    >
                                      <img src={preparingIcon} alt="Preparing" width={28} height={21} />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleAdvanceItem(item.id)}
                                    className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                                    aria-label="Mark seen"
                                  >
                                    <img src={seenIcon} alt="Seen" width={28} height={21} />
                                  </button>
                                )}
                              </div>
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
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isServed && (
          <div className="p-2 border-t border-border">
            <button
              onClick={() => { onBump?.(order.id); onClose(); }}
              className="w-full py-3 bg-brand-dark text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:bg-brand-dark/90 transition-colors min-h-[44px]"
            >
              {buttonLabel}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

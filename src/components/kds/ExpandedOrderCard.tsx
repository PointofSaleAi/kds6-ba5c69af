import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
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

import { useElapsedSeconds } from '@/hooks/use-elapsed';

interface ExpandedOrderCardProps {
  order: Order;
  onClose: () => void;
  onBump?: (orderId: string) => void;
  anchorRect?: DOMRect | null;
}

// Using formatTimeForKDS from context

export function ExpandedOrderCard({ order, onClose, onBump }: ExpandedOrderCardProps) {
  const { t, tp, tc, timeFormat } = useLanguage();
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

  const buttonLabel = order.status === 'new' ? t.seen :
    order.status === 'seen' ? t.preparing.toUpperCase() : t.done;

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
            time={formatTimeForKDS(order.timeReceived, timeFormat)}
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
                        <div
                          key={item.id}
                          className={`flex items-start border-b border-border/50 ${item.isCancelled ? 'opacity-50' : ''} ${status === 'done' ? 'hidden' : ''}`}
                style={{ padding: '4px', gap: 0 }}
                        >
                          {/* Child 1 — item-main */}
                          <div className="flex-1 min-w-0">
                            {/* .item-name-row */}
                            <div className="flex items-start flex-nowrap min-w-0" style={{ gap: '6px', lineHeight: 1.1 }}>
                              <span className="text-[13px] font-normal text-text-secondary">
                                {item.quantity}×
                              </span>
                              <span className={`text-[13px] font-medium uppercase min-w-0 flex-1 break-words ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`} style={{ lineHeight: 1.1, wordBreak: 'break-word' }}>
                                {tp(item.name)}
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

                            {item.allergens.length > 0 && (
                              <div className="flex items-start" style={{ gap: '6px', marginTop: '1px', lineHeight: 1 }}>
                                <span className="invisible shrink-0 font-normal text-[13px]" aria-hidden="true" style={{ lineHeight: 1 }}>
                                  {item.quantity}×
                                </span>
                                <div className="flex flex-wrap items-start" style={{ gap: '4px', rowGap: '2px', lineHeight: 1 }}>
                                  {item.allergens.map((a) => (
                                    <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* .item-mods */}
                            {item.modifiers.length > 0 && (
                              <div style={{ marginTop: '1px' }}>
                                {item.modifiers.map((mod, idx) => (
                                  <div
                                    key={idx}
                                    className={
                                      mod.type === 'extra'
                                        ? 'text-modifier-extra'
                                        : mod.type === 'remove'
                                          ? 'text-destructive line-through'
                                          : 'text-text-secondary'
                                    }
                                    style={{ fontSize: '11px', lineHeight: '1.4', marginBottom: 0, paddingLeft: '20px' }}
                                  >
                                    {mod.text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Child 2 — item-action */}
                          {!item.isCancelled && (
                            <div className="flex items-center shrink-0" style={{ gap: '4px', paddingTop: '1px' }}>
                              {status === 'ready' ? (
                                <>
                                  <button onClick={() => handleUndoItem(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Undo">
                                    <img src={undoIcon} alt="Undo" style={{ width: '40px', height: '30px' }} />
                                  </button>
                                  <button onClick={() => handleAdvanceItem(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Mark done">
                                    <img src={readyIcon} alt="Ready" style={{ width: '40px', height: '30px' }} />
                                  </button>
                                </>
                              ) : status === 'preparing' ? (
                                <>
                                  <button onClick={() => handleUndoItem(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Undo">
                                    <img src={undoIcon} alt="Undo" style={{ width: '40px', height: '30px' }} />
                                  </button>
                                  <button onClick={() => handleAdvanceItem(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Mark ready">
                                    <img src={preparingIcon} alt="Preparing" style={{ width: '40px', height: '30px' }} />
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => handleAdvanceItem(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Mark seen">
                                  <img src={seenIcon} alt="Seen" style={{ width: '40px', height: '30px' }} />
                                </button>
                              )}
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

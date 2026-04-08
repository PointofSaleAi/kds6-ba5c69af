import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { OrderItem, StationName, Order } from '@/types/kds';
import { StationBadge, stationColors } from './StationBadge';
import { useLanguage } from '@/hooks/use-language';

const allStations: { name: StationName; activeItems: number }[] = [
  { name: 'Grill', activeItems: 3 },
  { name: 'Fry', activeItems: 2 },
  { name: 'Salad', activeItems: 1 },
  { name: 'Dessert', activeItems: 2 },
];

interface ItemRoutingModalProps {
  item: OrderItem;
  order: Order;
  onClose: () => void;
  onConfirm: (itemId: string, newStation: StationName) => void;
}

export function ItemRoutingModal({ item, order, onClose, onConfirm }: ItemRoutingModalProps) {
  const [selected, setSelected] = useState<StationName | null>(null);
  const { tp, tpSecondary, displayMode } = useLanguage();
  const currentStation = item.station;

  const orderLabel = `Ticket #${order.orderNumber} \u00B7 ${
    order.orderType === 'dine-in' ? 'Dine In' : order.orderType === 'take-out' ? 'Take Out' : order.orderType === 'delivery' ? 'Delivery' : 'Banquet'
  } \u00B7 ${order.tableName}`;

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(item.id, selected);
    toast.success(`${tp(item.name)} moved to ${selected} station`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          className="relative z-10 w-[90vw] flex flex-col bg-surface-card border border-border"
          style={{ maxWidth: 500, borderRadius: 16 }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 pb-2">
            <div>
              <div className="text-[15px] font-medium text-text-primary">Re-route item</div>
              <div className="text-[11px] text-text-muted mt-0.5">{orderLabel}</div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <X size={14} className="text-text-secondary" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pb-4 flex flex-col gap-4">
            {/* Context box */}
            <div className="bg-muted rounded-lg border border-border p-3">
              <div className="text-[10px] uppercase text-text-muted tracking-wider mb-1">Item being re-routed</div>
              <div className="text-[14px] font-medium text-text-primary">{tp(item.name)}</div>
              {displayMode === 'dual' && (
                <div className="text-[12px] text-text-muted mt-0.5">{tpSecondary(item.name)}</div>
              )}
              {item.modifiers.length > 0 && (
                <div className="text-[12px] text-text-secondary mt-0.5">
                  {item.modifiers.map(m => m.text).join(', ')}
                </div>
              )}
              {currentStation && (
                <div className="flex items-center gap-2 mt-2">
                  <StationBadge station={currentStation} />
                  <span className="text-[11px] text-text-muted">currently assigned here</span>
                </div>
              )}
            </div>

            {/* Station selector */}
            <div>
              <div className="text-[11px] uppercase text-text-muted tracking-wider mb-2">Move to which station?</div>
              <div className="grid grid-cols-2 gap-2">
                {allStations.map((s) => {
                  const isDisabled = s.name === currentStation;
                  const isSelected = s.name === selected;
                  const dotColor = stationColors[s.name].text;
                  return (
                    <button
                      key={s.name}
                      onClick={() => !isDisabled && setSelected(s.name)}
                      disabled={isDisabled}
                      className={`text-left rounded-[10px] border-[1.5px] transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-muted hover:bg-muted/80'
                      } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ padding: '12px 14px' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
                        <span className="text-[13px] font-medium text-text-primary">{s.name}</span>
                      </div>
                      <div className="text-[11px] text-text-muted mt-1">{s.activeItems} active items</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 pt-0">
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className={`w-full flex items-center justify-center py-3 rounded-lg text-[13px] font-semibold transition-colors ${
                selected
                  ? 'bg-primary text-primary-foreground hover:opacity-90'
                  : 'bg-muted text-text-muted cursor-default'
              }`}
            >
              {selected ? `Move to ${selected} station` : 'Select a station'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

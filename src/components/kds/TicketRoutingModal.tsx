import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Order, StationName } from '@/types/kds';
import { StationBadge, stationColors } from './StationBadge';
import { useLanguage } from '@/hooks/use-language';

const allStations: { name: StationName; activeItems: number }[] = [
  { name: 'Grill', activeItems: 3 },
  { name: 'Fry', activeItems: 2 },
  { name: 'Salad', activeItems: 1 },
  { name: 'Dessert', activeItems: 2 },
];

interface TicketRoutingModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (orderId: string, newStation: StationName) => void;
}

export function TicketRoutingModal({ order, onClose, onConfirm }: TicketRoutingModalProps) {
  const [selected, setSelected] = useState<StationName | null>(null);
  const { tp } = useLanguage();

  const orderLabel = `Ticket #${order.orderNumber} \u00B7 ${
    order.orderType === 'dine-in' ? 'Dine In' : order.orderType === 'take-out' ? 'Take Out' : order.orderType === 'delivery' ? 'Delivery' : 'Banquet'
  } \u00B7 ${order.tableName}`;

  const allItems = order.courses.flatMap(c => c.items).filter(i => !i.isCancelled);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(order.id, selected);
    toast.success(`All items in ticket #${order.orderNumber} moved to ${selected} station`);
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
          style={{ maxWidth: 500, borderRadius: 16, maxHeight: '85vh', overflow: 'auto' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 pb-2">
            <div>
              <div className="text-[15px] font-medium text-text-primary">Re-route entire ticket</div>
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
            {/* Warning box */}
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
              <span className="text-[12px] text-warning leading-relaxed">
                All items will move to the selected station. Current station assignments will be overridden.
              </span>
            </div>

            {/* Items list */}
            <div className="bg-muted rounded-lg border border-border">
              <div className="text-[10px] uppercase text-text-muted tracking-wider px-3 pt-2 pb-1">Items in this ticket</div>
              {allItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-1.5"
                  style={{ borderTop: idx > 0 ? '1px solid hsl(var(--border))' : undefined }}
                >
                  <span className="text-[13px] text-text-primary">{tp(item.name)}</span>
                  {item.station && <StationBadge station={item.station} />}
                </div>
              ))}
            </div>

            {/* Station selector */}
            <div>
              <div className="text-[11px] uppercase text-text-muted tracking-wider mb-2">Move all items to:</div>
              <div className="grid grid-cols-2 gap-2">
                {allStations.map((s) => {
                  const isSelected = s.name === selected;
                  const dotColor = stationColors[s.name].text;
                  return (
                    <button
                      key={s.name}
                      onClick={() => setSelected(s.name)}
                      className={`text-left rounded-[10px] border-[1.5px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-muted hover:bg-muted/80'
                      }`}
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
              {selected ? `Move all items to ${selected}` : 'Select a station'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

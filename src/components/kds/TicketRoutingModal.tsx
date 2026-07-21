import { useState } from 'react';
import { X, Route } from 'lucide-react';
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

  const orderTypeLabel = order.orderType === 'dine-in' ? 'Dine In' : order.orderType === 'take-out' ? 'Take Out' : order.orderType === 'delivery' ? 'Delivery' : 'Banquet';

  const allItems = order.courses.flatMap(c => c.items).filter(i => !i.isCancelled);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(order.id, selected);
    toast.success(`All items in ticket ${order.orderNumber} moved to ${selected} station`);
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
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <motion.div
          className="relative z-10 w-[90vw] flex flex-col bg-surface-card border border-border shadow-xl"
          style={{ maxWidth: 480, borderRadius: 16, maxHeight: '85vh', overflow: 'auto' }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
                <Route size={16} className="text-warning" />
              </div>
              <div>
                <div className="text-[16px] font-bold text-text-primary tracking-tight">Re-route Entire Ticket</div>
                <div className="text-[11px] text-text-secondary mt-0.5 font-medium">
                  Ticket <span className="font-bold text-text-primary">{order.orderNumber}</span> · {orderTypeLabel} · {order.tableName}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-muted hover:bg-border transition-colors"
            >
              <X size={15} className="text-text-secondary" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 flex flex-col gap-5">
            {/* Warning box */}
            <div className="bg-warning/8 border border-warning/25 rounded-xl p-3.5 flex items-start gap-2.5">
              <span className="text-warning text-[14px] mt-0.5">⚠</span>
              <span className="text-[11px] text-warning font-semibold leading-relaxed">
                All items will move to the selected station. Current station assignments will be overridden.
              </span>
            </div>

            {/* Items list */}
            <div>
              <div className="text-[9px] uppercase text-text-muted tracking-[0.1em] font-bold mb-2">Products in This Ticket</div>
              <div className="bg-muted/60 rounded-xl border border-border overflow-hidden">
                {allItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderTop: idx > 0 ? '1px solid hsl(var(--border))' : undefined }}
                  >
                    <span className="text-[12px] font-semibold text-text-primary uppercase">{tp(item.name)}</span>
                    {item.station && <StationBadge station={item.station} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Station selector */}
            <div>
              <div className="text-[9px] uppercase text-text-muted tracking-[0.1em] font-bold mb-2.5">Move all products to:</div>
              <div className="grid grid-cols-2 gap-2.5">
                {allStations.map((s) => {
                  const isSelected = s.name === selected;
                  const colors = stationColors[s.name];
                  return (
                    <button
                      key={s.name}
                      onClick={() => setSelected(s.name)}
                      className={`text-left rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-dark shadow-md'
                          : 'border-border bg-surface-card hover:border-text-muted hover:shadow-sm'
                      }`}
                      style={{ padding: '14px 16px', backgroundColor: isSelected ? `${colors.bg}12` : undefined }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${isSelected ? 'ring-2 ring-offset-1' : ''}`}
                          style={{
                            backgroundColor: colors.text,
                            ...(isSelected ? { '--tw-ring-color': colors.text } as React.CSSProperties : {}),
                          }}
                        />
                        <span className="text-[13px] font-bold text-text-primary">{s.name}</span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-1 font-medium ml-5.5">{s.activeItems} active items</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 pt-0">
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className={`w-full flex items-center justify-center py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wide transition-all ${
                selected
                  ? 'bg-brand-dark text-primary-foreground hover:opacity-90 shadow-md'
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

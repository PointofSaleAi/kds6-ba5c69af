import { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
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
  const { tp, tpSecondary, displayMode, showSecondaryMenu } = useLanguage();
  const currentStation = item.station;

  const orderTypeLabel = order.orderType === 'dine-in' ? 'Dine In' : order.orderType === 'take-out' ? 'Take Out' : order.orderType === 'delivery' ? 'Delivery' : 'Banquet';

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
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <motion.div
          className="relative z-10 w-[90vw] flex flex-col bg-surface-card border border-border shadow-xl"
          style={{ maxWidth: 480, borderRadius: 16 }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-dark/10 flex items-center justify-center">
                <ArrowRightLeft size={16} className="text-brand-dark" />
              </div>
              <div>
                <div className="text-[16px] font-bold text-text-primary tracking-tight">Re-route Product</div>
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
            {/* Context box */}
            <div className="bg-muted/60 rounded-xl border border-border p-4">
              <div className="text-[9px] uppercase text-text-muted tracking-[0.1em] font-bold mb-2">Product Being Re-routed</div>
              <div className="text-[15px] font-bold text-text-primary uppercase tracking-wide">{tp(item.name)}</div>
              {displayMode === 'dual' && showSecondaryMenu && (
                <div className="text-[12px] text-text-secondary mt-0.5 font-medium">{tpSecondary(item.name)}</div>
              )}
              {item.modifiers.length > 0 && (
                <div className="text-[11px] text-text-muted mt-1 italic">
                  {item.modifiers.map(m => m.text).join(', ')}
                </div>
              )}
              {currentStation && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
                  <StationBadge station={currentStation} />
                  <span className="text-[10px] text-text-muted font-medium">currently assigned here</span>
                </div>
              )}
            </div>

            {/* Station selector */}
            <div>
              <div className="text-[9px] uppercase text-text-muted tracking-[0.1em] font-bold mb-2.5">Move to which station?</div>
              <div className="grid grid-cols-2 gap-2.5">
                {allStations.map((s) => {
                  const isDisabled = s.name === currentStation;
                  const isSelected = s.name === selected;
                  const colors = stationColors[s.name];
                  return (
                    <button
                      key={s.name}
                      onClick={() => !isDisabled && setSelected(s.name)}
                      disabled={isDisabled}
                      className={`text-left rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-brand-dark shadow-md'
                          : 'border-border bg-surface-card hover:border-text-muted hover:shadow-sm'
                      } ${isDisabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'}`}
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
                        <span className={`text-[13px] font-bold text-text-primary ${isSelected ? '' : ''}`}>{s.name}</span>
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
              {selected ? `Move to ${selected} station` : 'Select a station'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

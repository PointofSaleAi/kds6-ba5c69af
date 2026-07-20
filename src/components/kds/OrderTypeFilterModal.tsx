import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OrderType } from '@/types/kds';
import { DEFAULT_ORDER_TYPE_COLORS, useKDSSettings } from '@/hooks/use-kds-settings';

interface OrderTypeFilterModalProps {
  open: boolean;
  onClose: () => void;
  activeTypes: OrderType[];
  onApply: (types: OrderType[]) => void;
}

const ORDER_TYPE_OPTIONS: { value: OrderType; label: string }[] = [
  { value: 'dine-in', label: 'Dine In' },
  { value: 'take-out', label: 'Take Out' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'banquet', label: 'Banquet' },
  { value: 'drive-thru', label: 'Drive Thru' },
  { value: 'curb-side', label: 'Curb Side' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'phone-in', label: 'Phone-In' },
];

export default function OrderTypeFilterModal({ open, onClose, activeTypes, onApply }: OrderTypeFilterModalProps) {
  const { orderTypeColors } = useKDSSettings();
  if (!open) return null;

  const isAll = activeTypes.length === 0;

  const toggle = (v: OrderType) => {
    const next = activeTypes.includes(v)
      ? activeTypes.filter(x => x !== v)
      : [...activeTypes, v];
    onApply(next);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-brand-dark/60 z-50 flex items-end justify-center sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div />
            <h2 className="text-lg font-bold text-text-primary">Order type filter</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onApply([])}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors min-h-[44px] ${
                  isAll ? 'bg-brand-primary text-primary-foreground' : 'bg-muted text-text-secondary hover:text-text-primary'
                }`}
              >
                All Types
              </button>
              {ORDER_TYPE_OPTIONS.map((opt) => {
                const active = activeTypes.includes(opt.value);
                const color = orderTypeColors[opt.value] || DEFAULT_ORDER_TYPE_COLORS[opt.value];
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggle(opt.value)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors min-h-[44px] flex items-center gap-2 ${
                      active
                        ? 'bg-brand-primary text-primary-foreground'
                        : 'bg-muted text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 pb-4 shrink-0">
            <button
              onClick={() => onApply([])}
              className="w-full text-center text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px]"
            >
              Clear All
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

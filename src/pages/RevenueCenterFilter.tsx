import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RevenueCenterFilterProps {
  open: boolean;
  onClose: () => void;
  onApply: (centers: string[]) => void;
  activeCenters?: string[];
}

const allCenters = [
  'ALL STATIONS',
  'BAR',
  'KITCHEN',
  'GRILL',
  'COLD KITCHEN',
  'PASS',
  'EXPO',
];

export default function RevenueCenterFilter({ open, onClose, onApply, activeCenters = [] }: RevenueCenterFilterProps) {
  const [selected, setSelected] = useState<string[]>(activeCenters.length ? activeCenters : ['ALL STATIONS']);

  if (!open) return null;

  const emit = (next: string[]) => {
    onApply(next.includes('ALL STATIONS') ? [] : next);
  };

  const toggleCenter = (center: string) => {
    if (center === 'ALL STATIONS') {
      setSelected(['ALL STATIONS']);
      emit(['ALL STATIONS']);
      return;
    }
    setSelected((prev) => {
      const without = prev.filter((c) => c !== 'ALL STATIONS');
      let next: string[];
      if (without.includes(center)) {
        const removed = without.filter((c) => c !== center);
        next = removed.length === 0 ? ['ALL STATIONS'] : removed;
      } else {
        next = [...without, center];
      }
      emit(next);
      return next;
    });
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
            <h2 className="text-lg font-bold text-text-primary">Revenue Center Filter</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {allCenters.map((center) => {
                const isActive = selected.includes(center);
                return (
                  <button
                    key={center}
                    onClick={() => toggleCenter(center)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-brand-primary text-primary-foreground'
                        : 'bg-muted text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {center}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 pb-4 shrink-0">
            <button
              onClick={() => { setSelected(['ALL STATIONS']); emit(['ALL STATIONS']); }}
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

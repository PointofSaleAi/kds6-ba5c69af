import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryFilterPanelProps {
  open: boolean;
  onClose: () => void;
  onApply: (categories: string[]) => void;
  activeCategories?: string[];
  availableCategories?: string[];
}

export default function CategoryFilterPanel({ open, onClose, onApply, activeCategories = [], availableCategories = [] }: CategoryFilterPanelProps) {
  const allCategories = ['ALL CATEGORIES', ...availableCategories];
  const [selected, setSelected] = useState<string[]>(activeCategories.length ? activeCategories : ['ALL CATEGORIES']);

  if (!open) return null;

  const emit = (next: string[]) => {
    onApply(next.includes('ALL CATEGORIES') ? [] : next);
  };

  const toggleCategory = (cat: string) => {
    if (cat === 'ALL CATEGORIES') {
      setSelected(['ALL CATEGORIES']);
      emit(['ALL CATEGORIES']);
      return;
    }
    setSelected((prev) => {
      const without = prev.filter((c) => c !== 'ALL CATEGORIES');
      let next: string[];
      if (without.includes(cat)) {
        const removed = without.filter((c) => c !== cat);
        next = removed.length === 0 ? ['ALL CATEGORIES'] : removed;
      } else {
        next = [...without, cat];
      }
      emit(next);
      return next;
    });
  };

  const handleClear = () => {
    setSelected(['ALL CATEGORIES']);
    emit(['ALL CATEGORIES']);
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
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div />
            <h2 className="text-lg font-bold text-text-primary">Filter by Category</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {availableCategories.length === 0 ? (
              <div className="text-sm text-text-secondary text-center py-8">No Active Categories</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => {
                  const isActive = selected.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors min-h-[44px] ${
                        isActive
                          ? 'bg-brand-primary text-primary-foreground'
                          : 'bg-muted text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 pb-4 shrink-0">
            <button
              onClick={handleClear}
              className="w-full text-center text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[36px]"
            >
              Clear All
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

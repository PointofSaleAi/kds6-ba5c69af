import { useState } from 'react';
import { X, Clock, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaggerModeSettingsProps {
  open: boolean;
  onClose: () => void;
}

function Stepper({ value, onChange, min, max, label, unit }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string; unit: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-xs text-text-muted">{unit}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-30 min-h-[44px] min-w-[44px]"
        >
          <Minus size={16} className="text-text-primary" />
        </button>
        <span className="w-10 text-center text-lg font-bold text-text-primary">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 disabled:opacity-30 min-h-[44px] min-w-[44px]"
        >
          <Plus size={16} className="text-text-primary" />
        </button>
      </div>
    </div>
  );
}

export default function StaggerModeSettings({ open, onClose }: StaggerModeSettingsProps) {
  const [enabled, setEnabled] = useState(true);
  const [interval, setIntervalMin] = useState(5);
  const [maxOrders, setMaxOrders] = useState(3);

  if (!open) return null;

  // Preview timeline blocks
  const previewSlots = Array.from({ length: 4 }, (_, i) => ({
    time: `${i * interval} min`,
    orders: Math.min(maxOrders, 3 - Math.floor(i / 2)),
  }));

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
            <Clock size={20} className="text-text-muted" />
            <h2 className="text-lg font-bold text-text-primary">Stagger Mode</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Toggle */}
            <button
              onClick={() => setEnabled(!enabled)}
              className="w-full flex items-center justify-between py-3 min-h-[52px]"
            >
              <span className="text-sm font-semibold text-text-primary">Stagger Mode</span>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors min-w-[44px] ${enabled ? 'bg-brand-primary' : 'bg-border'}`}
                role="switch"
                aria-checked={enabled}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-surface-card rounded-full transition-transform shadow-sm ${enabled ? 'translate-x-5' : ''}`} />
              </div>
            </button>

            {enabled && (
              <>
                <div className="border-t border-border pt-3">
                  <Stepper
                    value={interval}
                    onChange={setIntervalMin}
                    min={1}
                    max={30}
                    label="Release Interval"
                    unit="minutes between batches"
                  />
                  <Stepper
                    value={maxOrders}
                    onChange={setMaxOrders}
                    min={1}
                    max={10}
                    label="Max Orders per Batch"
                    unit="orders released at once"
                  />
                </div>

                {/* Preview timeline */}
                <div className="mt-4">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Release preview</div>
                  <div className="flex items-end gap-2">
                    {previewSlots.map((slot, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex flex-col gap-0.5 items-center">
                          {Array.from({ length: slot.orders }, (_, j) => (
                            <div key={j} className="w-8 h-3 rounded bg-brand-primary/70" />
                          ))}
                        </div>
                        <span className="text-[10px] text-text-muted">{slot.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="px-4 pb-4 flex gap-3 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-text-secondary border border-border rounded-lg hover:bg-muted transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-brand-primary text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-primary/90 min-h-[44px]"
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

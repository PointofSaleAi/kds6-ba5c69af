import { useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusSettingsProps {
  open: boolean;
  onClose: () => void;
}

interface StatusConfig {
  key: string;
  label: string;
  color: string;
  textColor: 'white' | 'grey' | 'black';
  thresholdMinutes: number | null;
}

const defaultStatuses: StatusConfig[] = [
  { key: 'start', label: 'START (New)', color: '#E84C3D', textColor: 'white', thresholdMinutes: 5 },
  { key: 'medium', label: 'MEDIUM (In Progress)', color: '#E67E22', textColor: 'white', thresholdMinutes: 10 },
  { key: 'delay', label: 'DELAY (Warning)', color: '#7F8C8D', textColor: 'white', thresholdMinutes: 20 },
  { key: 'overtime', label: 'OVERTIME (Critical)', color: '#922B21', textColor: 'white', thresholdMinutes: null },
];

const swatches = [
  '#E84C3D', '#E67E22', '#F39C12', '#27AE60', '#16A085',
  '#2980B9', '#2471A3', '#8E44AD', '#1A1A2E', '#2C3E50',
  '#7F8C8D', '#95A5A6', '#922B21', '#C0392B',
];

const textColorOptions = ['white', 'grey', 'black'] as const;

function getContrastRatio(hex: string, textColor: string): { ratio: number; passes: boolean } {
  const hexToRgb = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16) / 255;
    const g = parseInt(h.slice(3, 5), 16) / 255;
    const b = parseInt(h.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  const textHex = textColor === 'white' ? '#FFFFFF' : textColor === 'black' ? '#000000' : '#6C7A89';
  const bgL = hexToRgb(hex) + 0.05;
  const fgL = hexToRgb(textHex) + 0.05;
  const ratio = Math.max(bgL, fgL) / Math.min(bgL, fgL);
  return { ratio: Math.round(ratio * 10) / 10, passes: ratio >= 4.5 };
}

export default function StatusSettings({ open, onClose }: StatusSettingsProps) {
  const [statuses, setStatuses] = useState<StatusConfig[]>(defaultStatuses);
  const [editing, setEditing] = useState<string | null>(null);
  const [customHex, setCustomHex] = useState('');

  if (!open) return null;

  const updateStatus = (key: string, updates: Partial<StatusConfig>) => {
    setStatuses((prev) => prev.map((s) => (s.key === key ? { ...s, ...updates } : s)));
  };

  const handleReset = () => setStatuses(defaultStatuses);

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
          className="bg-surface-card rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div />
            <h2 className="text-lg font-bold text-text-primary">Status Colours</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {statuses.map((status) => {
              const isEditing = editing === status.key;
              const contrast = getContrastRatio(status.color, status.textColor);

              return (
                <div key={status.key} className="mb-4">
                    <div className="flex items-center gap-3 min-h-[52px]">
                    <div className="w-8 h-8 rounded-lg shrink-0 border border-border" style={{ backgroundColor: status.color }} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-text-primary">{status.label}</div>
                      <div className="text-xs text-text-muted">
                        {status.thresholdMinutes !== null ? `Till ${status.thresholdMinutes} mins` : 'No limit'}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(isEditing ? null : status.key)}
                      className="px-3 py-1.5 text-xs font-semibold text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/10 transition-colors min-h-[36px]"
                    >
                      {isEditing ? 'Close' : 'Edit'}
                    </button>
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-2 pl-11 space-y-3"
                    >
                      {/* Colour swatches */}
                      <div>
                        <div className="text-xs text-text-muted mb-2">Colour</div>
                        <div className="flex flex-wrap gap-1.5">
                          {swatches.map((hex) => (
                            <button
                              key={hex}
                              onClick={() => updateStatus(status.key, { color: hex })}
                              className={`w-8 h-8 rounded-lg border-2 transition-transform min-w-[32px] min-h-[32px] ${
                                status.color === hex ? 'border-text-primary scale-110' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-text-muted">Custom:</span>
                          <input
                            type="text"
                            value={customHex}
                            onChange={(e) => setCustomHex(e.target.value)}
                            placeholder="#RRGGBB"
                            className="w-24 px-2 py-1 text-xs bg-muted rounded border border-border text-text-primary"
                          />
                          <button
                            onClick={() => {
                              if (/^#[0-9A-Fa-f]{6}$/.test(customHex)) {
                                updateStatus(status.key, { color: customHex });
                              }
                            }}
                            className="text-xs text-brand-primary font-semibold min-h-[32px]"
                          >
                            Apply
                          </button>
                        </div>
                      </div>

                      {/* Text colour */}
                      <div>
                        <div className="text-xs text-text-muted mb-2">Text Colour</div>
                        <div className="flex gap-2">
                          {textColorOptions.map((tc) => (
                            <button
                              key={tc}
                              onClick={() => updateStatus(status.key, { textColor: tc })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors min-h-[36px] ${
                                status.textColor === tc ? 'bg-brand-primary text-primary-foreground' : 'bg-muted text-text-secondary'
                              }`}
                            >
                              {tc}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Contrast badge */}
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                        contrast.passes ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {contrast.passes ? <Check size={14} /> : <AlertTriangle size={14} />}
                        {contrast.passes ? `AA Compliant (${contrast.ratio}:1)` : `Low contrast (${contrast.ratio}:1)`}
                      </div>

                      {/* Live preview */}
                      <div className="rounded-lg p-3 text-center text-sm font-bold" style={{ backgroundColor: status.color, color: status.textColor === 'white' ? '#fff' : status.textColor === 'black' ? '#000' : '#6C7A89' }}>
                        {status.label} Preview
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}

            <button onClick={handleReset} className="text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[36px]">
              Reset to defaults
            </button>
          </div>

          <div className="px-4 pb-4 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3 bg-brand-primary text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-primary/90 min-h-[44px]"
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

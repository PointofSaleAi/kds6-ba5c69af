import { useState, useMemo } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStatusRules, DEFAULT_RULES, type StatusRule } from '@/hooks/use-status-rules';
import StatusRuleCard from '@/components/kds/StatusRuleCard';

interface StatusSettingsProps {
  open: boolean;
  onClose: () => void;
}

function validateRules(rules: StatusRule[]): Map<string, string[]> {
  const errorMap = new Map<string, string[]>();

  rules.forEach((rule, i) => {
    const errs: string[] = [];
    if (!rule.label.trim()) errs.push('Status name cannot be empty');
    if (rule.minMinutes < 0) errs.push('Start minute cannot be negative');
    if (rule.maxMinutes !== null && rule.maxMinutes < rule.minMinutes) {
      errs.push('End minute must be greater than start');
    }

    // Check overlap / gap with previous rule
    if (i > 0) {
      const prev = rules[i - 1];
      const prevEnd = prev.maxMinutes;
      if (prevEnd !== null && rule.minMinutes <= prevEnd) {
        errs.push(`Overlaps with "${prev.label}" (ends at ${prevEnd} min)`);
      }
      if (prevEnd !== null && rule.minMinutes > prevEnd + 1) {
        errs.push(`Gap between ${prevEnd} and ${rule.minMinutes} min`);
      }
    }

    // Duplicate labels
    const dup = rules.find((r, j) => j !== i && r.label.trim().toLowerCase() === rule.label.trim().toLowerCase());
    if (dup) errs.push('Duplicate status name');

    if (errs.length > 0) errorMap.set(rule.id, errs);
  });

  return errorMap;
}

export default function StatusSettings({ open, onClose }: StatusSettingsProps) {
  const { rules: savedRules, setRules: saveRules, resetToDefaults } = useStatusRules();
  const [draft, setDraft] = useState<StatusRule[]>(savedRules);

  const errors = useMemo(() => validateRules(draft), [draft]);
  const hasErrors = errors.size > 0;

  if (!open) return null;

  const updateRule = (id: string, updates: Partial<StatusRule>) => {
    setDraft((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      // Auto-chain: when changing maxMinutes, update next rule's minMinutes
      const idx = next.findIndex((r) => r.id === id);
      if (updates.maxMinutes !== undefined && idx < next.length - 1 && updates.maxMinutes !== null) {
        next[idx + 1] = { ...next[idx + 1], minMinutes: updates.maxMinutes + 1 };
      }
      return next;
    });
  };

  const handleSave = () => {
    if (hasErrors) return;
    saveRules(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft(DEFAULT_RULES);
    resetToDefaults();
  };

  // Timeline bar data
  const maxMins = draft[draft.length - 1]?.minMinutes
    ? Math.max(30, (draft[draft.length - 2]?.maxMinutes ?? 20) + 10)
    : 30;

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
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div />
            <h2 className="text-lg font-bold text-text-primary">Status Colours</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {/* Description */}
            <p className="text-xs text-text-muted leading-relaxed">
              Define how ticket colours change as orders age. Each rule sets the colour for a specific time range. Rules are applied in order from top to bottom.
            </p>

            {/* Timeline visualisation */}
            <div className="rounded-lg bg-muted p-3">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Timeline Preview</div>
              <div className="flex h-6 rounded-md overflow-hidden">
                {draft.map((rule) => {
                  const start = rule.minMinutes;
                  const end = rule.maxMinutes ?? maxMins;
                  const width = ((end - start) / maxMins) * 100;
                  const textColorResolved = rule.textColor === 'white' ? '#FFFFFF' : rule.textColor === 'black' ? '#000000' : '#6C7A89';
                  return (
                    <div
                      key={rule.id}
                      className="flex items-center justify-center text-[9px] font-bold shrink-0"
                      style={{ width: `${Math.max(width, 8)}%`, backgroundColor: rule.color, color: textColorResolved }}
                    >
                      {rule.maxMinutes !== null ? `${start}-${end}m` : `${start}m+`}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rule cards */}
            {draft.map((rule, i) => (
              <StatusRuleCard
                key={rule.id}
                rule={rule}
                index={i}
                isLast={i === draft.length - 1}
                onChange={(updates) => updateRule(rule.id, updates)}
                errors={errors.get(rule.id) || []}
              />
            ))}

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[36px]"
            >
              <RotateCcw size={14} />
              Reset to defaults
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 pt-2 shrink-0 border-t border-border flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-text-secondary font-bold text-sm uppercase rounded-lg transition-colors hover:bg-muted min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={hasErrors}
              className="flex-1 py-3 bg-brand-primary text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-primary/90 disabled:opacity-40 disabled:pointer-events-none min-h-[44px]"
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

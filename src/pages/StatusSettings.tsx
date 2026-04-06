import { useState, useMemo, useCallback } from 'react';
import { X, RotateCcw, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStatusRules, DEFAULT_RULES, type StatusRule } from '@/hooks/use-status-rules';
import AgingTimeline from '@/components/kds/AgingTimeline';
import AgingEditPanel from '@/components/kds/AgingEditPanel';

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
    const dup = rules.find((r, j) => j !== i && r.label.trim().toLowerCase() === rule.label.trim().toLowerCase());
    if (dup) errs.push('Duplicate status name');
    if (errs.length > 0) errorMap.set(rule.id, errs);
  });

  return errorMap;
}

function resolveTextColor(tc: string) {
  return tc === 'white' ? '#FFFFFF' : tc === 'black' ? '#000000' : '#6C7A89';
}

export default function StatusSettings({ open, onClose }: StatusSettingsProps) {
  const { rules: savedRules, setRules: saveRules, resetToDefaults } = useStatusRules();
  const [draft, setDraft] = useState<StatusRule[]>(savedRules);
  const [selectedId, setSelectedId] = useState<string>(draft[0]?.id || '');

  const errors = useMemo(() => validateRules(draft), [draft]);
  const hasErrors = errors.size > 0;

  const selectedRule = draft.find(r => r.id === selectedId);
  const selectedIndex = draft.findIndex(r => r.id === selectedId);
  const isLastSelected = selectedIndex === draft.length - 1;

  const maxMins = useMemo(() => {
    const lastBounded = draft.filter(r => r.maxMinutes !== null);
    const highestEnd = lastBounded.length > 0 ? Math.max(...lastBounded.map(r => r.maxMinutes!)) : 20;
    return Math.max(30, highestEnd + 10);
  }, [draft]);

  if (!open) return null;

  const updateRule = (id: string, updates: Partial<StatusRule>) => {
    setDraft((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      const idx = next.findIndex((r) => r.id === id);
      if (updates.maxMinutes !== undefined && idx < next.length - 1 && updates.maxMinutes !== null) {
        next[idx + 1] = { ...next[idx + 1], minMinutes: updates.maxMinutes + 1 };
      }
      return next;
    });
  };

  const handleBoundaryDrag = (ruleId: string, newMax: number) => {
    setDraft((prev) => {
      const next = [...prev];
      const idx = next.findIndex(r => r.id === ruleId);
      if (idx === -1 || idx === next.length - 1) return prev;
      const rule = next[idx];
      if (newMax <= rule.minMinutes) return prev;
      next[idx] = { ...rule, maxMinutes: newMax };
      next[idx + 1] = { ...next[idx + 1], minMinutes: newMax + 1 };
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
    setSelectedId(DEFAULT_RULES[0].id);
    resetToDefaults();
  };

  // Drag reorder
  const moveRule = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= draft.length) return;
    setDraft((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      // Rechain min/max
      for (let i = 0; i < next.length; i++) {
        if (i === 0) {
          next[i] = { ...next[i], minMinutes: 0 };
        } else {
          const prevMax = next[i - 1].maxMinutes;
          next[i] = { ...next[i], minMinutes: prevMax !== null ? prevMax + 1 : next[i].minMinutes };
        }
        if (i === next.length - 1) {
          next[i] = { ...next[i], maxMinutes: null };
        }
      }
      return next;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-brand-dark/60 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-card rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
            <div>
              <h2 className="text-base font-bold text-text-primary">Ticket Aging Rules</h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                Orders change colour as they age. Adjust thresholds based on your kitchen speed.
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Timeline */}
          <div className="px-5 py-4 border-b border-border shrink-0">
            <AgingTimeline
              rules={draft}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onBoundaryDrag={handleBoundaryDrag}
              maxMinutes={maxMins}
            />
          </div>

          {/* Two-panel body */}
          <div className="flex-1 overflow-hidden flex min-h-0">
            {/* LEFT: Status List */}
            <div className="w-[45%] border-r border-border overflow-y-auto p-3 space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status Rules</span>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-text-primary transition-colors min-h-[28px]"
                >
                  <RotateCcw size={10} />
                  Reset
                </button>
              </div>

              {draft.map((rule, i) => {
                const isSelected = selectedId === rule.id;
                const textColor = resolveTextColor(rule.textColor);
                const ruleErrors = errors.get(rule.id);

                return (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedId(rule.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left min-h-[52px] ${
                      isSelected
                        ? 'bg-muted ring-1 ring-ring shadow-sm'
                        : 'hover:bg-muted/40'
                    } ${ruleErrors ? 'ring-1 ring-destructive/40' : ''}`}
                  >
                    {/* Drag handle */}
                    <GripVertical size={14} className="text-text-muted/40 shrink-0 cursor-grab" />

                    {/* Color block */}
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm"
                      style={{ backgroundColor: rule.color, color: textColor }}
                    >
                      Aa
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-text-primary truncate">{rule.label}</div>
                    </div>

                    {/* Time badge */}
                    <span className="text-[11px] font-bold text-text-muted shrink-0 bg-muted px-2 py-1 rounded-md">
                      {rule.maxMinutes !== null ? `${rule.minMinutes}-${rule.maxMinutes}m` : `${rule.minMinutes}m+`}
                    </span>
                  </button>
                );
              })}

              {/* Move controls for selected */}
              {selectedRule && (
                <div className="flex gap-1.5 pt-2">
                  <button
                    onClick={() => moveRule(selectedIndex, selectedIndex - 1)}
                    disabled={selectedIndex === 0}
                    className="flex-1 py-2 text-[11px] font-semibold text-text-secondary bg-muted rounded-lg hover:bg-muted/80 disabled:opacity-30 disabled:pointer-events-none min-h-[36px] transition-colors"
                  >
                    Move Up
                  </button>
                  <button
                    onClick={() => moveRule(selectedIndex, selectedIndex + 1)}
                    disabled={selectedIndex === draft.length - 1}
                    className="flex-1 py-2 text-[11px] font-semibold text-text-secondary bg-muted rounded-lg hover:bg-muted/80 disabled:opacity-30 disabled:pointer-events-none min-h-[36px] transition-colors"
                  >
                    Move Down
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Edit Panel */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedRule ? (
                <AgingEditPanel
                  key={selectedRule.id}
                  rule={selectedRule}
                  isLast={isLastSelected}
                  onChange={(updates) => updateRule(selectedRule.id, updates)}
                  errors={errors.get(selectedRule.id) || []}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-text-muted">
                  Select a status rule to edit
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-4 pt-3 shrink-0 border-t border-border flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-text-secondary font-bold text-sm uppercase rounded-lg transition-colors hover:bg-muted min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={hasErrors}
              className="flex-1 py-3 bg-foreground text-background font-bold text-sm uppercase rounded-lg transition-colors hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none min-h-[44px]"
            >
              Save Rules
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

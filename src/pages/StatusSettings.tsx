import { useState, useMemo, useCallback, useRef } from 'react';
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

function rechainRules(rules: StatusRule[]): StatusRule[] {
  return rules.map((rule, i) => {
    const minMinutes = i === 0 ? 0 : (rules[i - 1].maxMinutes !== null ? rules[i - 1].maxMinutes! + 1 : rule.minMinutes);
    const maxMinutes = i === rules.length - 1 ? null : rule.maxMinutes;
    return { ...rule, minMinutes, maxMinutes };
  });
}

interface DraggableStatusListProps {
  rules: StatusRule[];
  selectedId: string;
  errors: Map<string, string[]>;
  onSelect: (id: string) => void;
  onReorder: (rules: StatusRule[]) => void;
  onReset: () => void;
}

function DraggableStatusList({ rules, selectedId, errors, onSelect, onReorder, onReset }: DraggableStatusListProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIdx(idx);
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const next = [...rules];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(toIdx, 0, moved);
    onReorder(rechainRules(next));
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div ref={listRef} className="w-[45%] border-r border-border overflow-y-auto p-3 space-y-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status Rules</span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-text-primary transition-colors min-h-[28px]"
        >
          <RotateCcw size={10} />
          Reset
        </button>
      </div>

      {rules.map((rule, i) => {
        const isSelected = selectedId === rule.id;
        const textColor = resolveTextColor(rule.textColor);
        const ruleErrors = errors.get(rule.id);
        const isDragging = dragIdx === i;
        const isOver = overIdx === i && dragIdx !== null && dragIdx !== i;

        return (
          <div
            key={rule.id}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(rule.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left min-h-[52px] cursor-pointer ${
              isSelected
                ? 'bg-muted ring-1 ring-ring shadow-sm'
                : 'hover:bg-muted/40'
            } ${ruleErrors ? 'ring-1 ring-destructive/40' : ''} ${
              isDragging ? 'opacity-40 scale-95' : ''
            } ${isOver ? 'border-t-2 border-ring' : ''}`}
          >
            <GripVertical size={14} className="text-text-muted/40 shrink-0 cursor-grab active:cursor-grabbing" />
            <div
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm"
              style={{ backgroundColor: rule.color, color: textColor }}
            >
              Aa
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text-primary truncate">{rule.label}</div>
            </div>
            <span className="text-[11px] font-bold text-text-muted shrink-0 bg-muted px-2 py-1 rounded-md">
              {rule.maxMinutes !== null ? `${rule.minMinutes}-${rule.maxMinutes}m` : `${rule.minMinutes}m+`}
            </span>
          </div>
        );
      })}
    </div>
  );
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

const PRESETS: { label: string; description: string; rules: StatusRule[] }[] = [
  {
    label: 'Fast Kitchen',
    description: 'Tight thresholds for high-volume kitchens',
    rules: [
      { id: 'start', label: 'Start (New)', color: '#E84C3D', textColor: 'white', minMinutes: 0, maxMinutes: 3 },
      { id: 'medium', label: 'Medium (In Progress)', color: '#E67E22', textColor: 'white', minMinutes: 4, maxMinutes: 6 },
      { id: 'delay', label: 'Delay (Warning)', color: '#7F8C8D', textColor: 'white', minMinutes: 7, maxMinutes: 12 },
      { id: 'overtime', label: 'Overtime (Critical)', color: '#922B21', textColor: 'white', minMinutes: 13, maxMinutes: null },
    ],
  },
  {
    label: 'Standard',
    description: 'Balanced timing for most restaurants',
    rules: [
      { id: 'start', label: 'Start (New)', color: '#E84C3D', textColor: 'white', minMinutes: 0, maxMinutes: 5 },
      { id: 'medium', label: 'Medium (In Progress)', color: '#E67E22', textColor: 'white', minMinutes: 6, maxMinutes: 10 },
      { id: 'delay', label: 'Delay (Warning)', color: '#7F8C8D', textColor: 'white', minMinutes: 11, maxMinutes: 20 },
      { id: 'overtime', label: 'Overtime (Critical)', color: '#922B21', textColor: 'white', minMinutes: 21, maxMinutes: null },
    ],
  },
  {
    label: 'Slow Kitchen',
    description: 'Relaxed thresholds for fine dining or complex menus',
    rules: [
      { id: 'start', label: 'Start (New)', color: '#E84C3D', textColor: 'white', minMinutes: 0, maxMinutes: 10 },
      { id: 'medium', label: 'Medium (In Progress)', color: '#E67E22', textColor: 'white', minMinutes: 11, maxMinutes: 20 },
      { id: 'delay', label: 'Delay (Warning)', color: '#7F8C8D', textColor: 'white', minMinutes: 21, maxMinutes: 35 },
      { id: 'overtime', label: 'Overtime (Critical)', color: '#922B21', textColor: 'white', minMinutes: 36, maxMinutes: null },
    ],
  },
];

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

          {/* Presets */}
          <div className="px-5 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0">Presets:</span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => { setDraft(preset.rules); setSelectedId(preset.rules[0].id); }}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-muted text-text-secondary hover:bg-accent hover:text-text-primary transition-colors min-h-[32px]"
                  title={preset.description}
                >
                  {preset.label}
                </button>
              ))}
            </div>
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
            <DraggableStatusList
              rules={draft}
              selectedId={selectedId}
              errors={errors}
              onSelect={setSelectedId}
              onReorder={(newDraft) => setDraft(newDraft)}
              onReset={handleReset}
            />

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

import { useState, useMemo, useCallback, useRef } from 'react';
import { RotateCcw, GripVertical, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useStatusRules, DEFAULT_RULES, type StatusRule } from '@/hooks/use-status-rules';

import AgingEditPanel from '@/components/kds/AgingEditPanel';

interface StatusSettingsProps {
  onBack: () => void;
  hideHeader?: boolean;
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
  onAdd: () => void;
  onRemove: (id: string) => void;
}

function DraggableStatusList({ rules, selectedId, errors, onSelect, onReorder, onReset, onAdd, onRemove }: DraggableStatusListProps) {
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

  const canRemove = rules.length > 2;

  return (
    <div ref={listRef} className="w-full lg:w-[45%] shrink-0 border-b lg:border-b-0 lg:border-r border-border lg:overflow-y-auto p-3 space-y-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status Rules</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onAdd}
            className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-text-primary transition-colors min-h-[28px] px-1.5"
            title="Add New Status Level"
          >
            <Plus size={12} />
            Add
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-text-primary transition-colors min-h-[28px] px-1.5"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        </div>
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
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left min-h-[52px] cursor-pointer ${
              isSelected
                ? 'bg-muted ring-1 ring-ring shadow-sm'
                : 'bg-surface-card hover:bg-muted/50'
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
            {canRemove && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(rule.id); }}
                className="p-1 rounded hover:bg-destructive/10 text-text-muted hover:text-destructive transition-colors shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
                title="Remove Status Level"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const AGING_TONES = {
  start: { color: '#34d15b', colorTo: '#1da94a', glow: 'rgba(52,209,91,.8)', textColor: 'white' as const },
  medium: { color: '#ffb340', colorTo: '#f08c00', glow: 'rgba(255,179,64,.8)', textColor: 'black' as const },
  delay: { color: '#ff453a', colorTo: '#e0281c', glow: 'rgba(255,69,58,.8)', textColor: 'white' as const },
  overtime: { color: '#a259e6', colorTo: '#7b2fc4', glow: 'rgba(162,89,230,.8)', textColor: 'white' as const },
};

const PRESETS: { label: string; description: string; rules: StatusRule[] }[] = [
  {
    label: 'Fast Kitchen',
    description: 'Tight thresholds for high-volume kitchens',
    rules: [
      { id: 'start', label: 'New', ...AGING_TONES.start, minMinutes: 0, maxMinutes: 2 },
      { id: 'medium', label: 'Medium', ...AGING_TONES.medium, minMinutes: 2, maxMinutes: 4 },
      { id: 'delay', label: 'Delay', ...AGING_TONES.delay, minMinutes: 4, maxMinutes: 6 },
      { id: 'overtime', label: 'Overtime', ...AGING_TONES.overtime, minMinutes: 6, maxMinutes: null },
    ],
  },
  {
    label: 'Standard',
    description: 'Balanced timing for most restaurants',
    rules: [
      { id: 'start', label: 'New', ...AGING_TONES.start, minMinutes: 0, maxMinutes: 3 },
      { id: 'medium', label: 'Medium', ...AGING_TONES.medium, minMinutes: 3, maxMinutes: 5 },
      { id: 'delay', label: 'Delay', ...AGING_TONES.delay, minMinutes: 5, maxMinutes: 7 },
      { id: 'overtime', label: 'Overtime', ...AGING_TONES.overtime, minMinutes: 7, maxMinutes: null },
    ],
  },
  {
    label: 'Slow Kitchen',
    description: 'Relaxed thresholds for fine dining or complex menus',
    rules: [
      { id: 'start', label: 'New', ...AGING_TONES.start, minMinutes: 0, maxMinutes: 10 },
      { id: 'medium', label: 'Medium', ...AGING_TONES.medium, minMinutes: 10, maxMinutes: 20 },
      { id: 'delay', label: 'Delay', ...AGING_TONES.delay, minMinutes: 20, maxMinutes: 35 },
      { id: 'overtime', label: 'Overtime', ...AGING_TONES.overtime, minMinutes: 35, maxMinutes: null },
    ],
  },
];

export default function StatusSettings({ onBack, hideHeader = false }: StatusSettingsProps) {
  const { rules: savedRules, setRules: saveRules, resetToDefaults, courseLevelAging, setCourseLevelAging } = useStatusRules();
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
    onBack();
  };

  const handleReset = () => {
    setDraft(DEFAULT_RULES);
    setSelectedId(DEFAULT_RULES[0].id);
    resetToDefaults();
  };

  const handleAddRule = () => {
    const lastRule = draft[draft.length - 1];
    const prevMax = draft.length >= 2 ? (draft[draft.length - 2].maxMinutes ?? 20) : 5;
    const newMin = lastRule.minMinutes;
    const newMax = newMin + 5;
    const newId = `custom-${Date.now()}`;
    const colors = ['#27AE60', '#2980B9', '#8E44AD', '#D4AC0D', '#1ABC9C', '#E67E22'];
    const color = colors[draft.length % colors.length];
    const updated = [
      ...draft.slice(0, -1),
      { ...draft[draft.length - 1], maxMinutes: newMax },
      { id: newId, label: `Status ${draft.length + 1}`, color, textColor: 'white' as const, minMinutes: newMax + 1, maxMinutes: null },
    ];
    setDraft(rechainRules(updated));
    setSelectedId(newId);
  };

  const handleRemoveRule = (id: string) => {
    if (draft.length <= 2) return;
    const filtered = draft.filter(r => r.id !== id);
    const rechained = rechainRules(filtered);
    setDraft(rechained);
    if (selectedId === id) setSelectedId(rechained[0].id);
  };

  // Allow the parent SettingsPanel header to trigger reset via a window event
  // so the Reset button can sit visually next to the "Ticket aging rules" title.
  if (typeof window !== 'undefined') {
    (window as unknown as { __agingResetHandler?: () => void }).__agingResetHandler = handleReset;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent p-0">
      {!hideHeader && (
        <div className="flex items-center justify-center gap-4 px-6 py-4 shrink-0">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Ticket Aging Rules</h1>
        </div>
      )}

      {/* Course Level Toggle + Presets (2-col) */}
      <div className="pb-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/60">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-text-primary">Apply to Course Level</div>
            <div className="text-[11px] text-text-muted">When enabled, timing rules apply per course. Orders without courses use product-level timing.</div>
          </div>
          <button
            onClick={() => setCourseLevelAging(!courseLevelAging)}
            className={`relative w-11 h-6 rounded-full transition-colors min-w-[44px] shrink-0 ml-3 ${courseLevelAging ? 'bg-brand-primary' : 'bg-border'}`}
            role="switch"
            aria-checked={courseLevelAging}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-surface-card rounded-full transition-transform shadow-sm ${courseLevelAging ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="py-3 px-4 rounded-lg bg-muted/60">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Presets</div>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESETS.map((preset) => {
              const isActive = preset.rules.length === draft.length && preset.rules.every((pr, i) =>
                draft[i] && pr.color === draft[i].color && pr.minMinutes === draft[i].minMinutes && pr.maxMinutes === draft[i].maxMinutes && pr.label === draft[i].label
              );
              return (
                <button
                  key={preset.label}
                  onClick={() => { setDraft(preset.rules); setSelectedId(preset.rules[0].id); }}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors min-h-[32px] ${
                    isActive
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-surface-card text-text-primary border-border hover:bg-accent'
                  }`}
                  title={preset.description}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* Two-panel body */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row min-h-0 border border-border rounded-xl bg-transparent">
        {/* LEFT: Status List */}
        <DraggableStatusList
          rules={draft}
          selectedId={selectedId}
          errors={errors}
          onSelect={setSelectedId}
          onReorder={(newDraft) => setDraft(newDraft)}
          onReset={handleReset}
          onAdd={handleAddRule}
          onRemove={handleRemoveRule}
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

      {/* Save button */}
      <div className="pt-3 shrink-0">
        <button
          onClick={handleSave}
          disabled={hasErrors}
          className="w-full py-3 bg-foreground text-background font-bold text-sm uppercase rounded-lg transition-colors hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none min-h-[44px]"
        >
          Save Rules
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StatusRule } from '@/hooks/use-status-rules';

interface StatusRuleCardProps {
  rule: StatusRule;
  index: number;
  isLast: boolean;
  onChange: (updates: Partial<StatusRule>) => void;
  errors: string[];
}

const swatches = [
  '#E24B4A', '#D85A30', '#E5A000', '#4A4A47', '#27AE60', '#16A085',
  '#2980B9', '#2471A3', '#8E44AD', '#1A1A2E', '#2C3E50',
  '#7F8C8D', '#95A5A6', '#922B21', '#C0392B',
];

const textColorOptions = ['white', 'grey', 'black'] as const;

function getContrastRatio(hex: string, textColor: string): { ratio: number; passes: boolean } {
  const hexToLuminance = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16) / 255;
    const g = parseInt(h.slice(3, 5), 16) / 255;
    const b = parseInt(h.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  const textHex = textColor === 'white' ? '#FFFFFF' : textColor === 'black' ? '#000000' : '#6C7A89';
  const bgL = hexToLuminance(hex) + 0.05;
  const fgL = hexToLuminance(textHex) + 0.05;
  const ratio = Math.max(bgL, fgL) / Math.min(bgL, fgL);
  return { ratio: Math.round(ratio * 10) / 10, passes: ratio >= 4.5 };
}

function formatRange(min: number, max: number | null): string {
  if (max === null) return `${min}+ min`;
  if (min === 0) return `0\u2013${max} min`;
  return `${min}\u2013${max} min`;
}

export default function StatusRuleCard({ rule, index, isLast, onChange, errors }: StatusRuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [customHex, setCustomHex] = useState('');
  const contrast = getContrastRatio(rule.color, rule.textColor);
  const textColorResolved = rule.textColor === 'white' ? '#FFFFFF' : rule.textColor === 'black' ? '#000000' : '#6C7A89';

  return (
    <div className="rounded-xl border border-border bg-surface-card overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors min-h-[56px]"
      >
        <span className="text-xs font-bold text-text-muted w-5 shrink-0">{index + 1}</span>
        <div
          className="w-9 h-9 rounded-lg shrink-0 border border-border flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: rule.color, color: textColorResolved }}
        >
          Aa
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-text-primary truncate">{rule.label}</div>
          <div className="text-xs text-text-muted">{formatRange(rule.minMinutes, rule.maxMinutes)}</div>
        </div>
        {/* Live preview chip */}
        <div
          className="px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0"
          style={{ backgroundColor: rule.color, color: textColorResolved }}
        >
          {formatRange(rule.minMinutes, rule.maxMinutes)}
        </div>
        {expanded ? <ChevronUp size={16} className="text-text-muted shrink-0" /> : <ChevronDown size={16} className="text-text-muted shrink-0" />}
      </button>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="px-4 pb-2">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertTriangle size={12} /> {err}
            </div>
          ))}
        </div>
      )}

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border">
              {/* Label */}
              <div>
                <label className="text-xs font-semibold text-text-muted mb-1.5 block">Status Name</label>
                <input
                  type="text"
                  value={rule.label}
                  onChange={(e) => onChange({ label: e.target.value })}
                  maxLength={40}
                  className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Time range */}
              <div>
                <label className="text-xs font-semibold text-text-muted mb-1.5 block">Time Range (minutes)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={rule.minMinutes}
                    onChange={(e) => onChange({ minMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-20 px-3 py-2 text-sm bg-muted rounded-lg border border-border text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-text-muted text-sm">to</span>
                  {isLast ? (
                    <span className="px-3 py-2 text-sm text-text-secondary italic bg-muted rounded-lg border border-border">No Limit</span>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={rule.maxMinutes ?? ''}
                      onChange={(e) => onChange({ maxMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-20 px-3 py-2 text-sm bg-muted rounded-lg border border-border text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                  <span className="text-xs text-text-muted">min</span>
                </div>
              </div>

              {/* Colour swatches */}
              <div>
                <label className="text-xs font-semibold text-text-muted mb-1.5 block">Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {swatches.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => onChange({ color: hex })}
                      className={`w-8 h-8 rounded-lg border-2 transition-transform min-w-[32px] min-h-[32px] ${
                        rule.color === hex ? 'border-text-primary scale-110' : 'border-transparent'
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
                    className="w-24 px-2 py-1.5 text-xs bg-muted rounded-lg border border-border text-text-primary"
                  />
                  <button
                    onClick={() => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(customHex)) {
                        onChange({ color: customHex });
                      }
                    }}
                    className="text-xs text-brand-primary font-semibold min-h-[32px] px-2"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Text colour */}
              <div>
                <label className="text-xs font-semibold text-text-muted mb-1.5 block">Text Color</label>
                <div className="flex gap-2">
                  {textColorOptions.map((tc) => (
                    <button
                      key={tc}
                      onClick={() => onChange({ textColor: tc })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors min-h-[36px] ${
                        rule.textColor === tc ? 'bg-brand-primary text-primary-foreground' : 'bg-muted text-text-secondary'
                      }`}
                    >
                      {tc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast badge */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                contrast.passes ? 'bg-[hsl(145,40%,92%)] text-[hsl(145,60%,30%)]' : 'bg-[hsl(37,80%,92%)] text-[hsl(37,80%,30%)]'
              }`}>
                {contrast.passes ? <Check size={14} /> : <AlertTriangle size={14} />}
                {contrast.passes ? `AA Compliant (${contrast.ratio}:1)` : `Low contrast (${contrast.ratio}:1)`}
              </div>

              {/* Full preview */}
              <div>
                <label className="text-xs font-semibold text-text-muted mb-1.5 block">Preview</label>
                <div
                  className="rounded-lg p-3 text-center text-sm font-bold"
                  style={{ backgroundColor: rule.color, color: textColorResolved }}
                >
                  {rule.label} / {formatRange(rule.minMinutes, rule.maxMinutes)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

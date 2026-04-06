import { useState, useRef, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import type { StatusRule } from '@/hooks/use-status-rules';
import NumberWheelPicker from '@/components/kds/NumberWheelPicker';

interface AgingEditPanelProps {
  rule: StatusRule;
  isLast: boolean;
  onChange: (updates: Partial<StatusRule>) => void;
  errors: string[];
}

const palettes = {
  warm: ['#E84C3D', '#C0392B', '#922B21', '#E67E22', '#F39C12', '#D4AC0D'],
  cool: ['#2980B9', '#2471A3', '#16A085', '#27AE60', '#1ABC9C', '#3498DB'],
  neutral: ['#1A1A2E', '#2C3E50', '#7F8C8D', '#95A5A6', '#BDC3C7', '#8E44AD'],
};

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

function resolveTextColor(tc: string) {
  return tc === 'white' ? '#FFFFFF' : tc === 'black' ? '#000000' : '#6C7A89';
}

function TimeRangeField({ rule, isLast, onChange }: { rule: StatusRule; isLast: boolean; onChange: (u: Partial<StatusRule>) => void }) {
  const [openPicker, setOpenPicker] = useState<'from' | 'to' | null>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPicker) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (openPicker === 'from' && fromRef.current && !fromRef.current.contains(target)) setOpenPicker(null);
      if (openPicker === 'to' && toRef.current && !toRef.current.contains(target)) setOpenPicker(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openPicker]);

  return (
    <div>
      <label className="text-[11px] font-semibold text-text-muted mb-1 block uppercase tracking-wider">
        Time Range (minutes)
      </label>
      <div className="flex items-center gap-2">
        <div ref={fromRef} className="relative">
          <button
            onClick={() => setOpenPicker(openPicker === 'from' ? null : 'from')}
            className={`w-20 px-3 py-2.5 text-sm bg-muted rounded-lg border text-text-primary text-center transition-colors ${openPicker === 'from' ? 'border-ring ring-2 ring-ring' : 'border-border'}`}
          >
            {rule.minMinutes}
          </button>
          {openPicker === 'from' && (
            <WheelPopover value={rule.minMinutes} min={0} max={60} onChange={(v) => onChange({ minMinutes: v })} />
          )}
        </div>
        <span className="text-text-muted text-xs font-medium">to</span>
        {isLast ? (
          <span className="px-3 py-2.5 text-sm text-text-secondary italic bg-muted rounded-lg border border-border flex-1 text-center">
            No limit (∞)
          </span>
        ) : (
          <div ref={toRef} className="relative">
            <button
              onClick={() => setOpenPicker(openPicker === 'to' ? null : 'to')}
              className={`w-20 px-3 py-2.5 text-sm bg-muted rounded-lg border text-text-primary text-center transition-colors ${openPicker === 'to' ? 'border-ring ring-2 ring-ring' : 'border-border'}`}
            >
              {rule.maxMinutes ?? ''}
            </button>
            {openPicker === 'to' && (
              <WheelPopover value={rule.maxMinutes ?? 1} min={0} max={60} onChange={(v) => onChange({ maxMinutes: Math.max(1, v) })} />
            )}
          </div>
        )}
        <span className="text-[11px] text-text-muted font-medium">min</span>
      </div>
    </div>
  );
}

function WheelPopover({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemH = 36;
  const visible = 5;
  const pad = Math.floor(visible / 2);
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTo({ top: (value - min) * itemH, behavior: 'auto' });
  }, []);

  const handleScroll = () => {
    if (!listRef.current) return;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!listRef.current) return;
      const idx = Math.round(listRef.current.scrollTop / itemH);
      const snapped = Math.max(min, Math.min(max, min + idx));
      listRef.current.scrollTo({ top: idx * itemH, behavior: 'smooth' });
      onChange(snapped);
    }, 80);
  };

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 rounded-xl border border-border bg-surface-card shadow-xl overflow-hidden"
      style={{ width: 72, height: itemH * visible }}
    >
      <div className="absolute left-1 right-1 rounded-lg bg-foreground/8 pointer-events-none z-10"
        style={{ top: itemH * pad, height: itemH }}
      />
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-surface-card to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-card to-transparent pointer-events-none z-20" />
      <div ref={listRef} onScroll={handleScroll} className="h-full overflow-y-auto scrollbar-hide" style={{ scrollSnapType: 'y mandatory' }}>
        {Array.from({ length: pad }).map((_, i) => <div key={`pt${i}`} style={{ height: itemH }} />)}
        {items.map((num) => (
          <div
            key={num}
            onClick={() => { onChange(num); listRef.current?.scrollTo({ top: (num - min) * itemH, behavior: 'smooth' }); }}
            className={`flex items-center justify-center cursor-pointer select-none transition-all ${num === value ? 'text-text-primary font-bold text-base' : 'text-text-muted text-sm'}`}
            style={{ height: itemH, scrollSnapAlign: 'start' }}
          >
            {num}
          </div>
        ))}
        {Array.from({ length: pad }).map((_, i) => <div key={`pb${i}`} style={{ height: itemH }} />)}
      </div>
    </div>
  );
}

export default function AgingEditPanel({ rule, isLast, onChange, errors }: AgingEditPanelProps) {
  const [customHex, setCustomHex] = useState('');
  const contrast = getContrastRatio(rule.color, rule.textColor);
  const textColor = resolveTextColor(rule.textColor);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border border-border"
          style={{ backgroundColor: rule.color }}
        />
        <div>
          <h3 className="text-sm font-bold text-text-primary">{rule.label}</h3>
          <p className="text-[11px] text-text-muted">
            Applies from {rule.minMinutes}-{rule.maxMinutes ?? '∞'} min
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertTriangle size={12} /> {err}
            </div>
          ))}
        </div>
      )}

      {/* Status Name */}
      <div>
        <label className="text-[11px] font-semibold text-text-muted mb-1 block uppercase tracking-wider">
          Status Name
        </label>
        <input
          type="text"
          value={rule.label}
          onChange={(e) => onChange({ label: e.target.value })}
          maxLength={40}
          className="w-full px-3 py-2.5 text-sm bg-muted rounded-lg border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Time Range */}
      <TimeRangeField rule={rule} isLast={isLast} onChange={onChange} />

      {/* Colour Picker - Grouped */}
      <div>
        <label className="text-[11px] font-semibold text-text-muted mb-2 block uppercase tracking-wider">
          Colour
        </label>
        {Object.entries(palettes).map(([group, colors]) => (
          <div key={group} className="mb-2">
            <span className="text-[10px] text-text-muted capitalize mb-1 block">{group}</span>
            <div className="flex flex-wrap gap-1.5">
              {colors.map((hex) => (
                <button
                  key={hex}
                  onClick={() => onChange({ color: hex })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all min-w-[32px] min-h-[32px] ${
                    rule.color === hex ? 'border-text-primary scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            placeholder="#RRGGBB"
            className="w-24 px-2 py-1.5 text-xs bg-muted rounded-lg border border-border text-text-primary"
          />
          <button
            onClick={() => {
              if (/^#[0-9A-Fa-f]{6}$/.test(customHex)) onChange({ color: customHex });
            }}
            className="text-xs font-semibold text-text-secondary hover:text-text-primary min-h-[32px] px-2 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Text Colour */}
      <div>
        <label className="text-[11px] font-semibold text-text-muted mb-1 block uppercase tracking-wider">
          Text Colour
        </label>
        <div className="flex gap-2">
          {textColorOptions.map((tc) => (
            <button
              key={tc}
              onClick={() => onChange({ textColor: tc })}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors min-h-[36px] flex-1 ${
                rule.textColor === tc
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-text-secondary hover:bg-muted/80'
              }`}
            >
              {tc}
            </button>
          ))}
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold mt-2 ${
          contrast.passes ? 'bg-[hsl(145,40%,92%)] text-[hsl(145,60%,30%)]' : 'bg-[hsl(37,80%,92%)] text-[hsl(37,80%,30%)]'
        }`}>
          {contrast.passes ? <Check size={14} /> : <AlertTriangle size={14} />}
          {contrast.passes ? `AA Compliant (${contrast.ratio}:1)` : `Low contrast (${contrast.ratio}:1)`}
        </div>
      </div>

      {/* Live KDS Ticket Preview */}
      <div>
        <label className="text-[11px] font-semibold text-text-muted mb-2 block uppercase tracking-wider">
          Live Ticket Preview
        </label>
        <div className="rounded-lg overflow-hidden border border-border shadow-sm">
          {/* Ticket header */}
          <div
            className="px-3 py-2"
            style={{ backgroundColor: rule.color, color: textColor }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase opacity-80">DINE IN</span>
              <span className="text-[10px] font-mono opacity-80">12:34 PM</span>
            </div>
            <div className="text-2xl font-black mt-0.5">#1042</div>
          </div>
          {/* Ticket body */}
          <div className="bg-surface-card px-3 py-2">
            <div className="text-xs font-semibold text-text-primary">Chicken Burger x2</div>
            <div className="text-[11px] text-text-muted mt-0.5">+ Extra cheese, No onion</div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <span
                className="font-mono text-sm font-bold"
                style={{ color: rule.color }}
              >
                {rule.minMinutes > 0 ? String(rule.minMinutes + 2).padStart(2, '0') : '03'}:12
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: rule.color, color: textColor }}
              >
                {rule.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

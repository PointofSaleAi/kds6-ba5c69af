import { useMemo, useState, useRef, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import type { StatusRule } from '@/hooks/use-status-rules';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';
import { SelectedVariantPreview } from './SelectedVariantPreview';
import { previewTicket } from '@/data/mock-preview-ticket';
import type { Order, OrderType } from '@/types/kds';


interface AgingEditPanelProps {
  rule: StatusRule;
  isLast: boolean;
  onChange: (updates: Partial<StatusRule>) => void;
  errors: string[];
}

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

const MAX_MINUTES = 999;

function validateTimeRange(min: number, max: number | null | undefined, isLast: boolean): string | null {
  if (!Number.isFinite(min) || !Number.isInteger(min)) return 'From must be a whole number';
  if (min < 0) return 'From cannot be negative';
  if (min > MAX_MINUTES) return `From cannot exceed ${MAX_MINUTES} min`;
  if (isLast) return null;
  if (max == null || !Number.isFinite(max) || !Number.isInteger(max)) return 'To is required';
  if (max < 0) return 'To cannot be negative';
  if (max > MAX_MINUTES) return `To cannot exceed ${MAX_MINUTES} min`;
  if (max <= min) return 'To must be greater than From';
  return null;
}

function clampMinutes(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(MAX_MINUTES, Math.round(v)));
}

function TimeRangeField({ rule, isLast, onChange }: { rule: StatusRule; isLast: boolean; onChange: (u: Partial<StatusRule>) => void }) {
  const [openPicker, setOpenPicker] = useState<'from' | 'to' | null>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const error = validateTimeRange(rule.minMinutes, rule.maxMinutes, isLast);

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

  const invalidFrom = error?.toLowerCase().includes('from');
  const invalidTo = error && !invalidFrom;

  return (
    <div>
      <label className="text-[11px] font-semibold text-text-secondary mb-1 block uppercase tracking-wider">
        Time Range (minutes)
      </label>
      <div className="flex items-center gap-2">
        <div ref={fromRef} className="relative">
          <button
            onClick={() => setOpenPicker(openPicker === 'from' ? null : 'from')}
            aria-invalid={invalidFrom || undefined}
            className={`w-20 px-3 py-2.5 text-sm bg-muted rounded-lg border text-text-primary text-center transition-colors ${
              invalidFrom
                ? 'border-destructive ring-2 ring-destructive/40'
                : openPicker === 'from'
                ? 'border-ring ring-2 ring-ring'
                : 'border-border'
            }`}
          >
            {rule.minMinutes}
          </button>
          {openPicker === 'from' && (
            <WheelPopover
              value={rule.minMinutes}
              min={0}
              max={60}
              onChange={(v) => onChange({ minMinutes: clampMinutes(v) })}
            />
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
              aria-invalid={invalidTo || undefined}
              className={`w-20 px-3 py-2.5 text-sm bg-muted rounded-lg border text-text-primary text-center transition-colors ${
                invalidTo
                  ? 'border-destructive ring-2 ring-destructive/40'
                  : openPicker === 'to'
                  ? 'border-ring ring-2 ring-ring'
                  : 'border-border'
              }`}
            >
              {rule.maxMinutes ?? ''}
            </button>
            {openPicker === 'to' && (
              <WheelPopover
                value={rule.maxMinutes ?? Math.min(rule.minMinutes + 1, 60)}
                min={0}
                max={60}
                onChange={(v) => onChange({ maxMinutes: clampMinutes(v) })}
              />
            )}
          </div>
        )}
        <span className="text-[11px] text-text-muted font-medium">min</span>
      </div>
      {error && (
        <div
          role="alert"
          className="mt-1 flex items-center gap-1 text-[11px] font-medium text-destructive"
        >
          <AlertTriangle size={11} />
          <span>{error}</span>
        </div>
      )}
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

const ORDER_TYPE_OPTIONS = [
  { key: 'dine-in', label: 'Dine In', headerLeft: 'DINE IN' },
  { key: 'take-out', label: 'Take Out', headerLeft: 'TAKE OUT' },
  { key: 'delivery', label: 'Delivery', headerLeft: 'DELIVERY' },
  { key: 'banquet', label: 'Banquet', headerLeft: 'BANQUET' },
  { key: 'drive-thru', label: 'Drive Thru', headerLeft: 'DRIVE THRU' },
  { key: 'curb-side', label: 'Curb Side', headerLeft: 'CURB SIDE' },
  { key: 'scheduled', label: 'Scheduled', headerLeft: 'SCHEDULED' },
  { key: 'phone-in', label: 'Phone In', headerLeft: 'PHONE-IN' },
  { key: 'custom', label: 'Custom', headerLeft: 'CUSTOM' },
] as const;
type PreviewTypeKey = typeof ORDER_TYPE_OPTIONS[number]['key'];

/** Glass View sample tickets matching each order type. */
const GLASS_PREVIEW_TICKET_IDS: Record<PreviewTypeKey, string> = {
  'dine-in': 't23',
  'take-out': 't45',
  delivery: 't36',
  banquet: 't42',
  'drive-thru': 't38',
  'curb-side': 't40',
  scheduled: 't49',
  'phone-in': 't47',
  custom: 't31',
};

export default function AgingEditPanel({ rule, isLast, onChange, errors }: AgingEditPanelProps) {
  const { orderTypeDetailedColors } = useKDSSettings();
  const [customHex, setCustomHex] = useState('');
  const [previewType, setPreviewType] = useState<PreviewTypeKey>('dine-in');
  const previewMeta = ORDER_TYPE_OPTIONS.find(o => o.key === previewType) ?? ORDER_TYPE_OPTIONS[0];
  const previewColors = orderTypeDetailedColors?.[previewType] ?? DEFAULT_ORDER_TYPE_DETAILED_COLORS[previewType];
  const contrast = getContrastRatio(rule.color, rule.textColor);
  const textColor = resolveTextColor(rule.textColor);

  // Build a preview ticket whose age lands inside the current rule so every
  // ticket variant applies this rule's color/text swatch automatically.
  const previewOrder = useMemo<Order>(() => {
    const ageMinutes = Math.max(0, rule.minMinutes) + 1;
    const timeReceived = new Date(Date.now() - ageMinutes * 60_000);
    return {
      ...previewTicket,
      orderType: previewType as OrderType,
      timeReceived,
      elapsedSeconds: ageMinutes * 60,
    };
  }, [rule.minMinutes, previewType]);

  return (
    <div className="space-y-4">
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

      {/* Status name + Time Range + Colour */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="w-40 shrink-0">
          <label className="text-[11px] font-semibold text-text-secondary mb-1 block uppercase tracking-wider">
            Status name
          </label>
          <input
            type="text"
            value={rule.label}
            onChange={(e) => onChange({ label: e.target.value })}
            maxLength={40}
            className="w-full px-3 py-2.5 text-sm bg-muted rounded-lg border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="shrink-0 min-w-[220px]">
          <TimeRangeField rule={rule} isLast={isLast} onChange={onChange} />
        </div>
        <div className="shrink-0 basis-full sm:basis-auto">
          <label className="text-[11px] font-semibold text-text-secondary mb-1 block uppercase tracking-wider">
            Color
          </label>
          <div className="flex items-center gap-2">
            <label
              className="relative w-10 h-10 rounded-lg border border-border overflow-hidden cursor-pointer shrink-0"
              style={{ backgroundColor: rule.color }}
            >
              <input
                type="color"
                value={rule.color}
                onChange={(e) => {
                  const hex = e.target.value.toUpperCase();
                  setCustomHex(hex);
                  onChange({ color: hex });
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Pick Status Color"
              />
            </label>
            <input
              type="text"
              value={customHex || rule.color}
              onChange={(e) => {
                const v = e.target.value;
                setCustomHex(v);
                if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange({ color: v.toUpperCase() });
              }}
              placeholder="#RRGGBB"
              maxLength={7}
              className="w-28 px-2 py-2 text-xs font-mono bg-muted rounded-lg border border-border text-text-primary uppercase focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="shrink-0 basis-full sm:basis-auto">
          <label className="text-[11px] font-semibold text-text-secondary mb-1 block uppercase tracking-wider">
            Text color
          </label>
          <div className="flex gap-1.5">
            {textColorOptions.map((tc) => (
              <button
                key={tc}
                onClick={() => onChange({ textColor: tc })}
                className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold capitalize transition-colors min-h-[36px] w-14 ${
                  rule.textColor === tc
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-text-secondary hover:bg-muted/80'
                }`}
              >
                {tc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live KDS Ticket Preview */}
      <div>
        <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
          Live Ticket Preview
        </label>
        <div className="flex flex-nowrap gap-1 mb-2 overflow-x-auto pb-1">
          {ORDER_TYPE_OPTIONS.map((opt) => {
            const optColor = (orderTypeDetailedColors?.[opt.key] ?? DEFAULT_ORDER_TYPE_DETAILED_COLORS[opt.key]).headerBg;
            return (
              <button
                key={opt.key}
                onClick={() => setPreviewType(opt.key)}
                className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all border ${
                  previewType === opt.key
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-muted text-text-secondary border-border hover:bg-muted/80'
                }`}
                style={previewType === opt.key ? { backgroundColor: optColor } : undefined}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <div className="rounded-lg overflow-hidden">
          <SelectedVariantPreview
            order={previewOrder}
            glassTicketId={GLASS_PREVIEW_TICKET_IDS[previewType] ?? 't23'}
            glassElapsedSeconds={(Math.max(0, rule.minMinutes) + 1) * 60}
          />
        </div>
      </div>
    </div>
  );
}

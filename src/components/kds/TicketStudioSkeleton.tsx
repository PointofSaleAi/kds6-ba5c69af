import { useLayoutEffect, useRef, useState } from 'react';
import { RotateCcw, Save, Check, Expand, X } from 'lucide-react';
import { SelectedVariantPreview } from './SelectedVariantPreview';

function ScaledKdsPreview() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const BASE_W = 1440;
  const BASE_H = 900;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / BASE_W, height / BASE_H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full h-full relative overflow-hidden bg-surface-bg">
      <div
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="absolute top-0 left-0"
      >
        <iframe
          src="/kds/v3"
          title="KDS preview"
          className="w-full h-full border-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

type Board = { id: string; name: string; subtitle: string; featured?: boolean };

const BOARDS: Board[] = [
  { id: 'main-prep', name: 'Main Prep', subtitle: 'Balanced service', featured: true },
  { id: 'expo-focus', name: 'Expo Focus', subtitle: 'Selected order' },
  { id: 'distance-grid', name: 'Distance Grid', subtitle: 'Across the kitchen' },
  { id: 'course-flow', name: 'Course Flow', subtitle: 'Coursed service' },
  { id: 'safety-queue', name: 'Safety Queue', subtitle: 'Allergen control', featured: true },
  { id: 'timeline-lanes', name: 'Timeline Lanes', subtitle: 'SLA workflow' },
  { id: 'rush-adaptive', name: 'Rush Adaptive', subtitle: 'Changing volume' },
  { id: 'dark-ops', name: 'Dark Ops', subtitle: 'Low light service', featured: true },
  { id: 'main-prep-classic', name: 'Main Prep Classic', subtitle: 'Detailed service' },
];

type SegOption = { value: string; label: string };

function Segmented({
  options, value, onChange,
}: { options: readonly SegOption[]; value: string; onChange: (v: string) => void }) {


  return (
    <div className="inline-flex rounded-full bg-muted p-0.5 gap-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-2.5 h-7 rounded-full text-[11px] font-semibold transition-colors ${
              active
                ? 'bg-foreground text-background shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-text-primary">{label}</div>
      {children}
    </div>
  );
}

export function TicketStudioSkeleton() {
  const [selectedBoard, setSelectedBoard] = useState('expo-focus');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [layout, setLayout] = useState<string>('standard');
  const [density, setDensity] = useState<string>('medium');
  const [textSize, setTextSize] = useState<string>('large');
  const [identifier, setIdentifier] = useState<string>('order');
  const [safety, setSafety] = useState<string>('highlighted');
  const [theme, setTheme] = useState<string>('light');
  const [station, setStation] = useState<string>('expediter');

  const board = BOARDS.find((b) => b.id === selectedBoard) ?? BOARDS[0];

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex gap-4 pb-2">
      {/* LEFT: preview + bottom board picker */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex-1 min-h-0 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-baseline gap-2 min-w-0">
              <h2 className="text-sm font-bold text-text-primary truncate">{board.name}</h2>
              <span className="text-xs text-text-secondary truncate">
                {board.subtitle} · Board 1 of {BOARDS.length}
              </span>
            </div>
            <button
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-2.5 py-1 shrink-0 hover:opacity-90 transition-opacity"
            >
              <Expand className="w-3 h-3" />
              <span className="text-[10px] font-semibold">Preview</span>
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto p-4 flex items-start justify-center bg-surface-bg">
            <div className="w-full max-w-[360px]">
              <SelectedVariantPreview />
            </div>
          </div>
        </div>


        {/* Bottom-left: layout selector — compact */}
        <div className="rounded-2xl border border-border bg-card px-3 py-2 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-bold text-text-primary">
              Choose from {BOARDS.length} boards
            </h3>
            <span className="text-[10px] text-text-secondary">Tap to preview</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {BOARDS.map((b) => {
              const active = b.id === selectedBoard;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBoard(b.id)}
                  className={`shrink-0 w-28 rounded-lg border-2 text-left transition-all ${
                    active
                      ? 'border-foreground shadow-sm'
                      : 'border-border hover:border-text-secondary'
                  }`}
                >
                  <div className="relative h-12 rounded-t-md bg-muted overflow-hidden">
                    {b.featured && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-bold">
                        ★
                      </div>
                    )}
                    {active && (
                      <div className="absolute top-1 left-1 rounded-full bg-foreground text-background text-[9px] px-1.5 py-0.5 font-semibold">
                        Selected
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5">
                    <div className="text-[11px] font-bold text-text-primary truncate leading-tight">{b.name}</div>
                    <div className="text-[10px] text-text-secondary truncate leading-tight">{b.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: personalize — adaptive width */}
      <aside className="w-[210px] md:w-[230px] lg:w-[260px] xl:w-[300px] 2xl:w-[340px] shrink-0 rounded-2xl border border-border bg-card flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold text-text-primary">Personalize</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-4 space-y-4">
          <Field label="Layout">
            <Segmented
              value={layout}
              onChange={setLayout}
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'standard', label: 'Standard' },
                { value: 'spacious', label: 'Spacious' },
              ]}
            />
          </Field>
          <Field label="Density">
            <Segmented
              value={density}
              onChange={setDensity}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </Field>
          <Field label="Text size">
            <Segmented
              value={textSize}
              onChange={setTextSize}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
              ]}
            />
          </Field>
          <Field label="Ticket identifier">
            <Segmented
              value={identifier}
              onChange={setIdentifier}
              options={[
                { value: 'order', label: 'Order #' },
                { value: 'guest', label: 'Guest' },
                { value: 'table', label: 'Table' },
              ]}
            />
          </Field>
          <Field label="Safety emphasis">
            <Segmented
              value={safety}
              onChange={setSafety}
              options={[
                { value: 'muted', label: 'Muted' },
                { value: 'bright', label: 'Bright' },
                { value: 'highlighted', label: 'Highlighted' },
              ]}
            />
          </Field>
          <Field label="Theme">
            <Segmented
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto' },
              ]}
            />
          </Field>
          <Field label="Station">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { value: 'expediter', label: 'Expediter' },
                  { value: 'bar', label: 'Bar' },
                  { value: 'prep-1', label: 'Prep 1' },
                  { value: 'prep-2', label: 'Prep 2' },
                ] as const
              ).map((o) => {
                const active = station === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() => setStation(o.value)}
                    className={`px-2.5 h-7 rounded-full text-[11px] font-semibold transition-colors ${
                      active
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
        <div className="border-t border-border p-3 space-y-1.5">
          <div className="flex gap-1.5">
            <button className="flex-1 h-8 rounded-full bg-muted text-[11px] font-semibold text-text-primary inline-flex items-center justify-center gap-1 hover:bg-muted/70 transition-colors">
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <button className="flex-1 h-8 rounded-full bg-muted text-[11px] font-semibold text-text-primary inline-flex items-center justify-center gap-1 hover:bg-muted/70 transition-colors">
              <Save className="w-3 h-3" />
              Save preset
            </button>
          </div>
          <button className="w-full h-9 rounded-full bg-[hsl(330_85%_55%)] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <Check className="w-3.5 h-3.5" />
            Apply to station
          </button>
        </div>
      </aside>

    </div>
  );
}

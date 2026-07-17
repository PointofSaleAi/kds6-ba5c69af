import { useLayoutEffect, useRef, useState } from 'react';
import { SlidersHorizontal, RotateCcw, Save, Check } from 'lucide-react';

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
    <div className="inline-flex rounded-full bg-muted p-1 gap-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-4 h-9 rounded-full text-xs font-semibold transition-colors ${
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
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-text-primary">{board.name}</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {board.subtitle} · Board 1 of {BOARDS.length}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Preview</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto p-6 flex items-start justify-center">
            <div className="rounded-xl border border-border bg-surface-bg p-4 w-full max-w-[420px]">
              <KDSSettingsPreviewScope route="v3">
                <OrderCardV2 order={previewTicket} />
              </KDSSettingsPreviewScope>

            </div>
          </div>
        </div>

        {/* Bottom-left: layout selector */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-primary">
              Choose from {BOARDS.length} boards
            </h3>
            <span className="text-xs text-text-secondary">Tap a layout to preview</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {BOARDS.map((b) => {
              const active = b.id === selectedBoard;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBoard(b.id)}
                  className={`shrink-0 w-40 rounded-xl border-2 text-left transition-all ${
                    active
                      ? 'border-foreground shadow-md'
                      : 'border-border hover:border-text-secondary'
                  }`}
                >
                  <div className="relative h-24 rounded-t-[10px] bg-muted overflow-hidden">
                    {b.featured && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-bold">
                        ★
                      </div>
                    )}
                    {active && (
                      <div className="absolute top-1.5 left-1.5 rounded-full bg-foreground text-background text-[10px] px-1.5 py-0.5 font-semibold">
                        Selected
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-text-primary truncate">{b.name}</div>
                    <div className="text-[11px] text-text-secondary truncate">{b.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: personalize */}
      <aside className="w-[320px] shrink-0 rounded-2xl border border-border bg-card flex flex-col">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <SlidersHorizontal className="w-4 h-4" />
          <h2 className="text-base font-bold text-text-primary">Personalize</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-5 space-y-5">
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
            <div className="flex flex-wrap gap-2">
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
                    className={`px-4 h-9 rounded-full text-xs font-semibold transition-colors ${
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
        <div className="border-t border-border p-4 space-y-2">
          <div className="flex gap-2">
            <button className="flex-1 h-10 rounded-full bg-muted text-xs font-semibold text-text-primary inline-flex items-center justify-center gap-1.5 hover:bg-muted/70 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button className="flex-1 h-10 rounded-full bg-muted text-xs font-semibold text-text-primary inline-flex items-center justify-center gap-1.5 hover:bg-muted/70 transition-colors">
              <Save className="w-3.5 h-3.5" />
              Save preset
            </button>
          </div>
          <button className="w-full h-11 rounded-full bg-[hsl(330_85%_55%)] text-white text-sm font-bold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Check className="w-4 h-4" />
            Apply to station
          </button>
        </div>
      </aside>
    </div>
  );
}

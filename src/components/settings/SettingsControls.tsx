import { useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';

export function SegmentedToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex w-full rounded-full p-0.5"
      style={{ background: 'hsl(var(--muted))' }}
    >
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors text-center whitespace-nowrap ${
              active
                ? 'bg-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary-foreground))] dark:bg-white dark:text-black'
                : 'bg-transparent text-[hsl(var(--text-secondary))]'
            }`}
            style={{ minHeight: 28 }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function SwitchToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked
          ? 'bg-[hsl(var(--primary))] dark:bg-white'
          : 'bg-[hsl(var(--border))]'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform shadow-sm ${
          checked ? 'bg-[hsl(var(--surface-card))] dark:bg-black' : 'bg-[hsl(var(--surface-card))]'
        }`}
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export function Stepper({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30"
        style={{ background: 'hsl(var(--muted))' }}
      >
        <Minus size={13} style={{ color: 'hsl(var(--text-primary))' }} />
      </button>
      <span
        className="w-7 text-center text-sm font-bold"
        style={{ color: 'hsl(var(--text-primary))' }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30"
        style={{ background: 'hsl(var(--muted))' }}
      >
        <Plus size={13} style={{ color: 'hsl(var(--text-primary))' }} />
      </button>
    </div>
  );
}

export function ValueText({ children }: { children: ReactNode }) {
  return (
    <span className="text-sm font-medium" style={{ color: 'hsl(var(--text-secondary))' }}>
      {children}
    </span>
  );
}

/**
 * Reads the URL hash on mount and route changes, then auto-clears it
 * after a brief highlight window so a row pulses when arrived at via search.
 */
export function useHashHighlight(): string | null {
  const location = useLocation();
  const routerHash = (location.hash || '').replace(/^#/, '') || null;
  const [hash, setHash] = useState<string | null>(routerHash);
  const [tick, setTick] = useState(0);

  // Re-apply hash whenever the router hash changes, even if it's the same value
  // (clicking the same link again should re-trigger the highlight/open).
  useEffect(() => {
    setHash(routerHash);
    setTick((t) => t + 1);
  }, [routerHash]);

  // Also support direct window hashchange (back/forward, manual edits).
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash.slice(1) || null);
      setTick((t) => t + 1);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => setHash(null), 2500);
    return () => clearTimeout(t);
  }, [hash, tick]);

  return hash;
}

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, Lock, Monitor, Tv2, MonitorSmartphone, Smartphone, type LucideIcon } from 'lucide-react';
import { useScreenMode, type ScreenMode } from '@/hooks/use-screen-mode';
import ManagerPinOverlay from './ManagerPinOverlay';
import { useLanguage } from '@/hooks/use-language';

interface ModeMeta {
  id: ScreenMode;
  label: string;
  description: string;
  Icon: LucideIcon;
}

function getModes(tui: (t: string) => string): ModeMeta[] {
  return [
    { id: 'pos', label: tui('Point of Sale'), description: tui('Full order taking, payments, and table management'), Icon: Monitor },
    { id: 'kds', label: tui('Kitchen Display System'), description: tui('Kitchen display for ticket management and fulfillment'), Icon: Tv2 },
    { id: 'cfd', label: tui('Customer Facing Display'), description: tui('Customer-facing display showing order and total'), Icon: MonitorSmartphone },
    { id: 'kiosk', label: tui('Self Service Kiosk'), description: tui('Self-service ordering for guests at the counter'), Icon: Smartphone },
  ];
}

/**
 * Screen Mode dropdown chip. Mirrors the POS mobile app switcher styling
 * so the KDS header stays consistent across surfaces.
 */
export function ScreenModeChip() {
  const { tui } = useLanguage();
  const [open, setOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<ScreenMode | null>(null);
  const { mode: currentMode, setMode } = useScreenMode();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const MODES = getModes(tui);
  const current = MODES.find((m) => m.id === currentMode) ?? MODES[0];
  const CurrentIcon = current.Icon;

  const handleSelect = (id: ScreenMode) => {
    setOpen(false);
    if (id === currentMode) return;
    setPendingMode(id);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 rounded-full bg-foreground/5 hover:bg-foreground/10 dark:bg-white/10 dark:hover:bg-white/15 text-foreground transition-colors"
        aria-label={tui("Screen Mode: {label}", { label: current.label })}
        title={current.label}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
        <CurrentIcon size={14} className="text-foreground/90" />
        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
      </button>

      {open && (
        <div className="fixed left-2 right-2 top-[52px] md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-72 bg-[#1C1C1E] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{tui('Screen Mode')}</p>
          </div>
          <div className="py-1">
            {MODES.map((m) => {
              const active = m.id === currentMode;
              const Icon = m.Icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m.id)}
                  className={`w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors ${active ? 'bg-white/[0.04]' : ''}`}
                >
                  <span
                    className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: '#525252' }}
                  >
                    <Icon size={16} className="text-white" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                      {m.label}
                      {active && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{m.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="px-4 py-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Lock className="w-3 h-3" />
            {tui('Manager PIN required to switch')}
          </div>
        </div>
      )}

      <ManagerPinOverlay
        open={pendingMode !== null}
        title={tui("Manager PIN Required")}
        subtitle={pendingMode ? tui('Enter PIN to switch to {label}', { label: MODES.find(m => m.id === pendingMode)?.label || '' }) : ''}
        onClose={() => setPendingMode(null)}
        onSuccess={() => {
          if (pendingMode) setMode(pendingMode);
          setPendingMode(null);
        }}
      />
    </div>
  );
}

export default ScreenModeChip;

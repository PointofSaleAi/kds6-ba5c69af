import { useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { useTrainingMode } from '@/hooks/use-training-mode';

const TEAL = '#1CA9A0';
const DARK_TEAL = '#06302D';

export function TrainingModeBar() {
  const { active, exit, reload } = useTrainingMode();

  // Push the rest of the UI down while the bar is visible.
  useEffect(() => {
    if (!active) return;
    document.documentElement.style.setProperty('--training-bar-h', '44px');
    return () => {
      document.documentElement.style.removeProperty('--training-bar-h');
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      role="region"
      aria-label="Training Mode"
      className="fixed top-0 left-0 right-0 z-[9997] flex items-center justify-between gap-3 px-4"
      style={{
        background: TEAL,
        color: DARK_TEAL,
        height: 44,
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <GraduationCap size={18} color={DARK_TEAL} />
        <span className="text-[13px] font-bold truncate">
          Training mode, sample orders only, nothing here is real
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={reload}
          className="h-8 px-3 rounded-md text-[12px] font-bold uppercase tracking-wide transition-colors"
          style={{
            background: 'rgba(6,48,45,0.12)',
            color: DARK_TEAL,
            border: `1px solid ${DARK_TEAL}`,
          }}
        >
          Reload samples
        </button>
        <button
          type="button"
          onClick={exit}
          className="h-8 px-3 rounded-md text-[12px] font-bold uppercase tracking-wide"
          style={{ background: DARK_TEAL, color: '#fff' }}
        >
          Exit training mode
        </button>
      </div>
    </div>
  );
}

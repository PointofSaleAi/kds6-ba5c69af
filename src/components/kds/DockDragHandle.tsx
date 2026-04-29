import { GripVertical, Lock, Unlock } from 'lucide-react';
import { useDockDrag } from './DockDragLayer';
import { useDockLayout, type DockPanel } from '@/hooks/use-dock-layout';

interface DockDragHandleProps {
  panel: DockPanel;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  ariaLabel?: string;
  showLock?: boolean;
}

/** 6-dot grip icon (2 cols x 3 rows) */
function SixDotGrip({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {[3, 8, 13].flatMap(cy => [3, 9].map(cx => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4" fill="currentColor" />
      )))}
    </svg>
  );
}

/**
 * Stacked control: 9-dot drag grip + lock toggle.
 * When locked, the grip is disabled and dragging cannot start.
 * Lock state persists per panel via useDockLayout.
 */
export function DockDragHandle({ panel, orientation = 'vertical', className = '', ariaLabel }: DockDragHandleProps) {
  const { startDrag, dragging } = useDockDrag();
  const { isLocked, toggleLock } = useDockLayout();
  const locked = isLocked(panel);
  const isActive = dragging === panel;

  // Stack vertically for side panels; horizontally for the bottom bar so the
  // controls fit naturally inline with the bar's row layout.
  const stackDir = orientation === 'vertical' ? 'flex-col' : 'flex-row';

  return (
    <div className={`flex ${stackDir} items-center gap-1 ${className}`}>
      <button
        type="button"
        disabled={locked}
        onPointerDown={(e) => {
          if (locked) return;
          e.preventDefault();
          startDrag(panel, e);
        }}
        aria-label={ariaLabel || 'Drag to re-dock'}
        className={`flex items-center justify-center select-none touch-none rounded-md transition-colors ${
          isActive ? 'bg-white/30' : locked ? 'opacity-40' : 'hover:bg-white/15'
        }`}
        style={{ cursor: locked ? 'not-allowed' : 'grab', minWidth: 24, minHeight: 24 }}
      >
        <Grid3x3 size={14} className="text-current opacity-80" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleLock(panel);
        }}
        aria-label={locked ? 'Unlock to allow re-docking' : 'Lock dock position'}
        className="flex items-center justify-center select-none rounded-md hover:bg-white/15 transition-colors"
        style={{ minWidth: 24, minHeight: 24 }}
      >
        {locked
          ? <Lock size={13} className="text-current opacity-80" />
          : <Unlock size={13} className="text-current opacity-90" />}
      </button>
    </div>
  );
}

import { GripHorizontal, GripVertical } from 'lucide-react';
import { useDockDrag } from './DockDragLayer';
import type { DockPanel } from '@/hooks/use-dock-layout';

interface DockDragHandleProps {
  panel: DockPanel;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  ariaLabel?: string;
}

/**
 * Small grip control that initiates a dock drag. Touch-friendly hit area.
 * Vertical orientation = grip used for side panels (drag horizontally to dock left/right).
 * Horizontal orientation = grip used for the bottom bar (drag vertically to dock top/bottom).
 */
export function DockDragHandle({ panel, orientation = 'vertical', className = '', ariaLabel }: DockDragHandleProps) {
  const { startDrag, dragging } = useDockDrag();
  const Icon = orientation === 'vertical' ? GripVertical : GripHorizontal;
  const isActive = dragging === panel;

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        startDrag(panel, e);
      }}
      aria-label={ariaLabel || 'Drag to re-dock'}
      className={`flex items-center justify-center select-none touch-none rounded-md transition-colors ${
        isActive ? 'bg-white/30' : 'hover:bg-white/15'
      } ${className}`}
      style={{ cursor: 'grab', minWidth: 24, minHeight: 24 }}
    >
      <Icon size={14} className="text-current opacity-70" />
    </button>
  );
}

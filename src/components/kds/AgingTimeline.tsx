import { useRef, useState, useCallback } from 'react';
import type { StatusRule } from '@/hooks/use-status-rules';

interface AgingTimelineProps {
  rules: StatusRule[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBoundaryDrag: (ruleId: string, newMax: number) => void;
  maxMinutes: number;
}

export default function AgingTimeline({ rules, selectedId, onSelect, onBoundaryDrag, maxMinutes }: AgingTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ ruleId: string; x: number } | null>(null);

  const getMinuteFromX = useCallback((clientX: number): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * maxMinutes);
  }, [maxMinutes]);

  const handlePointerDown = (ruleId: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(ruleId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const minute = getMinuteFromX(e.clientX);
    const rule = rules.find(r => r.id === dragging);
    if (rule && minute > rule.minMinutes && minute < maxMinutes) {
      onBoundaryDrag(dragging, minute);
    }
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  const resolveTextColor = (tc: string) =>
    tc === 'white' ? '#FFFFFF' : tc === 'black' ? '#000000' : '#6C7A89';

  return (
    <div className="space-y-2 px-1">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Timeline</h3>
        <span className="text-[10px] text-text-muted">Drag Boundaries to Adjust</span>
      </div>

      <div
        ref={trackRef}
        className="relative h-9 rounded-lg overflow-visible flex cursor-pointer select-none mx-1"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => { setHoverInfo(null); handlePointerUp(); }}
      >
        {rules.map((rule, i) => {
          const start = rule.minMinutes;
          const end = rule.maxMinutes ?? maxMinutes;
          const width = ((end - start) / maxMinutes) * 100;
          const isSelected = selectedId === rule.id;
          const textColor = resolveTextColor(rule.textColor);
          const isLast = i === rules.length - 1;

          return (
            <div key={rule.id} className="relative flex" style={{ width: `${Math.max(width, 5)}%` }}>
              {/* Segment */}
              <button
                onClick={() => onSelect(rule.id)}
                onMouseEnter={(e) => setHoverInfo({ ruleId: rule.id, x: e.clientX })}
                onMouseLeave={() => setHoverInfo(null)}
                className={`flex-1 flex items-center justify-center gap-1.5 transition-all px-1 ${
                  isSelected ? 'ring-2 ring-ring ring-offset-2 ring-offset-background z-10' : ''
                } ${i === 0 ? 'rounded-l-lg' : ''} ${isLast ? 'rounded-r-lg' : ''}`}
                style={{ backgroundColor: rule.color, color: textColor }}
              >
                <span className="text-[10px] font-bold leading-none whitespace-nowrap">
                  {rule.maxMinutes !== null ? `${start}-${end}m` : `${start}m+`}
                </span>
                <span className="text-[9px] font-medium opacity-80 truncate">
                  {rule.label}
                </span>
              </button>

              {/* Drag handle (not on last segment) */}
              {!isLast && rule.maxMinutes !== null && (
                <div
                  onPointerDown={handlePointerDown(rule.id)}
                  className={`absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20 flex items-center justify-center translate-x-1/2 group ${
                    dragging === rule.id ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                  } transition-opacity`}
                >
                  <div className="w-1 h-8 rounded-full bg-background shadow-md border border-border group-hover:bg-ring group-active:bg-ring" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Minute markers */}
      <div className="flex justify-between px-1">
        {[0, Math.round(maxMinutes * 0.25), Math.round(maxMinutes * 0.5), Math.round(maxMinutes * 0.75), maxMinutes].map((m) => (
          <span key={m} className="text-[9px] text-text-muted font-medium">{m}m</span>
        ))}
      </div>

      {/* Hover tooltip */}
      {hoverInfo && !dragging && (() => {
        const rule = rules.find(r => r.id === hoverInfo.ruleId);
        if (!rule) return null;
        return (
          <div className="text-[10px] text-text-secondary text-center mt-1 font-medium">
            {rule.label}: {rule.minMinutes}-{rule.maxMinutes ?? '∞'} min
          </div>
        );
      })()}
    </div>
  );
}

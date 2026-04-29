import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useDockLayout, type DockPanel, type DockEdge } from '@/hooks/use-dock-layout';

type DragState = {
  panel: DockPanel;
  pointerId: number;
} | null;

interface DockDragContextValue {
  startDrag: (panel: DockPanel, e: React.PointerEvent) => void;
  dragging: DockPanel | null;
}

const DockDragContext = createContext<DockDragContextValue | null>(null);

const EDGE_THRESHOLD = 80; // px from each edge counts as a drop zone

function edgeForPanelAt(panel: DockPanel, x: number, y: number, w: number, h: number): DockEdge | null {
  if (panel === 'bottomBar') {
    if (y <= EDGE_THRESHOLD) return 'top';
    if (y >= h - EDGE_THRESHOLD) return 'bottom';
    return null;
  }
  if (x <= EDGE_THRESHOLD) return 'left';
  if (x >= w - EDGE_THRESHOLD) return 'right';
  return null;
}

export function DockDragLayer({ children }: { children: ReactNode }) {
  const { setDock } = useDockLayout();
  const [drag, setDrag] = useState<DragState>(null);
  const [hoverEdge, setHoverEdge] = useState<DockEdge | null>(null);
  const dragRef = useRef<DragState>(null);

  useEffect(() => { dragRef.current = drag; }, [drag]);

  const startDrag = useCallback<DockDragContextValue['startDrag']>((panel, e) => {
    setDrag({ panel, pointerId: e.pointerId });
    setHoverEdge(null);
  }, []);

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const edge = edgeForPanelAt(cur.panel, e.clientX, e.clientY, w, h);
      setHoverEdge(prev => (prev === edge ? prev : edge));
    };

    const onUp = (e: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const edge = edgeForPanelAt(cur.panel, e.clientX, e.clientY, w, h);
      if (edge) setDock(cur.panel, edge);
      setDrag(null);
      setHoverEdge(null);
    };

    const onCancel = () => {
      setDrag(null);
      setHoverEdge(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [drag, setDock]);

  const value = useMemo<DockDragContextValue>(() => ({
    startDrag,
    dragging: drag ? drag.panel : null,
  }), [drag, startDrag]);

  const isSidePanel = drag && drag.panel !== 'bottomBar';
  const isBar = drag && drag.panel === 'bottomBar';

  return (
    <DockDragContext.Provider value={value}>
      {children}
      {drag && (
        <div className="pointer-events-none fixed inset-0 z-[200]" aria-hidden>
          {isSidePanel && (
            <>
              <div
                className="absolute top-0 left-0 bottom-0 transition-colors"
                style={{
                  width: EDGE_THRESHOLD,
                  background: hoverEdge === 'left' ? 'hsl(var(--brand-primary) / 0.35)' : 'hsl(var(--brand-primary) / 0.12)',
                  borderRight: '2px dashed hsl(var(--brand-primary) / 0.6)',
                }}
              />
              <div
                className="absolute top-0 right-0 bottom-0 transition-colors"
                style={{
                  width: EDGE_THRESHOLD,
                  background: hoverEdge === 'right' ? 'hsl(var(--brand-primary) / 0.35)' : 'hsl(var(--brand-primary) / 0.12)',
                  borderLeft: '2px dashed hsl(var(--brand-primary) / 0.6)',
                }}
              />
            </>
          )}
          {isBar && (
            <>
              <div
                className="absolute top-0 left-0 right-0 transition-colors"
                style={{
                  height: EDGE_THRESHOLD,
                  background: hoverEdge === 'top' ? 'hsl(var(--brand-primary) / 0.35)' : 'hsl(var(--brand-primary) / 0.12)',
                  borderBottom: '2px dashed hsl(var(--brand-primary) / 0.6)',
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 transition-colors"
                style={{
                  height: EDGE_THRESHOLD,
                  background: hoverEdge === 'bottom' ? 'hsl(var(--brand-primary) / 0.35)' : 'hsl(var(--brand-primary) / 0.12)',
                  borderTop: '2px dashed hsl(var(--brand-primary) / 0.6)',
                }}
              />
            </>
          )}
        </div>
      )}
    </DockDragContext.Provider>
  );
}

export function useDockDrag(): DockDragContextValue {
  const ctx = useContext(DockDragContext);
  if (!ctx) throw new Error('useDockDrag must be used within DockDragLayer');
  return ctx;
}

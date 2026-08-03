import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Scales its content down so it always fits the available box — the settings
 * ticket preview must never scroll.
 */
export function PreviewFitBox({ children, maxScale = 1 }: { children: ReactNode; maxScale?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;

    const measure = () => {
      const bh = box.clientHeight;
      const bw = box.clientWidth;
      const ch = content.offsetHeight;
      const cw = content.offsetWidth;
      if (!bh || !ch || !bw || !cw) return;
      setScale(Math.min(maxScale, bh / ch, bw / cw));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(content);
    return () => ro.disconnect();
  }, [maxScale]);

  return (
    <div ref={boxRef} className="flex-1 min-h-0 overflow-hidden flex items-start justify-center">
      <div ref={contentRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        {children}
      </div>
    </div>
  );
}

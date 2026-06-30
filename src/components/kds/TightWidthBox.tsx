import { useCallback, useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

/**
 * Renders a primary text block at its natural width, then sizes a sibling
 * secondary block to the widest rendered line of the primary. Used to right-align
 * RTL secondary text (e.g. Arabic) to the primary text's actual right edge.
 */
export function TightWidthBox({
  primary,
  secondary,
  deps = [],
  className,
  style,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  deps?: unknown[];
  className?: string;
  style?: CSSProperties;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const primaryRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const el = primaryRef.current;
    if (!el) return;
    try {
      let max = 0;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const text = (node as Text).nodeValue ?? '';
        if (text.trim().length > 0) {
          const range = document.createRange();
          range.selectNodeContents(node);
          const rects = range.getClientRects();
          for (let i = 0; i < rects.length; i++) {
            if (rects[i].width > max) max = rects[i].width;
          }
          range.detach?.();
        }
        node = walker.nextNode();
      }
      if (max > 0) setWidth(Math.ceil(max));
    } catch {
      /* noop */
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && wrapperRef.current?.parentElement) {
      ro = new ResizeObserver(() => measure());
      ro.observe(wrapperRef.current.parentElement);
    }
    const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
    fonts?.ready?.then(() => measure());
    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps]);

  return (
    <div ref={wrapperRef} className={className} style={{ minWidth: 0, ...style }}>
      <div ref={primaryRef} style={{ maxWidth: '100%' }}>{primary}</div>
      {secondary && (
        <div style={{ width, maxWidth: '100%' }}>{secondary}</div>
      )}
    </div>
  );
}

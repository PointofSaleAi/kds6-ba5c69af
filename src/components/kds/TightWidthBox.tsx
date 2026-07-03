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
  constrainSecondary = true,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  deps?: unknown[];
  className?: string;
  style?: CSSProperties;
  /** When false, secondary wraps to the full available width instead of the primary text's rendered width. */
  constrainSecondary?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const primaryRef = useRef<HTMLDivElement | null>(null);
  const [primaryLineWidth, setPrimaryLineWidth] = useState<number | undefined>(undefined);

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
      setPrimaryLineWidth(max > 0 ? Math.ceil(max) : undefined);
    } catch {
      /* noop */
    }
  }, []);

  useLayoutEffect(() => {
    setPrimaryLineWidth(undefined);
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
    <div
      ref={wrapperRef}
      className={className}
      style={{
        minWidth: 0,
        width: primaryLineWidth ? `${primaryLineWidth}px` : 'max-content',
        maxWidth: '100%',
        alignSelf: 'flex-start',
        ...style,
      }}
    >
      <div
        ref={primaryRef}
        style={{ width: primaryLineWidth ? `${primaryLineWidth}px` : 'max-content', maxWidth: '100%' }}
      >
        {primary}
      </div>
      {secondary && (
        <div
          style={
            constrainSecondary
              ? { minWidth: primaryLineWidth, width: 'max-content', maxWidth: '100%' }
              : { maxWidth: '100%' }
          }
        >
          {secondary}
        </div>
      )}
    </div>
  );
}

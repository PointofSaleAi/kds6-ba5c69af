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
  expandSecondaryToContent = false,
  alignSecondaryEnd = false,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  deps?: unknown[];
  className?: string;
  style?: CSSProperties;
  /** When false, secondary wraps to the full available width instead of the primary text's rendered width. */
  constrainSecondary?: boolean;
  /** When true, secondary content such as inline allergen chips can use the full available line width. */
  expandSecondaryToContent?: boolean;
  /** When true, keep the secondary block's right edge aligned to the primary text's right edge. */
  alignSecondaryEnd?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const primaryRef = useRef<HTMLDivElement | null>(null);
  const secondaryRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [secondaryWidth, setSecondaryWidth] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    if (!constrainSecondary) return;
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
      if (alignSecondaryEnd && secondaryRef.current) {
        setSecondaryWidth(Math.ceil(secondaryRef.current.getBoundingClientRect().width));
      }
    } catch {
      /* noop */
    }
  }, [alignSecondaryEnd, constrainSecondary]);

  const alignEndOffset = alignSecondaryEnd && width && secondaryWidth && secondaryWidth > width
    ? width - secondaryWidth
    : undefined;

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
        <div
          ref={secondaryRef}
          style={
            constrainSecondary && !expandSecondaryToContent
              ? { minWidth: width, width: 'max-content', maxWidth: '100%', marginLeft: alignEndOffset, '--tight-primary-width': width ? `${width}px` : undefined } as CSSProperties
              : { maxWidth: '100%', '--tight-primary-width': width ? `${width}px` : undefined } as CSSProperties
          }
        >
          {secondary}
        </div>
      )}
    </div>
  );
}

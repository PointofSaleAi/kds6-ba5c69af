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
    const wrapper = wrapperRef.current;
    if (!el) return;
    const availableWidth = wrapper?.parentElement?.getBoundingClientRect().width ?? 0;
    const previousWrapperWidth = wrapper?.style.width;
    const previousWrapperMaxWidth = wrapper?.style.maxWidth;
    const previousPrimaryWidth = el.style.width;
    const previousPrimaryMaxWidth = el.style.maxWidth;
    try {
      if (wrapper) {
        wrapper.style.width = 'max-content';
        wrapper.style.maxWidth = 'none';
      }
      el.style.width = 'max-content';
      el.style.maxWidth = 'none';

      const naturalWidth = Math.ceil(el.getBoundingClientRect().width);
      const targetWidth = availableWidth > 0 && naturalWidth > availableWidth
        ? (() => {
          if (wrapper) {
            wrapper.style.width = `${availableWidth}px`;
            wrapper.style.maxWidth = '100%';
          }
          el.style.width = `${availableWidth}px`;
          el.style.maxWidth = '100%';

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
          return max > 0 ? Math.ceil(max) : naturalWidth;
        })()
        : naturalWidth;

      setPrimaryLineWidth(targetWidth > 0 ? targetWidth : undefined);
    } catch {
      /* noop */
    } finally {
      if (wrapper) {
        wrapper.style.width = previousWrapperWidth ?? '';
        wrapper.style.maxWidth = previousWrapperMaxWidth ?? '';
      }
      el.style.width = previousPrimaryWidth;
      el.style.maxWidth = previousPrimaryMaxWidth;
    }
  }, []);

  useLayoutEffect(() => {
    if (!secondary) {
      // No secondary block: don't tighten primary — let it flow to the
      // available width so product names use the full row instead of
      // wrapping character-by-character.
      setPrimaryLineWidth(undefined);
      return;
    }
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
  }, [measure, secondary, ...deps]);


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

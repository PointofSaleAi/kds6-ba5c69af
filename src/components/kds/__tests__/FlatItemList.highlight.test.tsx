import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { FlatItemList } from '../FlatItemList';
import { LanguageProvider } from '@/hooks/use-language';
import type { CourseGroup } from '@/types/kds';
import type { ItemStatus } from '../CourseSection';

/**
 * Visual regression: tapped item rows must use ONLY the very-light-green tint
 * (rgba(29, 158, 117, 0.10)) with no dark overlay and no text color mutation.
 * Guards against regressions to the old dark backgrounds (#1E2438 / #161B28)
 * or strikethrough/dim styling on tap.
 */

const ITEM_ID = 'itm-1';

const courses: CourseGroup[] = [
  {
    course: 'ENTREE',
    items: [
      {
        id: ITEM_ID,
        name: 'Osso Buco',
        quantity: 1,
        modifiers: [],
        allergens: [],
      },
    ],
  },
];

function renderList(itemStatuses: Map<string, ItemStatus>, onAdvanceItem = vi.fn()) {
  return render(
    <LanguageProvider>
      <FlatItemList
        courses={courses}
        itemStatuses={itemStatuses}
        onAdvanceItem={onAdvanceItem}
        onUndoItem={vi.fn()}
      />
    </LanguageProvider>
  );
}

/** The exact highlight color spec — keep in sync with FlatItemList / CourseSection */
const HIGHLIGHT_RGBA = 'rgba(29, 158, 117, 0.10)';
/** Old dark backgrounds we must NEVER apply on tap */
const FORBIDDEN_BGS = new Set(['#1E2438', '#161B28', 'rgb(30, 36, 56)', 'rgb(22, 27, 40)']);

function getItemRowRoot(container: HTMLElement): HTMLElement {
  // The row root is the outer div wrapping the tappable inner; first child of px-2 wrapper
  const wrapper = container.querySelector('.px-2');
  expect(wrapper).toBeTruthy();
  const row = wrapper!.firstElementChild as HTMLElement;
  expect(row).toBeTruthy();
  return row;
}

describe('FlatItemList tap highlight (visual regression)', () => {
  it('queued row has no background tint by default', () => {
    const { container } = renderList(new Map());
    const row = getItemRowRoot(container);
    const bg = row.style.backgroundColor;
    // Either empty string or transparent; never the forbidden dark colors
    expect(FORBIDDEN_BGS.has(bg)).toBe(false);
  });

  it('preparing (seen) row uses ONLY rgba(29, 158, 117, 0.10) — no dark overlay', () => {
    const statuses = new Map<string, ItemStatus>([[ITEM_ID, 'preparing']]);
    const { container } = renderList(statuses);
    const row = getItemRowRoot(container);

    // Background must be the light-green tint, never the legacy dark
    expect(row.style.backgroundColor).toBe(HIGHLIGHT_RGBA);
    expect(FORBIDDEN_BGS.has(row.style.backgroundColor)).toBe(false);

    // No row-level opacity dimming on seen
    expect(row.style.opacity === '' || row.style.opacity === '1').toBe(true);
  });

  it('done row uses ONLY rgba(29, 158, 117, 0.10) — no dark overlay, no strikethrough, no dim', () => {
    const statuses = new Map<string, ItemStatus>([[ITEM_ID, 'done']]);
    const { container } = renderList(statuses);
    const row = getItemRowRoot(container);

    expect(row.style.backgroundColor).toBe(HIGHLIGHT_RGBA);
    expect(FORBIDDEN_BGS.has(row.style.backgroundColor)).toBe(false);

    // No fade
    expect(row.style.opacity === '' || row.style.opacity === '1').toBe(true);

    // Item name must not be strikethrough and must keep the default text color (no #888888)
    const nameEl = row.querySelector('span.uppercase') as HTMLElement | null;
    expect(nameEl).toBeTruthy();
    const nameClasses = nameEl!.className;
    expect(nameClasses).not.toMatch(/line-through/);
    expect(nameEl!.style.color === '' || nameEl!.style.color !== 'rgb(136, 136, 136)').toBe(true);

    // Quantity color must not be the legacy #555555
    const qtyEl = row.querySelector('span.font-normal') as HTMLElement | null;
    expect(qtyEl).toBeTruthy();
    expect(qtyEl!.style.color === '' || qtyEl!.style.color !== 'rgb(85, 85, 85)').toBe(true);
  });

  it('tapping a queued row applies the light-green highlight on next render', () => {
    const onAdvance = vi.fn();
    const statuses = new Map<string, ItemStatus>();
    const { container, rerender } = renderList(statuses, onAdvance);

    const row = getItemRowRoot(container);
    const inner = row.querySelector('.cursor-pointer') as HTMLElement;
    expect(inner).toBeTruthy();

    act(() => {
      fireEvent.click(inner);
    });
    // Single-tap timer (250ms) — flush
    act(() => {
      vi.useFakeTimers();
    });
    vi.useRealTimers();

    expect(onAdvance).toBeDefined();

    // Simulate parent advancing status to 'preparing' and re-render
    rerender(
      <LanguageProvider>
        <FlatItemList
          courses={courses}
          itemStatuses={new Map([[ITEM_ID, 'preparing']])}
          onAdvanceItem={onAdvance}
          onUndoItem={vi.fn()}
        />
      </LanguageProvider>
    );

    const advancedRow = getItemRowRoot(container);
    expect(advancedRow.style.backgroundColor).toBe(HIGHLIGHT_RGBA);
    expect(FORBIDDEN_BGS.has(advancedRow.style.backgroundColor)).toBe(false);
  });
});

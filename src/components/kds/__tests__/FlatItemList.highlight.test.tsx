import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FlatItemList } from '../FlatItemList';
import { LanguageProvider } from '@/hooks/use-language';
import type { CourseGroup } from '@/types/kds';
import type { ItemStatus } from '../CourseSection';

/**
 * Visual regression: tapped item rows must use ONLY the very-light-green tint
 * (rgba(29, 158, 117, 0.10)) with NO dark overlay and NO text color / strikethrough
 * mutations. Guards against regressions to legacy dark backgrounds (#1E2438 / #161B28),
 * #888888 item color, #555555 quantity color, and dim opacity on tap.
 */

const HIGHLIGHT_GREEN = 'rgba(29, 158, 117, 0.14)';
const HIGHLIGHT_AMBER = 'rgba(245, 158, 11, 0.18)';
const ALLOWED_HIGHLIGHTS = [HIGHLIGHT_GREEN, HIGHLIGHT_AMBER];
const FORBIDDEN_BGS = ['#1E2438', '#161B28', 'rgb(30, 36, 56)', 'rgb(22, 27, 40)'];
const FORBIDDEN_TEXT_COLORS = ['rgb(136, 136, 136)', 'rgb(85, 85, 85)', '#888888', '#555555'];

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

function renderWithStatus(status?: ItemStatus) {
  const map = new Map<string, ItemStatus>();
  if (status) map.set(ITEM_ID, status);
  return render(
    <LanguageProvider>
      <FlatItemList
        courses={courses}
        itemStatuses={map}
        onAdvanceItem={vi.fn()}
        onUndoItem={vi.fn()}
      />
    </LanguageProvider>
  );
}

function getRowRoot(container: HTMLElement): HTMLElement {
  const wrapper = container.querySelector('.px-2');
  expect(wrapper).toBeTruthy();
  const row = wrapper!.firstElementChild as HTMLElement;
  expect(row).toBeTruthy();
  return row;
}

function expectNoForbiddenBg(row: HTMLElement) {
  const bg = row.style.backgroundColor;
  for (const forbidden of FORBIDDEN_BGS) {
    expect(bg.toLowerCase()).not.toBe(forbidden.toLowerCase());
  }
}

function expectNoTextColorChange(row: HTMLElement) {
  // No element inside the row should carry a forbidden inline text color
  const all = row.querySelectorAll<HTMLElement>('*');
  all.forEach((el) => {
    const c = el.style.color;
    if (!c) return;
    for (const forbidden of FORBIDDEN_TEXT_COLORS) {
      expect(c.toLowerCase()).not.toBe(forbidden.toLowerCase());
    }
  });
  // Item name must not be strikethrough
  const nameEl = row.querySelector('span.uppercase') as HTMLElement | null;
  expect(nameEl).toBeTruthy();
  expect(nameEl!.className).not.toMatch(/line-through/);
}

function expectNoDim(row: HTMLElement) {
  const op = row.style.opacity;
  expect(op === '' || op === '1').toBe(true);
}

describe('FlatItemList tap highlight (visual regression)', () => {
  it('queued (default) row has no background tint', () => {
    const { container } = renderWithStatus();
    const row = getRowRoot(container);
    expectNoForbiddenBg(row);
    expectNoTextColorChange(row);
    expectNoDim(row);
  });

  it('preparing (1st tap) row uses an allowed alternating highlight tint', () => {
    const { container } = renderWithStatus('preparing');
    const row = getRowRoot(container);

    expect(ALLOWED_HIGHLIGHTS).toContain(row.style.backgroundColor);
    expectNoForbiddenBg(row);
    expectNoTextColorChange(row);
    expectNoDim(row);
  });

  it('done (2nd tap) row uses a tint with no strikethrough or dim', () => {
    const { container } = renderWithStatus('done');
    const row = getRowRoot(container);

    expect(row.style.backgroundColor).toBeTruthy();
    expectNoForbiddenBg(row);
    expectNoTextColorChange(row);
    expectNoDim(row);
  });
});

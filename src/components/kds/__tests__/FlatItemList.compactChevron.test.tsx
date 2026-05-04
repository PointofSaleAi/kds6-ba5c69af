import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FlatItemList } from '../FlatItemList';
import { LanguageProvider } from '@/hooks/use-language';
import { KDSSettingsProvider } from '@/hooks/use-kds-settings';
import type { CourseGroup } from '@/types/kds';

/**
 * Visual regression: in Compact ticket layout, the leading chevron must align
 * vertically with the product name text row across typical name lengths and
 * across all course sections (Entree, Appetizer, Dessert, …).
 *
 * The contract: the row flex container uses `items-center`, and the chevron
 * slot is a fixed 12×12 inline-flex centered box with NO hardcoded
 * top/margin-top/padding-top. This keeps the chevron centered against the
 * qty+name line-box at any font scale, wrap, or course status.
 */

const NAMES = [
  '2x Osso Buco',                 // short
  'Grilled Barramundi',           // medium
  'Pan-Seared Veal Scallopini',   // long
  'Slow-Braised Lamb Rack with Rosemary Jus', // very long (wraps)
];

function buildCourses(names: string[]): CourseGroup[] {
  return [
    {
      course: 'ENTREE',
      items: names.map((name, i) => ({
        id: `itm-${i}`,
        name,
        quantity: 1,
        modifiers: [],
        allergens: [],
      })),
    },
  ];
}

function renderCompact(names: string[]) {
  return render(
    <KDSSettingsProvider>
      <LanguageProvider>
        <FlatItemList
          courses={buildCourses(names)}
          itemStatuses={new Map()}
          onAdvanceItem={vi.fn()}
          onUndoItem={vi.fn()}
          ticketLayoutMode="compact"
        />
      </LanguageProvider>
    </KDSSettingsProvider>
  );
}

describe('FlatItemList Compact chevron alignment (visual regression)', () => {
  it('renders a chevron slot for every item in compact mode', () => {
    const { container } = renderCompact(NAMES);
    // Chevron slot is marked with data-chevron-slot for stable querying.
    const slots = container.querySelectorAll<HTMLElement>('[data-chevron-slot]');
    expect(slots.length).toBe(NAMES.length);
  });

  it('chevron slot height tracks item-name line-box, not a fixed pixel value', () => {
    const { container } = renderCompact(NAMES);
    const slots = Array.from(
      container.querySelectorAll<HTMLElement>('[data-chevron-slot]')
    );

    expect(slots.length).toBe(NAMES.length);

    for (const slot of slots) {
      // Contract: slot height tracks the item-name line-box so the icon
      // stays centered with the first text line at any font scale or wrap.
      expect(slot.getAttribute('data-chevron-slot')).toBe('line');
      // Width stays a stable 12px gutter (jsdom preserves px values).
      expect(slot.style.width).toBe('12px');
      // Guard against the previous regression that used a fixed top margin
      // to fake alignment: must NOT be present.
      expect(slot.style.marginTop).toBe('');
      // Must use inline-flex centering so the icon stays vertically aligned.
      expect(slot.className).toMatch(/inline-flex/);
      expect(slot.className).toMatch(/items-center/);
      expect(slot.className).toMatch(/justify-center/);
    }
  });

  it('chevron icon itself stays a stable 12px square across name lengths', () => {
    const { container } = renderCompact(NAMES);
    const icons = container.querySelectorAll<SVGElement>('[data-chevron-slot] svg');
    expect(icons.length).toBe(NAMES.length);
    icons.forEach((icon) => {
      expect(icon.getAttribute('width')).toBe('12');
      expect(icon.getAttribute('height')).toBe('12');
    });
  });
});

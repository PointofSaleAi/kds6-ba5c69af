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

  it('chevron slot is a stable 12x12 box with no hardcoded top offsets', () => {
    const { container } = renderCompact(NAMES);
    const slots = Array.from(
      container.querySelectorAll<HTMLElement>('[data-chevron-slot]')
    );

    expect(slots.length).toBe(NAMES.length);

    for (const slot of slots) {
      expect(slot.getAttribute('data-chevron-slot')).toBe('line');
      // Fixed 12x12 gutter — no line-height-derived height.
      expect(slot.style.width).toBe('12px');
      expect(slot.style.height).toBe('12px');
      // Guard against any hardcoded top offsets on the chevron itself.
      expect(slot.style.marginTop).toBe('');
      expect(slot.style.paddingTop).toBe('');
      expect(slot.style.top).toBe('');
      // Must use inline-flex centering so the icon stays vertically aligned.
      expect(slot.className).toMatch(/inline-flex/);
      expect(slot.className).toMatch(/items-center/);
      expect(slot.className).toMatch(/justify-center/);
    }
  });

  it('row flex container uses items-center so chevron centers against the name line', () => {
    const { container } = renderCompact(NAMES);
    const slots = Array.from(
      container.querySelectorAll<HTMLElement>('[data-chevron-slot]')
    );
    for (const slot of slots) {
      const row = slot.parentElement as HTMLElement;
      expect(row.className).toMatch(/items-center/);
      expect(row.className).not.toMatch(/items-start/);
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

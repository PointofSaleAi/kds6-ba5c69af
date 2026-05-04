import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CourseSection } from '../CourseSection';
import { LanguageProvider } from '@/hooks/use-language';
import { KDSSettingsProvider } from '@/hooks/use-kds-settings';
import type { CourseGroup } from '@/types/kds';

/**
 * Visual regression: in Compact ticket layout, the leading chevron in
 * CourseSection product rows must align vertically with the product name
 * across typical name lengths and across all course sections (Entree,
 * Appetizer, Dessert, ...).
 *
 * Contract: row flex container uses `items-center`, chevron slot is a
 * fixed 12x12 inline-flex centered box with NO hardcoded
 * top/margin-top/padding-top.
 */

const NAMES = [
  'Soup',                                 // short
  'Grilled Barramundi',                   // medium
  'Chicken Caesar Wrap',                  // medium-long
  'Slow-Braised Lamb Rack with Rosemary', // very long
];

function buildCourse(course: 'APPETIZER' | 'ENTREE' | 'DESSERT', names: string[]): CourseGroup {
  return {
    course,
    items: names.map((name, i) => ({
      id: `${course}-${i}`,
      name,
      quantity: 1,
      modifiers: [],
      // Force `hasDetails` true so both chevron variants render in the suite.
      allergens: [{ type: 'gluten' as const, label: 'GLUTEN', icon: '' }],
    })),
  };
}

function renderCompact(course: string) {
  return render(
    <KDSSettingsProvider>
      <LanguageProvider>
        <CourseSection
          courseGroup={buildCourse(course, NAMES)}
          itemStatuses={new Map()}
          onAdvanceItem={vi.fn()}
          onUndoItem={vi.fn()}
          lifecycleStatus="active"
          ticketLayoutMode="compact"
        />
      </LanguageProvider>
    </KDSSettingsProvider>
  );
}

const COURSES = ['ENTREE', 'APPETIZER', 'DESSERT'];

describe('CourseSection Compact chevron alignment (visual regression)', () => {
  for (const course of COURSES) {
    it(`renders a stable centered chevron slot for every item in ${course}`, () => {
      const { container } = renderCompact(course);
      const slots = Array.from(
        container.querySelectorAll<HTMLElement>('[data-chevron-slot]')
      );
      expect(slots.length).toBe(NAMES.length);

      for (const slot of slots) {
        expect(slot.getAttribute('data-chevron-slot')).toBe('line');
        expect(slot.style.width).toBe('12px');
        expect(slot.style.height).toBe('12px');
        // Guard against any hardcoded top offsets on the chevron itself.
        expect(slot.style.marginTop).toBe('');
        expect(slot.style.paddingTop).toBe('');
        expect(slot.style.top).toBe('');
        expect(slot.className).toMatch(/inline-flex/);
        expect(slot.className).toMatch(/items-center/);
        expect(slot.className).toMatch(/justify-center/);

        const row = slot.parentElement as HTMLElement;
        expect(row.className).toMatch(/items-center/);
        expect(row.className).not.toMatch(/items-start/);
      }

      const icons = container.querySelectorAll<SVGElement>('[data-chevron-slot] svg');
      icons.forEach((icon) => {
        expect(icon.getAttribute('width')).toBe('12');
        expect(icon.getAttribute('height')).toBe('12');
      });
    });
  }
});

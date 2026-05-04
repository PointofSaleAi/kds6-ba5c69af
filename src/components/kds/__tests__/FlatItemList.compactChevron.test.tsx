import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FlatItemList } from '../FlatItemList';
import { LanguageProvider } from '@/hooks/use-language';
import { KDSSettingsProvider } from '@/hooks/use-kds-settings';
import type { CourseGroup } from '@/types/kds';

/**
 * Visual regression: in Compact ticket layout, the leading chevron must align
 * vertically with the product name text row across typical name lengths.
 *
 * The chevron container's height is bound to the item-name line-box
 * (height = calc(var(--kds-item-name) * 1.1)) and centers the icon, so it
 * stays aligned regardless of font scaling or wrapping. A regression to a
 * fixed `height: 12px` + `marginTop` would visibly desync the chevron from
 * the first text line — this test guards that contract.
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
    // Chevron slot is the first child of each tappable row; either a <button>
    // (when details exist) or a <span aria-hidden> placeholder.
    const slots = container.querySelectorAll<HTMLElement>(
      'button[aria-label="Expand details"], button[aria-label="Collapse details"], span[aria-hidden="true"].shrink-0'
    );
    expect(slots.length).toBeGreaterThanOrEqual(NAMES.length);
  });

  it('chevron slot height tracks item-name line-box, not a fixed pixel value', () => {
    const { container } = renderCompact(NAMES);
    const slots = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button[aria-label="Expand details"], button[aria-label="Collapse details"], span[aria-hidden="true"].shrink-0'
      )
    ).slice(0, NAMES.length);

    expect(slots.length).toBe(NAMES.length);

    for (const slot of slots) {
      const styleAttr = slot.getAttribute('style') || '';
      // Height must be expressed as the line-box of the item name so it
      // centers with the first text line for short OR wrapped names.
      expect(styleAttr).toMatch(/height:\s*calc\(var\(--kds-item-name\)\s*\*\s*1\.1\)/);
      // Width stays a stable 12px gutter.
      expect(styleAttr).toMatch(/width:\s*12px/);
      // Guard against the previous regression that used a fixed top margin
      // to fake alignment — must NOT be present.
      expect(styleAttr).not.toMatch(/margin-top/);
      // Must use inline-flex centering so the icon stays vertically aligned.
      expect(slot.className).toMatch(/inline-flex/);
      expect(slot.className).toMatch(/items-center/);
      expect(slot.className).toMatch(/justify-center/);
    }
  });

  it('chevron icon itself stays a stable 12px square across name lengths', () => {
    const { container } = renderCompact(NAMES);
    const icons = container.querySelectorAll<SVGElement>(
      'button[aria-label="Expand details"] svg, button[aria-label="Collapse details"] svg, span[aria-hidden="true"].shrink-0 svg'
    );
    expect(icons.length).toBeGreaterThanOrEqual(NAMES.length);
    icons.forEach((icon) => {
      expect(icon.getAttribute('width')).toBe('12');
      expect(icon.getAttribute('height')).toBe('12');
    });
  });
});

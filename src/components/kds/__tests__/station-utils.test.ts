import { describe, it, expect } from 'vitest';
import { normalizeStationCourses, getLocationLabel } from '../station-utils';
import type { CourseGroup } from '@/types/kds';

describe('getLocationLabel', () => {
  it('returns tableName for dine-in', () => {
    expect(getLocationLabel('dine-in', 'Table 5')).toBe('Table 5');
  });

  it('returns undefined for take-out PICKUP', () => {
    expect(getLocationLabel('take-out', 'PICKUP')).toBeUndefined();
  });

  it('returns undefined for delivery DELIVERY', () => {
    expect(getLocationLabel('delivery', 'Delivery')).toBeUndefined();
  });

  it('returns tableName if no match', () => {
    expect(getLocationLabel('take-out', 'Window 3')).toBe('Window 3');
  });

  it('returns undefined when no tableName', () => {
    expect(getLocationLabel('dine-in')).toBeUndefined();
  });
});

describe('normalizeStationCourses', () => {
  const baseCourses: CourseGroup[] = [
    { course: 'APPETIZER', items: [], isFired: true, firedAgoLabel: '5:00 ago' },
    { course: 'ENTREE', items: [] },
    { course: 'DESSERT', items: [] },
  ];

  it('marks courses before station as fired', () => {
    const result = normalizeStationCourses(baseCourses, 'ENTREE');
    expect(result[0].isFired).toBe(true);
  });

  it('adds prep timer to station course', () => {
    const result = normalizeStationCourses(baseCourses, 'ENTREE');
    const entree = result.find(c => c.course === 'ENTREE');
    expect(entree?.prepTimerLabel).toBe('6:42');
  });

  it('adds auto-fire label to courses after station', () => {
    const result = normalizeStationCourses(baseCourses, 'ENTREE');
    const dessert = result.find(c => c.course === 'DESSERT');
    expect(dessert?.autoFireLabel).toBeDefined();
  });

  it('inserts SALAD if station is first course', () => {
    const courses: CourseGroup[] = [
      { course: 'ENTREE', items: [] },
    ];
    const result = normalizeStationCourses(courses, 'ENTREE');
    expect(result[0].course).toBe('SALAD');
  });
});

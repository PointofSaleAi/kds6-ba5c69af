import type { CourseGroup, CourseType } from '@/types/kds';

/**
 * Normalize courses for station view.
 * Ensures every order shows a course before and after the station course.
 * Courses before station = fired, station = active, after = pending.
 */
export function normalizeStationCourses(courses: CourseGroup[], stationCourse: string): CourseGroup[] {
  const result = courses.map(c => ({ ...c }));
  let stationIdx = result.findIndex(c => c.course === stationCourse);

  if (stationIdx <= 0) {
    const hasSalad = result.some(c => c.course === 'SALAD');
    if (!hasSalad) {
      result.unshift({
        course: 'SALAD' as CourseType,
        items: [],
        isFired: true,
        firedAgoLabel: '4:20 ago',
      });
    }
  }

  stationIdx = result.findIndex(c => c.course === stationCourse);

  if (stationIdx >= result.length - 1) {
    const hasDessert = result.some(c => c.course === 'DESSERT');
    if (!hasDessert) {
      result.push({
        course: 'DESSERT' as CourseType,
        items: [],
        autoFireLabel: 'Auto-fires in ~8 min',
      });
    }
  }

  stationIdx = result.findIndex(c => c.course === stationCourse);

  for (let i = 0; i < stationIdx; i++) {
    result[i] = {
      ...result[i],
      isFired: true,
      firedAgoLabel: result[i].firedAgoLabel || '4:20 ago',
    };
  }

  if (stationIdx >= 0 && !result[stationIdx].prepTimerLabel) {
    result[stationIdx] = { ...result[stationIdx], prepTimerLabel: '6:42' };
  }

  for (let i = stationIdx + 1; i < result.length; i++) {
    result[i] = {
      ...result[i],
      autoFireLabel: result[i].autoFireLabel || 'Auto-fires in ~8 min',
    };
  }

  return result;
}

export function getLocationLabel(orderType: string, tableName?: string): string | undefined {
  if (!tableName) return undefined;
  const upper = tableName.toUpperCase();
  if (orderType === 'take-out' && (upper === 'PICKUP' || upper === 'TAKE OUT')) return undefined;
  if (orderType === 'delivery' && upper === 'DELIVERY') return undefined;
  return tableName;
}

import type { Order, ProductCategory } from '@/types/kds';
import { isCourseActive } from '@/lib/kds-aging';

/**
 * Returns the ordered list of distinct active product categories visible
 * in the Cooking Summary panel for the given orders. Excludes "Uncategorized".
 * Order is insertion order (matches Summary panel rendering).
 */
export function getActiveSummaryCategories(orders: Order[]): ProductCategory[] {
  const seen = new Set<ProductCategory>();
  const ordered: ProductCategory[] = [];
  for (const order of orders) {
    if (order.status === 'served') continue;
    for (const cg of order.courses) {
      const courseHasRemaining = cg.items.some(i => !i.isCompleted && !i.isCancelled);
      if (!courseHasRemaining) continue;
      if (!isCourseActive(cg)) continue;
      for (const item of cg.items) {
        if (item.isCompleted || item.isCancelled) continue;
        const cat = item.category as ProductCategory | undefined;
        if (!cat) continue;
        if (seen.has(cat)) continue;
        seen.add(cat);
        ordered.push(cat);
      }
    }
  }
  return ordered;
}

import { useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { getKdsScaleClasses } from '@/lib/kds-scale';
import type { Order, CourseType } from '@/types/kds';

interface PrepBoardProps {
  orders: Order[];
}

interface PrepItem {
  name: string;
  totalQty: number;
  orderNumbers: number[];
  hasAllergens: boolean;
}

interface PrepCourse {
  course: CourseType;
  items: PrepItem[];
}

function buildPrepBoard(orders: Order[]): PrepCourse[] {
  const courseMap = new Map<CourseType, Map<string, PrepItem>>();

  for (const order of orders) {
    if (order.status === 'served') continue;
    for (const cg of order.courses) {
      if (!courseMap.has(cg.course)) courseMap.set(cg.course, new Map());
      const items = courseMap.get(cg.course)!;

      for (const item of cg.items) {
        if (item.isCancelled) continue;
        const existing = items.get(item.name) || {
          name: item.name,
          totalQty: 0,
          orderNumbers: [],
          hasAllergens: false,
        };
        existing.totalQty += item.quantity;
        if (!existing.orderNumbers.includes(order.orderNumber)) {
          existing.orderNumbers.push(order.orderNumber);
        }
        if (item.allergens.length > 0) existing.hasAllergens = true;
        items.set(item.name, existing);
      }
    }
  }

  return Array.from(courseMap.entries())
    .map(([course, items]) => ({
      course,
      items: Array.from(items.values()).sort((a, b) => b.totalQty - a.totalQty),
    }));
}

export function PrepBoard({ orders }: PrepBoardProps) {
  const { tp, tc } = useLanguage();
  const { textSize, ticketSpacing, safetyEmphasis } = useKDSSettings();
  const scaleClasses = getKdsScaleClasses(textSize, ticketSpacing, safetyEmphasis);
  const prepCourses = useMemo(() => buildPrepBoard(orders), [orders]);

  if (prepCourses.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center ${scaleClasses}`}>
        <p className="text-text-muted text-sm">No products to prepare</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto p-3 ${scaleClasses}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {prepCourses.map((course) => (
          <div key={course.course} className="bg-surface-card rounded-lg border border-border overflow-hidden">
            {/* Course header */}
            <div className="bg-brand-dark px-4 py-2.5">
              <span className="text-primary-foreground text-[13px] font-bold uppercase tracking-wider">
                {tc(course.course)}S
              </span>
              <span className="text-primary-foreground/60 text-[11px] ml-2">
                {course.items.reduce((s, i) => s + i.totalQty, 0)} total
              </span>
            </div>

            {/* Items list */}
            <div className="divide-y divide-border">
              {course.items.map((item) => (
                <div key={item.name} className="flex items-center gap-3 px-4 py-3 min-h-[52px]">
                  {/* Quantity badge */}
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <span className="text-[18px] font-black text-text-primary">{item.totalQty}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-semibold text-text-primary truncate">{tp(item.name)}</span>
                      {item.hasAllergens && (
                        <span className="text-[10px] font-bold text-allergen bg-allergen/10 px-1.5 py-0.5 rounded">
                          ALLERGY
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      Orders: {item.orderNumbers.map(n => `${n}`).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

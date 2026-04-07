

# Remove Coursing from Non-Dine-In Orders

## Problem
Take-out, delivery, and banquet orders currently display course sections (APPETIZER, ENTREE, DESSERT) with fire buttons and timing, which doesn't match real kitchen workflow. Only dine-in (table) orders use multi-course firing.

## Approach
For non-dine-in orders, flatten all items into a single list without course headers, fire buttons, or course timing. The OrderCard component will check the order type and render accordingly.

## Changes

### 1. OrderCard.tsx - Conditional coursing display
- Check if `order.orderType === 'dine-in'`
- If dine-in: render courses as today (with CourseSection headers, fire buttons, timers)
- If NOT dine-in: render all items in a single flat list without course headers, fire buttons, or auto-fire/prep timers
- Reuse existing item rendering from CourseSection but skip the course header/controls

### 2. Mock data cleanup (mock-orders.ts)
- For take-out, delivery, and banquet orders: consolidate items into a single course group (or keep multiple but they won't render headers)
- Alternatively, keep mock data as-is since the UI will just flatten them visually

### 3. Station view logic (normalizeStationCourses)
- Skip station course normalization for non-dine-in orders since coursing doesn't apply
- The station notification strip should also be suppressed for non-dine-in orders

## Technical detail
- In OrderCard, wrap the `displayCourses.map(...)` block with a condition:
  - `order.orderType === 'dine-in'` → current CourseSection rendering
  - Otherwise → flat item list: iterate all courses' items, render item rows without course headers
- Could extract a `FlatItemList` component or inline it
- The compact card view stays unchanged (it already doesn't show courses)


Remove the "· Fire HH:MM" suffix from course headers in the V1 ticket card so headers display only the course name (e.g. "APPETIZER").

Change:
- `src/components/kds/variants/OrderCardV1.tsx`: drop the `courseFireTime` call and render only `courseLabel(course.course)` in the course band header.

V2 and V3 already don't show the fire time, so no changes there.
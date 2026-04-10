

## Bug Analysis

**Root cause**: When the course-level checkmark (done) icon is tapped and all items are already in "done" state, `handleBulkAdvanceCourse` hits the `allDone` check on **line 175** and returns early as a no-op. The course is never added to `confirmedCourses`, so it never transitions to "served" and never collapses/moves to the bottom.

The `confirmedCourses` set is only updated inside `handleTicketAdvance` (line 281), which is the ticket-level bottom button. The course-level icon has no path to confirm a course.

**Previously it worked** because the earlier implementation auto-collapsed courses when all items were done (without needing explicit confirmation). The recent change to require explicit confirmation via `confirmedCourses` broke the course-level icon flow.

## Fix

**Single change in `handleBulkAdvanceCourse`** (OrderCard.tsx, ~line 175):

When all items are already done (`allDone === true`), instead of returning early, find which course these items belong to and add it to `confirmedCourses`. This makes the course-level checkmark icon act as the confirmation trigger, collapsing the course and promoting the next one.

```tsx
if (allDone) {
  // Confirm this course as served
  const courseName = displayCourses.find(c =>
    c.items.some(i => courseItemIds.includes(i.id))
  )?.course;
  if (courseName) {
    setConfirmedCourses(prev => {
      const next = new Set(prev);
      next.add(courseName);
      return next;
    });
  }
  return prev;
}
```

This is the only change needed. No visual, layout, or other logic changes required.


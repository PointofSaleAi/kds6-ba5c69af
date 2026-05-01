I found the issue. The active History screen is the History view inside `MainOrderView`, not the older standalone `OrderHistoryScreen`. The previous change added a disclaimer to the unused standalone screen, while the live `/kds/full` History list still maps `historyOrders` directly and only applies search filtering.

Plan:

1. Apply station filtering to the live History feed
   - In `src/pages/MainOrderView.tsx`, update `filteredHistory` so when KDS mode is `Station` and a station is selected, History only includes orders containing items with `item.category === selected station`.
   - Reshape each matching history order before render so the History card only shows that station’s items, not the full original ticket.
   - Recalculate `itemCount` from the filtered items so counts match what is visible.

2. Keep existing History behavior outside Station view
   - In Standard and Expo modes, History stays unchanged.
   - Existing date tabs, search box, card layout, recall behavior, sidebar, and bottom toolbar stay unchanged.

3. Add station context to the History header and empty state
   - Add a small station chip in the History header, matching the Seen and Unseen station indicators.
   - If there are no history items for the selected station, show a station-specific empty message such as `No Meat history yet today`.

4. Make recall actions station-safe
   - Because the displayed history order will be station-scoped, recalling a full card from Station History will recall only the visible station-filtered items.
   - Single-item recall remains unchanged and continues recalling the tapped item only.

Technical details:

```ts
const filteredHistory = useMemo(() => {
  let list = historyOrders.filter(matchesSearch);

  if (isStationView && resolvedStationCourse) {
    list = list
      .map(order => {
        const courses = order.courses
          .map(course => ({
            ...course,
            items: course.items.filter(item => item.category === resolvedStationCourse),
          }))
          .filter(course => course.items.length > 0);

        return {
          ...order,
          courses,
          itemCount: courses.reduce(...),
        };
      })
      .filter(order => order.courses.length > 0);
  }

  return list;
}, [historyOrders, historySearch, isStationView, resolvedStationCourse]);
```

I will not change setting rows, History card styling, row icons, labels, descriptions, values, toggles, colors, sidebar navigation, or the bottom toolbar.
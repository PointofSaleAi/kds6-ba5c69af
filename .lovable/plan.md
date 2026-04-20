
The user reports the active course color change didn't take effect visually. Looking at `CourseBlockSection.tsx`, the colors are correctly set to `#0F4C81` and `#EFF6FF`. Let me check if there's another component rendering the active course header, since this one may not be the one used on the KDS Home screen.

Let me investigate where active courses are actually rendered on the home screen ticket cards.
<lov-tool-use id="toolu_vrtx_017SQQANC8UtBYD5tENRYfi3" name="code--search_files" integration-id="code" data="{\"query\": \"ACTIVE\", \"include_patterns\": \"src/components/kds/**/*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01EqsWtmHPPqS7uWrgvubTaM" name="code--search_files" integration-id="code" data="{\"query\": \"CourseSection|CourseBlockSection|courseBlocks|courses\\\\.map\", \"include_patterns\": \"src/**/*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01DWR5tXgh3L4UJ3eWamNB8S" name="code--search_files" integration-id="code" data="{\"query\": \"CourseSection|CourseBlockSection\", \"include_patterns\": \"src/**/*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01X1FvYFJK47EzGWs4ebZ8FA" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/kds/CourseSection.tsx\"}">
</lov-tool-use>
Found it. The KDS Home Screen uses `CourseSection.tsx` (not `CourseBlockSection.tsx` which I edited last time). The active course styling is at lines 180, 192, 211, and 321 with `#7F77DD` and `#EEEDFE`.

<lov-plan>
## Issue
My previous edit modified `CourseBlockSection.tsx`, but the KDS Home Screen ticket cards actually render via `CourseSection.tsx` (used by `OrderCard.tsx`). That file still has the old purple/violet `#7F77DD` and `#EEEDFE` values, which is why the active course color did not change.

## Fix
Update `src/components/kds/CourseSection.tsx`, replacing the violet fallbacks for the ACTIVE course state only:

1. **Left border accent (line 180)** — fallback `'#7F77DD'` → `'#0F4C81'`
2. **Header background tint (line 192)** — fallback `'#EEEDFE'` → `'#EFF6FF'`
3. **Label text color (line 211)** — fallback `'#7F77DD'` → `'#0F4C81'`
4. **"Seen at HH:MM" pill (line 321)** — text `text-[#7F77DD]` → `text-[#0F4C81]`, background `#EEEDFE` → `#EFF6FF`

Note: these are fallbacks. When the course-aging engine supplies `courseAgingColor`, that color still wins (existing behavior preserved). The change only affects courses without an explicit aging color override.

## Out of Scope (unchanged)
- Queued and Served course label, color, background, opacity
- Course icons (eye, ConciergeBell, Check), undo button, ▶ collapse arrow
- Item rows, modifier rows, allergen tags
- Course-level aging color overrides (still respected)
- Any other component or screen

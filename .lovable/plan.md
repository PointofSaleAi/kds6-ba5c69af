

# Fix Eye Icon Consistency Between Products and Order Notes

## Problem
The eye icon container and icon size differ between product items and the Order Notes section:
- **Products**: `min-w-[44px] min-h-[33px]` container, `40x30px` icon (fills container)
- **Order Notes**: `w-[44px] h-[44px]` container, `24x20px` icon (small within container)

This creates a visual inconsistency as shown in the screenshot.

## Plan

**File: `src/components/kds/OrderCard.tsx`** (single edit, ~line 297-307)

Update the Order Notes acknowledge button to match the product icon pattern:
- Change container from `w-[44px] h-[44px]` to `min-w-[44px] min-h-[33px]` with `overflow-hidden`
- Change icon from `w-6 h-5 rounded-sm` to inline style `width: 40px; height: 30px` (same as product icons)
- Keep the conditional background color logic for acknowledged/unacknowledged state

This ensures both the container dimensions and icon fill are identical across products and order notes.


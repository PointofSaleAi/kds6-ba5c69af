# Calculator-style number pads across the app

## What changes
Every number pad switches from the phone layout (1-2-3 on top) to the calculator layout (7-8-9 on top):

```text
 7   8   9
 4   5   6
 1   2   3
 C   0   ENTER / BACK
```

The bottom row stays the same: Clear, 0, and Enter or Back. Only the order of the number buttons changes. Sizes, colours, the Clock In/Out buttons, the Revenue Center picker and keyboard typing all stay as they are.

## Pads affected
- Sign-in PIN pad
- Set PIN screen
- Device activation screen
- Clock In/Out PIN pad (opened from the header clock)
- Manager PIN pad

These are all the number pads in the app. The change applies on desktop, tablet and phone, in light and dark themes.

## Technical
In `PinPadScreen.tsx`, `SetPinScreen.tsx`, `HardwareActivationScreen.tsx`, `ClockInOutOverlay.tsx` and `ManagerPinOverlay.tsx`, reorder each keys array to `['7','8','9','4','5','6','1','2','3', ...last row unchanged]`.

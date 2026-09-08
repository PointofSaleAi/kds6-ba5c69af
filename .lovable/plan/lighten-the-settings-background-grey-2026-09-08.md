# Lighten the settings background grey

## Problem
The shared `--surface-bg` token is `210 14% 95%` in light theme — a grey that reads too heavy behind the white settings pills. It is used by Settings, Dashboard, Account, Order History, and Ticket Studio. The user wants it lighter everywhere.

## Change
In `src/index.css`, lighten the light-theme `--surface-bg` value only:

- Light: `210 14% 95%` → `210 20% 98%` (near-white, just enough tint to separate the white pill cards)
- Dark: keep `225 14% 11%` unchanged (no complaint; changing it risks the dark card contrast)

This is a single token edit. No component changes needed — every page that references `--surface-bg` (Settings, Dashboard, Account, Order History, Ticket Studio) picks up the new shade automatically.

## Verify
- Build stays clean (`build OK` in `/tmp/observability/build-errors.log`).
- Visually confirm the Settings page in light theme: pills sit on a near-white tint, not a heavy grey.
- Spot-check Dashboard and Order History in light theme so the lighter shade doesn't wash out card separation.
- Confirm dark theme Settings is unchanged.

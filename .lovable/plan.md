# Plan: Alerts Module Rows in KDS UI/UX Tracker

## Context
- **Old KDS "Alerts"**: a *Served Orders* screen only. Cards show served tickets grouped by day (Yesterday / Today), with order type header, large order #, elapsed timer, server initials, station strip, items in strikethrough (purple "served" treatment), purple "SERVED" footer button, and right-side Item Summary panel. No notifications, no messaging, no acknowledge action.
- **New KDS "Alerts"** (`AlertsPanel.tsx`): a right-side slide-in panel with two tabs:
  1. **Notifications** — system/operational alerts (new-order, overtime, table-transfer, item-moved, new-item-added, course-fired, recalled, general-alert, system). Station filter, unread dot, time-ago, tap to acknowledge, "Clear read" bulk action, 4s auto-dismiss toasts via `NotificationToastStack`.
  2. **Kitchen Messages** — POS-to-kitchen messages with sender, role, terminal, linked order/table, replies thread, Acknowledge + Reply buttons (opens `KitchenReplyDialog` → QR/mobile reply via `/kds-reply`).
- The old "served orders" surface in our new KDS is no longer under Alerts — it lives inside History (already documented) and via served-state styling on `OrderCard`.

## Output
Append rows to `/mnt/documents/POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - Alerts.xlsx` (copy of template), preserving header styling. One row per Sub-Sub Module.

## Rows to Add (8)

| # | Sub Module | Sub-Sub Module | Lovable Status | UI % | Notes |
|---|---|---|---|---|---|
| 1 | Alerts Entry | Sidebar Bell + Unread Badge | Done | 100 | `KDSSidebar` bell icon, badge count from `useNotifications.unreadCount` + `useKitchenMessages.pendingCount` |
| 2 | Alerts Panel | Slide-in Drawer Shell | Done | 100 | 360px right drawer, framer-motion spring, scrim overlay, close button |
| 3 | Alerts Panel | Tab Switcher (Notifications / Kitchen Messages) | Done | 100 | Pill tabs with per-tab unread badges; NEW vs old KDS |
| 4 | Notifications Tab | Notification List Item | Done | 100 | Type icon, station chip, time-ago, unread dot, tap-to-ack; 9 type mappings in `notifIcons` |
| 5 | Notifications Tab | Toast Stack (Auto-Dismiss) | Done | 100 | `NotificationToastStack`, 4s auto-dismiss, station-filtered |
| 6 | Notifications Tab | Clear Read / Empty State | Done | 100 | "Clear read" bulk; all-clear empty state with success icon |
| 7 | Kitchen Messages Tab | Message Card + Replies Thread | Done | 100 | Sender meta, linked order/table, reply thread, Acknowledge + Reply CTAs; NEW vs old KDS |
| 8 | Kitchen Messages Tab | Reply Dialog + Mobile QR Flow | Done | 100 | `KitchenReplyDialog`, QR → `/kds-reply` (10 min expiry) |

Each row populated with all 23 columns: Section Description, Use Case, Edge Cases, Test Case, Settings Dependency (Notifications row → "Yes: station filter"), vertical flags (Full Service / QSR / Food Truck / eatOS 5.0 all ✓), Old KDS (Before) = "Served Orders only" or "Not present", New KDS (After) = component refs (`AlertsPanel.tsx`, `NotificationToastStack.tsx`, `KitchenReplyDialog.tsx`, `KdsReplyPage.tsx`, `use-notifications.tsx`, `use-kitchen-messages.tsx`), Lovable Link = `/kds/full`.

## Mapping Note for Old "Served Orders"
Add a single explanatory cell in row 1 Notes: *"Old KDS Alerts screen (served orders view) is superseded by History module + served-state styling on OrderCard; not re-implemented under Alerts."*

## Execution
1. Copy template to `/tmp/kds_tracker.xlsx`
2. `openpyxl` append 8 rows after last History row
3. Save to `/mnt/documents/POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - Alerts.xlsx`
4. Emit `<presentation-artifact>` tag

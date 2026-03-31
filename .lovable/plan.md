

# KDS UI/UX Tracker vs Lovable Build - Status Report

## Summary

| Status | Count | % |
|--------|-------|---|
| Done | 14 | 34% |
| Partially Done | 19 | 46% |
| Not Started | 8 | 20% |
| **Total** | **41** | **100%** |

---

## DONE (14 items)

| # | Screen | Sheet % | Verified Notes |
|---|--------|---------|----------------|
| 1 | Forgot Password - Request Reset | 100% | Working with country code picker |
| 2 | Forgot Password - OTP Verification | 100% | Auto-advance, resend timer functional |
| 3 | Forgot Password - Success | 100% | Green checkmark, auto-redirect working |
| 4 | List View - Active Orders | 100% | Order cards with correct type colours, date grouping |
| 5 | Order Card - NEW State | 100% | Red body, NEW badge, timer working |
| 6 | Order Card - IN PROGRESS State | 100% | Orange body, badge correct |
| 7 | Date Grouping Headers | 100% | Showing correctly |
| 8 | BANQUET Order Type | 90% | Gold header showing, minor polish only |
| 9 | Grid View - Compact Cards | 90% | View switcher in footer, allergen badges visible |
| 10 | Sidebar - Expanded | 100% | Labels, active state, animations all working |
| 11 | Item Summary - Expanded | 90% | Category grouping, notification bell working |
| 12 | Item Summary - Collapsed | 100% | Arrow toggle functional |
| 13 | Account Settings | 90% | Device name editable, language picker, log out confirmation |
| 14 | Footer Bar | 90% | View switcher (Grid/Horizontal/Stagger), sort, theme toggle, sound toggle, order count, time all implemented |

---

## PARTIALLY DONE (19 items)

| # | Screen | Sheet % | What is Missing |
|---|--------|---------|-----------------|
| 1 | Splash Screen | 70% | Pending: MAC binding decision affects "Activating device..." flow; offline fallback status not implemented |
| 2 | PIN Login | 70% | Pending: MAC binding decision; 3-failed-attempts email fallback not wired |
| 3 | Order Card - READY State | 80% | **No distinct READY state between IN PROGRESS and DONE.** Currently jumps directly. Need separate card colour and READY badge |
| 4 | Order Card - DONE/SERVED | 70% | **Card uses purple instead of grey (#95A5A6).** Items need strikethrough. Auto-collapse after 30s not implemented. Allergen badges should stay red |
| 5 | Order Card - OVERTIME | 60% | Overtime colour exists but **pulse animation and flashing timer not implemented**. No loud audio alert |
| 6 | Order Card - Cancelled Item | 50% | Cancelled item partially works but **inline CANCELLED red badge not showing** next to item. Allergen badge on cancelled item not greyed |
| 7 | Course Labels | 60% | Labels showing but **styling inconsistent** with design system. NO COURSE fallback not handled |
| 8 | Empty State | 50% | Shows generic message. **Needs: positive copy ("Queue is clear"), last served time, today's 3 stats (orders served, avg ticket time, fastest)** |
| 9 | Sidebar - Collapsed | 90% | Working well. Sort was moved to footer (per user request). **Collapse All was removed per user request.** Minor: long-press tooltip not implemented |
| 10 | Alerts Panel | 60% | Partially implemented. **Dismiss functionality needs testing. Categorised sections (overtime/new/recalled/system) not fully styled** |
| 11 | Settings - Full Layout | 70% | **Currently a scrollable modal. Needs redesign as full-screen two-column panel (280px left tabs, large cards right, no scrolling)** |
| 12 | Settings - Display | 60% | **Display Mode and Theme are duplicated in Settings AND footer. Need to remove from Settings.** Cards Per Row stepper works. Text Size not implemented |
| 13 | Settings - Orders | 70% | Category filter and revenue center exist. **Allergen badge toggle missing. Stagger mode config not shown when toggled on** |
| 14 | Settings - Hardware | 70% | Printer name showing. **Connection status live dot (green/red) not implemented** |
| 15 | Status Colour Customiser | 90% | Picker works, live preview works. **WCAG contrast ratio badge not implemented** |
| 16 | Sound Settings | 60% | Modal exists. **Volume shows raw 0-15 instead of 0-100%. No Test Sound button. Mute label confusing** |
| 17 | Connection/WebSocket Settings | 60% | Modal exists. **Uses technical jargon instead of plain language. No live connection status dot** |
| 18 | Printer Settings | 60% | Single printer confirmation only. **Needs full printer list with Online/Offline/Low Paper status badges and Test Print button** |
| 19 | Category Filter | 50% | Accessible from Settings. **Filter panel UI (multi-select chips, All Categories, Apply/Clear) not designed** |

---

## NOT STARTED (8 items)

| # | Screen | Description | Est. Time |
|---|--------|-------------|-----------|
| 1 | QR Code Activation Screen | Full-screen QR display for BYOD device activation with countdown timer and magic link alternative | 1.5h |
| 2 | Device Activation (Email/QR first-time) | First-time BYOD setup: QR scan, magic link, or email/password fallback | 20m |
| 3 | Grid View - Tap to Expand | Tapping a compact grid card expands it in-place (2x width) with full order details, dark overlay, X to close | 1.5h |
| 4 | Horizontal Scroll View | True single-row horizontal scroll with taller/narrower cards and timeline minimap at bottom | 2h |
| 5 | History - In-Place Tab | **Current history is a separate full-screen page. Needs rebuild as in-place tab replacing only the card area** (sidebar/footer stay) with grey wash cards, strikethrough, and RECALL button | 3h |
| 6 | RECALL Action | Recall button on history cards returning order to live queue with RECALLED badge and fresh timer | 1h |
| 7 | Language & Region Settings | Language scope toggle (App UI / Menu Items / Both), searchable language list with flags, date/time format config | 2h |
| 8 | Performance Dashboard | 4 metric cards, orders-per-hour bar chart, avg ticket time line chart, category breakdown table, Top 3 Slowest Items. Major competitive gap | 4h |

---

## Critical Fixes Needed (High Priority)

1. **SERVED card colour**: Change from purple to grey (#95A5A6) with strikethrough on all items
2. **READY state**: Add missing state between IN PROGRESS and DONE
3. **OVERTIME pulse**: Add pulsing animation and flashing timer
4. **Settings layout**: Redesign from scrollable modal to full-screen two-column panel
5. **History tab**: Rebuild as in-place experience (not separate page)

## Estimated Remaining Work

- Partially Done fixes: ~15 hours
- Not Started screens: ~16 hours
- **Total remaining: ~31 hours**


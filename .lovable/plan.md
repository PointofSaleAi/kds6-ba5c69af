## Goal

When the user selects Arabic (or any non-English language), every visible string on the KDS, Notifications, History, Unseen/Seen views, Summary panel, Order Cards, and the Language preview must switch. Today, large pockets of English remain because three categories of strings still bypass the translation layer.

## What is still English (from screenshots)

### A. Hard-coded English in JSX

These strings live as literals inside components and never read from `t.*`, `tn`, `tl`, `tp`, `tm`, `to`, `ta`, `tc`. They will never translate, regardless of dictionary content.

1. Language settings preview chrome (`InlineLanguageSettings.tsx`)
   - "One language on KDS"
   - "Two languages per item"
   - "View as", "Standard", "Compact"
   - "Preview-only. Change the saved layout in Display, Ticket Layout. Proper nouns (server name, guest name) are not translated."
   - "Showing {Lang} only on the KDS." / "Showing {primary} (primary) + {secondary} (secondary) on each item."
   - "Primary · editing" / "Secondary · editing" / "tap a card to choose which side to edit, or ⇆ to swap"

2. Notifications drawer (`AlertsPanel.tsx` / notifications panel)
   - "Notifications", "Kitchen Messages", "Clear read"
   - Tag chips: "All", "Read", "Grill", "Salad"
   - Time labels: "3m ago", "4m ago", "11m ago", "16m ago", "26m ago", "31m ago", "36m ago"
   - Sample message bodies: "Table 6 moved to Table 10", "New order #27 received (DINE IN, Table 9)", "Grilled Salmon from Table 6 moved to Table 7", "Course 2 fired for Table 12", "New item added to Table 4: 1x Caesar Salad", "VIP guest arriving in 15 minutes", "Order #22 is 10+ minutes overtime", "Printer 'Kitchen HP' is offline"

3. Unseen / Seen views
   - "UNSEEN ORDERS"
   - "POS Terminal 1", "POS Terminal 3"
   - Kitchen-message bodies and the "Maria S. - Server", "James R. - Host" attribution line
   - Inline POS message text: "Table 4 guest has severe nut allergy. Please double check all dishes before plating.", "Extra napkins and utensils for 4 people", "Delivery driver for order #25 is here early. Can we rush it?", "Cook well done, no pink", "Pack sauce separately"

4. History view (`OrderHistoryScreen.tsx`)
   - "HISTORY", "Today", "Yesterday", "Last 7 Days"
   - "Search order, table, ser..." (truncated placeholder)
   - "ORDER NOTES", "APPETIZER", "ENTREE", "DESSERT"
   - Pill: "18 min total", "12 min total", "32 min total", "14 min total", "33 min total"
   - Button: "RECALL"
   - Order notes text: "VIP guest, extra attention to plating", "No contact delivery, leave at door"
   - Strikethrough modifiers: "No Skin", "No Onion"

5. Summary panel
   - Section headers: "OVERTIME", "MEAT", "DESSERTS"
   - Items still in English even though Arabic is active: "OSSO BUCO", "BEEF WELLINGTON", "PORK BELLY", "VEAL SCALLOPINI", "LAMB RACK", "RACK OF LAMB", "GELATO", "CANNOLI", "MILKSHAKE", "NACHOS"
   - Modifier under NACHOS: "+ Jalapenos", "Chocolate"

6. Order cards / coursing labels
   - "Crispy Skin", "No Fennel", "+ Gremolata", "Marsala Sauce", "+ Extra Lobster", "+ Parmesan Crisp", "+ Frangelico", "+ Passion Fruit", "+ Balsamic Glaze", "+ Mint Jelly", "No Wasabi", "+ Birthday Candle"
   - Course labels: the literal word "Active" is shown as "نشط" but the inline `· رئيسي` / `· مقبلات` / `· حلويات` uses keys like `MAIN`, `APPETIZER`, `DESSERTS` — some still pass through (good), but `Birthday dinner, bring candle with dessert` order-note text is still English on Table 15 / 5907 cards

7. Header / footer
   - Footer order count phrasing: the Arabic reads correctly "13 الطلبات في الانتظار", but the count badge inside the sidebar tooltip "6", "13", "8" is fine (numbers), and "إغلاق" / language icon / sound icon labels are OK. The remaining issue is "PICKUP", "BANQUET A", "BANQUET B", "DELIVERY", "TABLE N" which are partly translated (TABLE → طاولة) but `PICKUP`, `BANQUET A`, `BANQUET B`, `DELIVERY` need the same `tl()` token-replacement.

### B. Mock-data strings missing from dictionaries

Even after the translation helpers are applied, these strings will pass through as English unless the dictionaries contain them:

- Modifiers: `+ Gremolata`, `Crispy Skin`, `No Fennel`, `Marsala Sauce`, `+ Extra Lobster`, `+ Parmesan Crisp`, `+ Frangelico`, `+ Passion Fruit`, `+ Balsamic Glaze`, `+ Mint Jelly`, `No Wasabi`, `No Skin`, `No Onion`, `+ Birthday Candle`, `+ Jalapenos`, `Chocolate`
- Products: `OSSO BUCO`, `BEEF WELLINGTON`, `PORK BELLY`, `VEAL SCALLOPINI`, `LAMB RACK`, `RACK OF LAMB`, `GELATO`, `CANNOLI`, `MILKSHAKE`, `NACHOS`, `MANGO STICKY RICE`, `BRUSCHETTA`, `CHEESECAKE`, `SHRIMP COCKTAIL`, `SEARED TUNA`, `GRILLED BARRAMUNDI`, `LOBSTER LINGUINE`, `TRUFFLE RISOTTO`, `AFFOGATO`, `EDAMAME`, `TERIYAKI CHICKEN`, `VEGGIE ROLL`, `FISH TACOS`
- Order notes: `Birthday dinner, bring candle with dessert`, `Allergy to nuts. Please prepare food separately and notify server`, `Extra napkins and utensils for 4 people`, `Cook well done, no pink`, `Pack sauce separately`, `VIP guest, extra attention to plating`, `No contact delivery, leave at door`
- Embedded location labels: `PICKUP`, `BANQUET A`, `BANQUET B`, `DELIVERY`
- Section headers (inside Summary): `OVERTIME`, `MEAT`, `DESSERTS`, `MAINS`, `APPETIZERS`, `SIDES`
- Time/relative labels: `min ago`, `m ago`, `min total`, `total`
- Notification kinds: `New order`, `received`, `moved to`, `from`, `fired for`, `added to`, `is`, `minutes overtime`, `is offline`, `Printer`, `Kitchen HP`
- Server/role attribution: `Server`, `Host`, `Manager`, `POS Terminal`
- History tabs: literally `Today`, `Yesterday`, `Last 7 Days`, `HISTORY`, `Search order, table, server...`, `RECALL`, `min total`, `ORDER NOTES`

### C. Proper nouns the user wants translated anyway

Earlier we treated guest names (`John Peterson`, `Sarah Chen`, `Mike Johnson`, `Emma Williams`, `Diana Ross`, `Michael Chen`, `Amanda Foster`, `Corporate Event`) and server names (`Maria S.`, `Alex M.`, `James R.`, `Sophie L.`, `Alex K.`, `Rachel W.`, `Rachel G.`, `David H.`, `Nina P.`, `Tom B.`, `Lisa W.`, `Carlos M.`, `Emma T.`, `UberEats`, `DoorDash`) as proper nouns. The user has explicitly rejected this policy — they want every visible string to switch when Arabic is selected. We will keep proper nouns visually identifiable (still bold, still in the same slot) but transliterate them via the dictionary. The "Preview-only" italic note about proper nouns will be removed.

## Fix plan

### Step 1. Add new translation keys to the `Translations` interface

In `src/hooks/use-language.tsx`, extend the interface with:

- Preview chrome: `oneLanguageOnKDS`, `twoLanguagesPerItem`, `viewAs`, `previewOnlyHint`, `showingSingleLang` (template), `showingDualLang` (template), `primary`, `secondary`, `editing`, `swapHint`
- Notifications: `notifications`, `kitchenMessagesTab`, `clearRead`, `all`, `read`, `unread`, `minAgo`, `mAgo`, `secondsAgo`, `hoursAgo`
- History: `historyTitle`, `customRange`, `orderNotesLabel`, `minTotal`, `recall`, `orderHistory`
- Unseen/Seen: `unseenOrders`, `seenOrders`, `posTerminal`, `serverRole`, `hostRole`, `managerRole`
- Embedded location tokens: `pickup`, `delivery`, `banquet`
- Summary section headers: `summary`, `overtime`, `mains`, `meat`, `desserts`, `appetizers`, `sides`, `salads`, `soups`, `seafood`, `pasta`, `beverages`
- Notification verbs/templates so messages can be reconstructed from typed payload

Add full Arabic, Spanish, Chinese, Vietnamese, en-GB, en-US values for every new key.

### Step 2. Backfill data dictionaries

Extend `productNames`, `modifierTexts`, `noteTexts`, `embeddedLabels`, `allergenLabels`, `courseNames`, `categoryNames`, `orderTypeLabels` for all six languages with the missing entries listed in section B above. Add a new `personNames` dictionary mapping every guest, server and partner name used in `mock-orders.ts`, `mock-history.ts`, `mock-kitchen-messages.ts`, and `mock-preview-ticket.ts` (English → Arabic / Spanish / Chinese / Vietnamese transliterations; en-US and en-GB pass through).

Add a `tperson(name)` helper that uses `personNames`.

### Step 3. Refactor notifications to a typed payload

The existing notification messages in `mock-kitchen-messages.ts` and the notifications panel are pre-baked English sentences. To make them translatable, change each notification source to a typed payload:

```
{ kind: 'order_received', orderNumber: 27, orderType: 'dine-in', tableName: 'TABLE 9' }
{ kind: 'item_moved',   itemName: 'Grilled Salmon', from: 'TABLE 6', to: 'TABLE 7' }
{ kind: 'overtime',     orderNumber: 22, minutes: 10 }
{ kind: 'printer_offline', printerName: 'Kitchen HP' }
```

Render each notification through a small `formatNotification(payload, t, helpers)` function that builds the localized sentence from translated parts. The same pattern applies to inline POS messages (`message_text` becomes `{ kind: 'allergy_notice', tableNumber: 4 }` etc).

For backwards compatibility, the existing `message_text` field stays as a fallback if `payload` is missing, so we don't have to update every consumer at once.

### Step 4. Wire helpers into every screen still rendering raw English

- `InlineLanguageSettings.tsx`: replace the literals listed in A.1 with `t.*` lookups, including the "View as" group and the preview-only note. Build the "Showing X only on the KDS." sentence from `t.showingSingleLang.replace('{lang}', langName)`.
- `AlertsPanel.tsx` and the notifications drawer: read `t.notifications`, `t.kitchenMessagesTab`, `t.clearRead`, `t.all`, `t.read`. Replace each notification body with `formatNotification(...)`. Replace relative-time strings with a `formatRelativeTime(date, t)` helper.
- `UnseenOrdersScreen.tsx`: translate `UNSEEN ORDERS` header, `POS Terminal N` (split → `tl('POS Terminal') + ' ' + N`), role attribution (`Maria S. - Server` → `tperson(name) + ' - ' + t.serverRole`), and inline POS message text via the typed-payload pipeline.
- `OrderHistoryScreen.tsx`: translate `HISTORY`, `Today`, `Yesterday`, `Last 7 Days`, search placeholder, `ORDER NOTES`, course names, `RECALL`, and the "N min total" pill via `t.minTotal.replace('{n}', n)`. Wrap order notes with `tn`. Wrap server/guest names with `tperson`.
- `MainOrderView.tsx` / `OrderCard.tsx`: wrap `serverName` and `guestName` with `tperson`. Remove the "Preview-only / proper nouns are not translated" italic line in `InlineLanguageSettings.tsx` since the policy is reversed.
- `OrderTypeBadge.tsx`: extend the existing `tl('TABLE')` token replacement to also cover `PICKUP`, `BANQUET A`, `BANQUET B`, `DELIVERY` — split on whitespace, translate each token, rejoin.
- `ItemSummaryPanel.tsx` / Summary drawer: translate the section headers (`OVERTIME`, `MEAT`, `DESSERTS`, `MAINS`, etc.) via a new `summarySectionLabel(category)` helper that maps category enum → `t.*` key. Items already use `tp()`; the missing translations are filled in via Step 2.
- `mock-preview-ticket.ts`: keep structure, but ensure every product / modifier / note in it has a matching dictionary entry after Step 2. No structural change.

### Step 5. Remove the proper-noun disclaimer

Delete the italic note in `InlineLanguageSettings.tsx` ("Proper nouns ... are not translated"). Since names are now translated via `tperson`, the disclaimer is wrong.

## Files to update

- `src/hooks/use-language.tsx` — interface, all 6 dictionaries, new helpers `tperson`, `formatNotification`, `formatRelativeTime`, `summarySectionLabel`
- `src/components/kds/InlineLanguageSettings.tsx` — replace literals, drop disclaimer
- `src/components/kds/OrderTypeBadge.tsx` — token-translate every word in `tableInfo`
- `src/components/kds/OrderCard.tsx` — wrap `serverName`, `guestName` with `tperson`
- `src/components/kds/ItemSummaryPanel.tsx` (and `ExpoSummaryPanel.tsx` if it shares the same headers) — translate section headers
- `src/components/kds/NotificationToastStack.tsx` and `src/pages/AlertsPanel.tsx` — typed payload + `formatNotification`
- `src/pages/OrderHistoryScreen.tsx` — translate header, tabs, search placeholder, `RECALL`, `min total`, course names, notes, names
- `src/pages/UnseenOrdersScreen.tsx` and `src/pages/SeenOrdersScreen.tsx` — translate header and the inline POS-message subtree
- `src/data/mock-kitchen-messages.ts` — add `payload` field with typed kind
- `src/data/mock-history.ts`, `src/data/mock-orders.ts` — no structural change; just confirm every field used has a dictionary entry after Step 2
- `src/data/mock-preview-ticket.ts` — confirm coverage; no structural change

## Out of scope

- No layout changes anywhere
- No change to language scope tabs, display mode cards, language pair section, language list, Save button
- No change to global Display > Ticket Layout setting
- No change to ticket lifecycle, status flow, or aging engine
- No change to RTL behaviour (already handled by existing `dir` attribute)

## Validation checklist

1. Switch Settings > Display > Language to Arabic (single mode)
2. Confirm preview ticket: every product, modifier, allergen, course label, table label, order note, guest name, server name renders in Arabic
3. Confirm preview chrome: "One language on KDS", "Two languages per item", "View as", "Standard", "Compact", "Showing Arabic only on the KDS." all render in Arabic
4. Open History — confirm tabs, header, search placeholder, RECALL button, "min total" pill, ORDER NOTES, course headers, guest/server names, modifiers all in Arabic
5. Open Notifications panel — confirm tab labels, "Clear read", "All", "Read", every notification body, every relative-time label in Arabic
6. Open Unseen Orders — confirm header, POS-message author and role, message body, terminal name in Arabic
7. Open Summary panel — confirm section headers ("OVERTIME", "MEAT", "DESSERTS") and every product row in Arabic
8. Switch to Spanish, Chinese, Vietnamese — repeat the spot checks
9. Switch back to English (US) — confirm everything renders in original English with no broken templates
10. Confirm dual-language mode still shows secondary line for menu strings

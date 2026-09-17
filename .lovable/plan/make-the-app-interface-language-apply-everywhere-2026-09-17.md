# Make the App Interface language apply everywhere

## What is actually happening

The Save does work. When the scope is App Interface, the chosen language is stored and every screen that is wired to the translation system switches immediately.

The problem is coverage, confirmed by checking the code:

- The translation dictionary holds about 102 phrases — mostly ticket and board wording.
- Only 36 of roughly 200 screens and panels read from it at all.
- Screens with no translated text at all include: the Settings navigation list, Display, Orders, Hardware, Account, System, Expo, AI settings, Ticket Aging Rules, Status Colors, Order Type Colors, Printers, Sound, Stagger Mode, the PIN pad and clock-in screens, order history filters, and much of the main board chrome.

So after saving, the ticket area changes language while the surrounding menus, buttons and settings stay in English — which reads as "nothing happened app wide".

## The fix

Extend the interface translation so every screen a kitchen user can reach speaks the chosen language, in five passes. Each pass adds the missing phrases to all five supported languages (English, Spanish, Arabic, Chinese, Vietnamese) and wires the screen to them, keeping right-to-left support for Arabic.

1. **Navigation and chrome** — left rail labels, bottom bar buttons and tooltips, top header, notifications drawer, summary panel headings and filters, empty states, toasts.
2. **Settings shell** — the Settings menu list, group titles, every section heading, row label and helper description, plus the shared controls (toggles, chips, Save/Back buttons, search placeholder).
3. **Settings sub-screens** — Display and Ticket Layout, Orders, Hardware and Printers, Sound, Account, System, Expo, AI, Stagger Mode, Ticket Aging Rules, Status Colors, Order Type Colors.
4. **Entry and account screens** — PIN pad, clock in/out, sign-in and switch user, device activation, logout confirmation.
5. **Remaining dialogs** — 86 products drawer, recipe reference, kitchen reply, order notes, order history and its filters, alerts log, onboarding walkthrough captions.

Proper nouns (staff names, restaurant name, product names when the scope is App Interface only) stay untranslated, as today.

## Verification

Each pass is checked at desktop, tablet and phone widths in light and dark theme, in Spanish and in Arabic (right-to-left), confirming no text overflows, clips, or falls below the minimum readable size, and that touch targets stay full size after longer words.

## Technical notes

- `src/hooks/use-language.tsx`: grow the `Translations` interface and the five language maps with the new interface keys; unknown strings continue to fall back to English so nothing can render blank.
- Wire each screen through `const { t } = useLanguage()` and replace hardcoded strings with `t.<key>`; screens already using it only need their missing strings added.
- No change to how the language is saved, to the scope logic (`interface` / `menu` / `both`), or to menu-item translation behaviour.
- Where a screen composes strings with numbers ("11 orders in queue"), use a parameterised phrase rather than concatenating words, so word order stays correct in Arabic and Vietnamese.

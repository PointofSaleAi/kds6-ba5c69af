

# Plan: Connect Settings to KDS Home Screen

## Problem
All settings in the SettingsPanel use local `useState` that resets on close and never reaches the KDS home screen. Each setting category needs a shared context so changes persist and reflect in real-time.

## Solution: Create a KDS Settings Context

### New file: `src/hooks/use-kds-settings.tsx`
Create a single `KDSSettingsProvider` context with localStorage persistence for all settings:

**Display settings:**
- `cardsPerRow` (number, default 4) - controls grid column count
- `textSize` ('Compact' | 'Standard' | 'Large') - controls font scaling on cards
- `showAllergens` (boolean) - toggles allergen badges on order cards
- `enableBadge` - already handled by `useBadgeVisibility` (working)
- Mode Switcher - already handled by `useKDSMode` (working)

**Order settings:**
- `sortDefault` ('By Time' | 'By Table' | 'By Type') - sets initial sort mode
- `staggerMode` (boolean) - placeholder toggle (no deep integration yet)
- `servableModifiers` (boolean) - placeholder toggle

**Status Colours, Category Filter, Revenue Center Filter** - these open sub-panels and are already functional navigation, no data binding needed now.

**Hardware settings** - Printer, Sound, Sync, Connection are sub-panel navigations or actions. Sound is already context-based. These are presentational/navigational, not data-binding issues.

**Language** - already fully functional via `useLanguage` context.

---

### Changes by file

#### 1. `src/hooks/use-kds-settings.tsx` (NEW)
- Context with: `cardsPerRow`, `textSize`, `showAllergens`, `sortDefault`, `staggerMode`, `servableModifiers`
- All values persisted to localStorage
- Provider wraps the app

#### 2. `src/main.tsx`
- Wrap app with `KDSSettingsProvider`

#### 3. `src/components/kds/SettingsPanel.tsx`
- Replace local `useState` for `cardsPerRow`, `textSize`, `showAllergens`, `sortDefault`, `staggerMode`, `servableModifiers` with values from `useKDSSettings()`
- Settings changes now immediately update the context

#### 4. `src/pages/MainOrderView.tsx`
- Read `cardsPerRow` from context to set grid columns dynamically (`gridTemplateColumns: repeat(N, minmax(0, 1fr))`)
- Read `textSize` from context and apply a CSS class to the card container (e.g., `text-scale-compact`, `text-scale-large`)
- Read `showAllergens` from context and pass it down to `OrderCard`
- Read `sortDefault` to initialize `sortMode` state
- Read `staggerMode` - if ON, force viewMode to stagger layout

#### 5. `src/components/kds/OrderCard.tsx`
- Accept `showAllergens` prop (or read from context)
- Conditionally render `OrderAllergenStrip` and item-level allergen badges

#### 6. `src/components/kds/CourseSection.tsx` and `src/components/kds/FlatItemList.tsx`
- Pass through or read `showAllergens` to hide/show item-level allergen badges

#### 7. `src/index.css`
- Add text scale utility classes:
  - `.text-scale-compact` - reduces base font sizes by ~15%
  - `.text-scale-large` - increases base font sizes by ~15%

---

### What already works (no changes needed)
- **Enable Badge** - uses `useBadgeVisibility` context (connected)
- **Mode Switcher** - uses `useKDSMode` context (connected)
- **Theme** - uses `useTheme` context (connected)
- **Sound Settings** - uses `useSound` context (connected)
- **Language/Region** - uses `useLanguage` context (connected)
- **Status Colours** - opens sub-panel (navigational)
- **Category/Revenue Filter** - opens sub-panel (navigational)
- **Printer/Connection** - opens sub-panel (navigational)
- **Sync** - action button (functional)

### What this plan connects
- **Cards Per Row** → grid column count on home screen
- **Text Size** → font scaling on order cards
- **Show Allergen Badges** → hides/shows allergen strips and badges
- **Sort Default** → initializes sort order on home screen
- **Stagger Mode** → forces stagger layout when ON
- **Servable Modifiers** → stored in context for future use


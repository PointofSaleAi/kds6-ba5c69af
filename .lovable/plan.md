

## Bring POS-style Sidebar Navigation to the KDS

### What changes

Restyle the KDS left sidebar (`KDSSidebar.tsx`) to match the POS project's glass-morphism navigation style while keeping all existing KDS nav items and functionality.

### Visual style to adopt from POS

- **Glass container**: Inner rounded container (`rounded-2xl`) with semi-transparent background (`#7575754D`) and inset glow (`box-shadow: inset 4px 4px 24px rgba(255,255,255,0.15)`)
- **Outer padding**: `py-2 px-2` wrapper around the glass container
- **Nav items**: Each item gets equal vertical space (`flex-1`), centered icon, `rounded-xl` shape
- **Active state**: `bg-sidebar-accent` with a `border-2 border-white` highlight (replacing current left-border style)
- **Hover**: `hover:bg-white/20` with smooth transition
- **Tooltips**: Each icon gets a tooltip on hover (right side) showing the label, since text labels are removed
- **No hamburger/expand toggle**: The sidebar stays icon-only at a fixed width (~80px with padding), no collapse/expand mechanism
- **Badge counts**: Kept as small overlaid circles on icons (Seen, Unseen, History, Alerts)

### What stays the same

- All nav items: Home, History, Alerts, Settings, Seen, Unseen, Switch to POS
- All navigation actions and callbacks (`onNavigate`, `onFilterChange`)
- Badge counts and colors (blue for Seen, red for Unseen)
- Sidebar background color (`--sidebar-bg`)
- All existing screen routing and sync behavior

### Technical details

**File: `src/components/kds/KDSSidebar.tsx`**

1. Remove hamburger toggle button and `expanded` state
2. Remove all `{expanded && <span>...}` text labels
3. Change outer container to `w-20` fixed width with `py-2 px-2` padding
4. Add inner `div` with `rounded-2xl`, glass background and inset shadow
5. Make each nav button `flex-1` with `rounded-xl`, centered icon
6. Change active state from `border-l-2 border-brand-primary` to `bg-sidebar-accent border-2 border-white rounded-xl`
7. Wrap each button in a `Tooltip` from shadcn showing the item label
8. Keep badge overlay positioning adjusted for new layout


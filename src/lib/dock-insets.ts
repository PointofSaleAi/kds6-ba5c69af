import type { DockLayout } from '@/hooks/use-dock-layout';

const RAIL_WIDTH = 80; // KDSSidebar w-20
const BAR_HEIGHT = 52;
const HEADER_HEIGHT = 44; // KDSTopHeader --kds-header-h

/**
 * Compute fixed-overlay insets that respect the persistent KDS rail,
 * top header, and bottom status bar regardless of which edges they're docked on.
 */
export function getOverlayInsets(layout: DockLayout) {
  return {
    left: layout.mainSidebar === 'left' ? RAIL_WIDTH : 0,
    right: layout.mainSidebar === 'right' ? RAIL_WIDTH : 0,
    top: (layout.bottomBar === 'top' ? BAR_HEIGHT : 0) + HEADER_HEIGHT,
    bottom: layout.bottomBar === 'bottom' ? BAR_HEIGHT : 0,
  };
}

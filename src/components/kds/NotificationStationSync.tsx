import { useEffect } from 'react';
import { useKDSMode, type StationCourse } from '@/hooks/use-kds-mode';
import { useNotifications } from '@/hooks/use-notifications';
import type { StationTag } from '@/types/notification';

/** Maps KDS station/course selection to notification station tags */
const courseToStation: Record<string, StationTag> = {
  ENTREE: 'Grill',
  APPETIZER: 'Fry',
  DESSERT: 'Dessert',
  SIDES: 'Salad',
};

/**
 * Invisible component that syncs the KDS mode station selector
 * with the notification filtering system. Place inside both providers.
 */
export function NotificationStationSync() {
  const { mode, stationCourse } = useKDSMode();
  const { setCurrentStation } = useNotifications();

  useEffect(() => {
    if (mode === 'Prep' && stationCourse) {
      const mapped = courseToStation[stationCourse] || 'Kitchen';
      setCurrentStation(mapped);
    } else if (mode === 'Expo') {
      setCurrentStation('Expo');
    } else {
      // Standard mode or no station selected: show all
      setCurrentStation('All');
    }
  }, [mode, stationCourse, setCurrentStation]);

  return null;
}

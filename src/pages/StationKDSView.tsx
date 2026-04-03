import { useState, useCallback } from 'react';
import MainOrderView from './MainOrderView';

/**
 * Station KDS View - renders the full KDS layout but with
 * only the ENTREE course highlighted on each order card.
 * Navigate to /kds/station to view.
 */
export default function StationKDSView() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleNavigate = useCallback((screen: string) => {
    if (screen === 'settings') {
      setSettingsOpen(true);
    }
  }, []);

  return (
    <MainOrderView
      onNavigate={handleNavigate}
      settingsOpen={settingsOpen}
      onCloseSettings={() => setSettingsOpen(false)}
      stationCourse="ENTREE"
    />
  );
}

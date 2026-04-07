import { createContext, useContext, useState, type ReactNode } from 'react';

export type KDSMode = 'Standard' | 'Expo' | 'Prep';

export type StationCourse = 'ENTREE' | 'APPETIZER' | 'DESSERT' | 'SIDES' | null;

interface KDSModeContextType {
  mode: KDSMode;
  setMode: (mode: KDSMode) => void;
  stationCourse: StationCourse;
  setStationCourse: (course: StationCourse) => void;
}

const KDSModeContext = createContext<KDSModeContextType>({
  mode: 'Standard',
  setMode: () => {},
  stationCourse: null,
  setStationCourse: () => {},
});

export function KDSModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<KDSMode>('Standard');
  const [stationCourse, setStationCourse] = useState<StationCourse>(null);

  const handleSetMode = (newMode: KDSMode) => {
    setMode(newMode);
    if (newMode !== 'Prep') {
      setStationCourse(null);
    }
  };

  return (
    <KDSModeContext.Provider value={{ mode, setMode: handleSetMode, stationCourse, setStationCourse }}>
      {children}
    </KDSModeContext.Provider>
  );
}

export function useKDSMode() {
  return useContext(KDSModeContext);
}

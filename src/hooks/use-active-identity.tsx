import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type IdentityKind = 'restaurant' | 'staff';

export interface StaffRecord {
  pin: string;
  name: string;
  role: string;
}

export interface RestaurantIdentity {
  kind: 'restaurant';
  name: string;
  email: string;
  deviceName: string;
  stationId: string;
  logoUrl?: string;
}

export interface StaffIdentity {
  kind: 'staff';
  name: string;
  role: string;
  pin: string;
  sessionStart: number;
}

export type ActiveIdentity = RestaurantIdentity | StaffIdentity;

// Mock staff PIN directory. Replace with backend lookup when auth is wired.
export const STAFF_DIRECTORY: StaffRecord[] = [
  { pin: '1234', name: 'Marcus Rivera', role: 'Head chef' },
  { pin: '2580', name: 'Sofia Chen', role: 'Line cook' },
  { pin: '4455', name: 'Amir Haddad', role: 'Expo' },
  { pin: '9911', name: 'Priya Patel', role: 'Pastry chef' },
];

const RESTAURANT_DEFAULT: RestaurantIdentity = {
  kind: 'restaurant',
  name: 'Bollywood Bites',
  email: 'bollywoodbites@eatos.co',
  deviceName: 'Kitchen Display 1',
  stationId: 'STN-001',
};

interface IdentityContextValue {
  identity: ActiveIdentity;
  restaurant: RestaurantIdentity;
  signInAsRestaurant: () => void;
  signInWithPin: (pin: string) => StaffIdentity | null;
  signOutStaff: () => void;
  lookupStaff: (pin: string) => StaffRecord | undefined;
  // Stats scoped to current session
  ticketsToday: number;
  ticketsTotal: number;
  avgTicketTimeSec: number;
  hoursWorked: number;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);
const STORAGE_KEY = 'posai-active-identity';

export function ActiveIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<ActiveIdentity>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return RESTAURANT_DEFAULT;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(identity)); } catch {}
  }, [identity]);

  const lookupStaff = useCallback((pin: string) => STAFF_DIRECTORY.find(s => s.pin === pin), []);

  const signInWithPin = useCallback((pin: string): StaffIdentity | null => {
    const staff = STAFF_DIRECTORY.find(s => s.pin === pin) ?? STAFF_DIRECTORY[0];
    if (!staff) return null;
    const next: StaffIdentity = {
      kind: 'staff',
      name: staff.name,
      role: staff.role,
      pin: staff.pin,
      sessionStart: Date.now(),
    };
    setIdentity(next);
    return next;
  }, []);

  const signInAsRestaurant = useCallback(() => setIdentity(RESTAURANT_DEFAULT), []);
  const signOutStaff = useCallback(() => setIdentity(RESTAURANT_DEFAULT), []);

  // Deterministic mock stats derived from identity so cards feel populated.
  const stats = useMemo(() => {
    if (identity.kind === 'restaurant') {
      return { ticketsToday: 128, ticketsTotal: 4831, avgTicketTimeSec: 9 * 60 + 42, hoursWorked: 0 };
    }
    // Session-scoped for staff — resets per PIN
    const minutesActive = Math.max(1, Math.floor((Date.now() - identity.sessionStart) / 60000));
    const seed = identity.pin.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return {
      ticketsToday: (seed % 40) + 12,
      ticketsTotal: (seed % 40) + 12,
      avgTicketTimeSec: 7 * 60 + (seed % 90),
      hoursWorked: minutesActive / 60,
    };
  }, [identity]);

  const value: IdentityContextValue = {
    identity,
    signInAsRestaurant,
    signInWithPin,
    signOutStaff,
    lookupStaff,
    ...stats,
  };

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useActiveIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error('useActiveIdentity must be used within ActiveIdentityProvider');
  return ctx;
}

export function initialsFromName(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue}, 55%, 42%)`;
}

export type ExpoStationStatus = 'done' | 'firing' | 'pending';

export interface ExpoStation {
  name: string;
  status: ExpoStationStatus;
}

export type ExpoItemStatus = 'done' | 'firing' | 'pending';

export interface ExpoItem {
  id: string;
  name: string;
  quantity: number;
  status: ExpoItemStatus;
  statusLabel?: string; // e.g. "Frying...", "On grill..."
}

export interface ExpoTicket {
  id: string;
  orderNumber: number;
  orderType: 'dine-in' | 'take-out' | 'banquet';
  tableName: string;
  timerSeconds: number;
  stations: ExpoStation[];
  items: ExpoItem[];
}

export interface KitchenStation {
  name: string;
  color: string; // tailwind color token
  dotClass: string;
}

export const kitchenStations: KitchenStation[] = [
  { name: 'Grill', color: 'success', dotClass: 'bg-success' },
  { name: 'Fry', color: 'info', dotClass: 'bg-blue-500' },
  { name: 'Salad', color: 'warning', dotClass: 'bg-warning' },
  { name: 'Dessert', color: 'purple', dotClass: 'bg-purple-500' },
  { name: 'Bar', color: 'muted', dotClass: 'bg-text-muted' },
];

export const mockExpoTickets: ExpoTicket[] = [
  {
    id: 'expo-1',
    orderNumber: 1042,
    orderType: 'dine-in',
    tableName: 'Table 12',
    timerSeconds: 504, // 8:24
    stations: [
      { name: 'Grill', status: 'done' },
      { name: 'Fry', status: 'done' },
      { name: 'Salad', status: 'done' },
    ],
    items: [
      { id: 'e1-1', name: 'Wagyu Steak', quantity: 1, status: 'done' },
      { id: 'e1-2', name: 'French Fries', quantity: 2, status: 'done' },
      { id: 'e1-3', name: 'Caesar Salad', quantity: 1, status: 'done' },
    ],
  },
  {
    id: 'expo-2',
    orderNumber: 1043,
    orderType: 'dine-in',
    tableName: 'Table 15',
    timerSeconds: 725, // 12:05
    stations: [
      { name: 'Grill', status: 'done' },
      { name: 'Fry', status: 'firing' },
      { name: 'Dessert', status: 'pending' },
    ],
    items: [
      { id: 'e2-1', name: 'Beef Burger', quantity: 2, status: 'done' },
      { id: 'e2-2', name: 'Onion Rings', quantity: 2, status: 'firing', statusLabel: 'Frying...' },
      { id: 'e2-3', name: 'Creme Brulee', quantity: 1, status: 'pending', statusLabel: 'Auto-fire in 4:30' },
    ],
  },
  {
    id: 'expo-3',
    orderNumber: 1044,
    orderType: 'banquet',
    tableName: 'Banquet B',
    timerSeconds: 1127, // 18:47
    stations: [
      { name: 'Grill', status: 'done' },
      { name: 'Salad', status: 'pending' },
      { name: 'Dessert', status: 'pending' },
    ],
    items: [
      { id: 'e3-1', name: 'Grilled Salmon', quantity: 3, status: 'done' },
      { id: 'e3-2', name: 'Garden Salad', quantity: 3, status: 'pending', statusLabel: 'Overdue' },
      { id: 'e3-3', name: 'Cheesecake', quantity: 3, status: 'pending' },
    ],
  },
  {
    id: 'expo-4',
    orderNumber: 1045,
    orderType: 'take-out',
    tableName: 'Table 8',
    timerSeconds: 72, // 1:12
    stations: [
      { name: 'Grill', status: 'firing' },
      { name: 'Fry', status: 'pending' },
    ],
    items: [
      { id: 'e4-1', name: 'Chicken Parmigiana', quantity: 1, status: 'firing', statusLabel: 'On grill...' },
      { id: 'e4-2', name: 'Garlic Bread', quantity: 1, status: 'pending' },
    ],
  },
  {
    id: 'expo-5',
    orderNumber: 1046,
    orderType: 'dine-in',
    tableName: 'Table 3',
    timerSeconds: 228, // 3:48
    stations: [
      { name: 'Fry', status: 'done' },
      { name: 'Salad', status: 'firing' },
    ],
    items: [
      { id: 'e5-1', name: 'Spring Rolls', quantity: 2, status: 'done' },
      { id: 'e5-2', name: 'Caprese Salad', quantity: 1, status: 'firing', statusLabel: 'Plating...' },
    ],
  },
];

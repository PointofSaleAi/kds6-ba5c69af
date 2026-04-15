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
  statusLabel?: string; // e.g. "Frying...", "On grill...", "Overdue"
  /** Station this item is assigned to */
  station?: string;
  /** Item was added after ticket creation (POS mid-service add) */
  isNew?: boolean;
  /** Allergens associated with this item */
  allergens?: { type: string; label: string }[];
}

export interface ExpoTicket {
  id: string;
  orderNumber: number;
  orderType: 'dine-in' | 'take-out' | 'banquet';
  tableName: string;
  timerSeconds: number;
  stations: ExpoStation[];
  items: ExpoItem[];
  /** Seconds remaining until auto-fire triggers. undefined = no auto-fire. 0 = firing now. */
  autoFireSeconds?: number;
  /** Whether this ticket has coursing enabled (multi-course FSR) */
  hasCoursing?: boolean;
  /** Timestamp when the current active course was fired (for per-course timer reset) */
  activeCourseFiredAt?: Date;
}

export interface KitchenStation {
  name: string;
  color: string;
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
    timerSeconds: 504,
    stations: [
      { name: 'Grill', status: 'done' },
      { name: 'Fry', status: 'done' },
      { name: 'Salad', status: 'done' },
    ],
    items: [
      { id: 'e1-1', name: 'Wagyu Steak', quantity: 1, status: 'done', station: 'Grill', allergens: [{ type: 'gluten', label: 'Gluten' }, { type: 'dairy', label: 'Dairy' }] },
      { id: 'e1-2', name: 'French Fries', quantity: 2, status: 'done', station: 'Fry' },
      { id: 'e1-3', name: 'Caesar Salad', quantity: 1, status: 'done', station: 'Salad', allergens: [{ type: 'egg', label: 'Egg' }] },
    ],
  },
  {
    id: 'expo-2',
    orderNumber: 1043,
    orderType: 'dine-in',
    tableName: 'Table 15',
    timerSeconds: 725,
    autoFireSeconds: 270, // 4:30
    stations: [
      { name: 'Grill', status: 'done' },
      { name: 'Fry', status: 'firing' },
      { name: 'Dessert', status: 'pending' },
    ],
    items: [
      { id: 'e2-1', name: 'Beef Burger', quantity: 2, status: 'done', station: 'Grill' },
      { id: 'e2-2', name: 'Onion Rings', quantity: 2, status: 'firing', station: 'Fry', statusLabel: 'Frying...' },
      { id: 'e2-3', name: 'Creme Brulee', quantity: 1, status: 'pending', station: 'Dessert' },
    ],
  },
  {
    id: 'expo-3',
    orderNumber: 1044,
    orderType: 'banquet',
    tableName: 'Banquet B',
    timerSeconds: 1127,
    stations: [
      { name: 'Grill', status: 'done' },
      { name: 'Salad', status: 'pending' },
      { name: 'Dessert', status: 'pending' },
    ],
    items: [
      { id: 'e3-1', name: 'Grilled Salmon', quantity: 3, status: 'done', station: 'Grill', allergens: [{ type: 'fish', label: 'Fish' }, { type: 'shellfish', label: 'Shellfish' }] },
      { id: 'e3-2', name: 'Garden Salad', quantity: 3, status: 'pending', station: 'Salad', statusLabel: 'Overdue' },
      { id: 'e3-3', name: 'Cheesecake', quantity: 3, status: 'pending', station: 'Dessert', allergens: [{ type: 'dairy', label: 'Dairy' }, { type: 'gluten', label: 'Gluten' }] },
    ],
  },
  {
    id: 'expo-4',
    orderNumber: 1045,
    orderType: 'take-out',
    tableName: 'Table 8',
    timerSeconds: 72,
    autoFireSeconds: 180, // 3:00
    stations: [
      { name: 'Grill', status: 'firing' },
      { name: 'Fry', status: 'pending' },
    ],
    items: [
      { id: 'e4-1', name: 'Chicken Parmigiana', quantity: 1, status: 'firing', station: 'Grill', statusLabel: 'On grill...' },
      { id: 'e4-2', name: 'Garlic Bread', quantity: 1, status: 'pending', station: 'Fry' },
    ],
  },
  {
    id: 'expo-5',
    orderNumber: 1046,
    orderType: 'dine-in',
    tableName: 'Table 3',
    timerSeconds: 228,
    stations: [
      { name: 'Fry', status: 'done' },
      { name: 'Salad', status: 'firing' },
    ],
    items: [
      { id: 'e5-1', name: 'Spring Rolls', quantity: 2, status: 'done', station: 'Fry' },
      { id: 'e5-2', name: 'Caprese Salad', quantity: 1, status: 'firing', station: 'Salad', statusLabel: 'Plating...' },
    ],
  },
];

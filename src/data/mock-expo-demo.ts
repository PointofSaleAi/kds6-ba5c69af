// Demo tickets for Expo presentation mode
// These are isolated from the real data layer
import type { ExpoTicket, ExpoCourse } from './mock-expo-orders';

export type DemoExpoTicket = ExpoTicket & {
  isDemo: true;
  coursing?: {
    served?: { course: string; doneAt: string; items: { name: string; quantity: number }[] };
    active: { course: string; label: string };
    pending?: { course: string; label: string; items: { id: string; name: string; quantity: number; timeLabel: string }[] };
  };
};

export function createDemoTickets(): DemoExpoTicket[] {
  return [
    // DEMO 1: All Pending
    {
      id: 'demo-101',
      isDemo: true,
      orderNumber: 101,
      orderType: 'dine-in',
      tableName: 'TABLE 3',
      timerSeconds: 135,
      hasCoursing: true,
      stations: [
        { name: 'Grill', status: 'pending' },
        { name: 'Salad', status: 'pending' },
        { name: 'Dessert', status: 'pending' },
      ],
      items: [
        { id: 'demo-1-1', name: 'Wagyu Steak', quantity: 2, status: 'pending', station: 'Grill', allergens: [{ type: 'gluten', label: 'Gluten' }] },
        { id: 'demo-1-2', name: 'Caesar Salad', quantity: 1, status: 'pending', station: 'Salad', allergens: [{ type: 'dairy', label: 'Dairy' }, { type: 'egg', label: 'Egg' }] },
        { id: 'demo-1-3', name: 'Creme Brulee', quantity: 2, status: 'pending', station: 'Dessert' },
      ],
      courses: [
        { name: 'Entree', status: 'active' as const, itemIds: ['demo-1-1', 'demo-1-2'] },
        { name: 'Dessert', status: 'queued' as const, itemIds: ['demo-1-3'], statusLabel: 'Queued' },
      ],
    },
    // DEMO 2: Kitchen Preparing
    {
      id: 'demo-102',
      isDemo: true,
      orderNumber: 102,
      orderType: 'take-out',
      tableName: 'PICKUP',
      timerSeconds: 525,
      stations: [
        { name: 'Grill', status: 'firing' },
        { name: 'Fry', status: 'pending' },
      ],
      items: [
        { id: 'demo-2-1', name: 'Ribeye Steak', quantity: 1, status: 'firing', station: 'Grill', statusLabel: 'Since 08:30' },
        { id: 'demo-2-2', name: 'Garlic Bread', quantity: 2, status: 'pending', station: 'Fry' },
        { id: 'demo-2-3', name: 'Chocolate Fondant', quantity: 1, status: 'pending', station: 'Dessert' },
      ],
    },
    // DEMO 3: Partially Prepared
    {
      id: 'demo-103',
      isDemo: true,
      orderNumber: 103,
      orderType: 'banquet',
      tableName: 'BANQUET A',
      timerSeconds: 860,
      hasCoursing: true,
      stations: [
        { name: 'Grill', status: 'done' },
        { name: 'Salad', status: 'firing' },
      ],
      items: [
        { id: 'demo-3-1', name: 'Lamb Chops', quantity: 2, status: 'done', station: 'Grill', statusLabel: 'Done 14:10', allergens: [{ type: 'sesame', label: 'Sesame' }] },
        { id: 'demo-3-2', name: 'Garden Salad', quantity: 1, status: 'firing', station: 'Salad', statusLabel: 'Since 14:05' },
        { id: 'demo-3-3', name: 'Tiramisu', quantity: 1, status: 'pending', station: 'Dessert', allergens: [{ type: 'dairy', label: 'Dairy' }, { type: 'gluten', label: 'Gluten' }] },
      ],
      courses: [
        { name: 'Entree', status: 'active' as const, itemIds: ['demo-3-1', 'demo-3-2'] },
        { name: 'Dessert', status: 'queued' as const, itemIds: ['demo-3-3'], statusLabel: 'Queued' },
      ],
    },
    // DEMO 4: Ready to Send Out
    {
      id: 'demo-104',
      isDemo: true,
      orderNumber: 104,
      orderType: 'dine-in',
      tableName: 'TABLE 7',
      timerSeconds: 1085,
      hasCoursing: true,
      stations: [
        { name: 'Grill', status: 'done' },
        { name: 'Salad', status: 'done' },
        { name: 'Bar', status: 'done' },
      ],
      items: [
        { id: 'demo-4-1', name: 'Beef Wellington', quantity: 1, status: 'done', station: 'Grill', statusLabel: 'Done 17:55' },
        { id: 'demo-4-2', name: 'Greek Salad', quantity: 2, status: 'done', station: 'Salad', statusLabel: 'Done 17:58' },
        { id: 'demo-4-3', name: 'Sparkling Water', quantity: 2, status: 'done', station: 'Bar', statusLabel: 'Done 17:50' },
      ],
      courses: [
        { name: 'Entree', status: 'served' as const, itemIds: ['demo-4-1', 'demo-4-2', 'demo-4-3'] },
      ],
    },
    // DEMO 5: Overtime / Urgent
    {
      id: 'demo-105',
      isDemo: true,
      orderNumber: 105,
      orderType: 'dine-in',
      tableName: 'UBEREATS',
      timerSeconds: 1470,
      hasCoursing: true,
      stations: [
        { name: 'Grill', status: 'firing' },
      ],
      items: [
        { id: 'demo-5-1', name: 'Margherita Pizza', quantity: 3, status: 'firing', station: 'Grill', statusLabel: 'Since 20:10' },
        { id: 'demo-5-2', name: 'Garlic Knots', quantity: 2, status: 'done', station: 'Grill', statusLabel: 'Done 22:00' },
      ],
      courses: [
        { name: 'Entree', status: 'active' as const, itemIds: ['demo-5-1', 'demo-5-2'] },
      ],
    },
  ];
}

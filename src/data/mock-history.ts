// TODO: Replace with API endpoint - all data should come from backend
import type { Order } from '@/types/kds';

export const mockHistoryOrders: Order[] = [
  {
    id: 'hist-001',
    orderNumber: 20,
    orderType: 'dine-in',
    status: 'served',
    tableName: 'TABLE 2',
    serverName: 'Maria S.',
    guestName: 'John Peterson',
    timeReceived: new Date(Date.now() - 3600000),
    elapsedSeconds: 1080,
    targetSeconds: 900,
    orderNotes: 'VIP guest, extra attention to plating',
    itemCount: 4,
    courses: [
      {
        course: 'APPETIZER',
        isFired: true,
        items: [
          { id: 'h-i-001', name: 'Caprese Salad', quantity: 1, modifiers: [], allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }], isCompleted: true },
        ],
      },
      {
        course: 'ENTREE',
        isFired: true,
        items: [
          { id: 'h-i-002', name: 'Ribeye Steak', quantity: 2, modifiers: [{ text: 'Medium Rare', type: 'neutral' }, { text: '+ Extra Sauce', type: 'extra' }], allergens: [], isCompleted: true },
          { id: 'h-i-003', name: 'Grilled Chicken', quantity: 1, modifiers: [{ text: 'No Skin', type: 'remove' }], allergens: [], isCompleted: true },
        ],
      },
    ],
  },
  {
    id: 'hist-002',
    orderNumber: 19,
    orderType: 'take-out',
    status: 'served',
    tableName: 'PICKUP',
    serverName: 'James R.',
    guestName: 'Sarah Chen',
    timeReceived: new Date(Date.now() - 5400000),
    elapsedSeconds: 720,
    targetSeconds: 900,
    itemCount: 2,
    courses: [
      {
        course: 'ENTREE',
        isFired: true,
        items: [
          { id: 'h-i-004', name: 'Fish Tacos', quantity: 2, modifiers: [{ text: '+ Extra Lime', type: 'extra' }], allergens: [{ type: 'shellfish', label: 'FISH', icon: '\u{1F990}' }], isCompleted: true },
        ],
      },
    ],
  },
  {
    id: 'hist-003',
    orderNumber: 18,
    orderType: 'delivery',
    status: 'served',
    tableName: 'DELIVERY',
    serverName: 'UberEats',
    guestName: 'Mike Johnson',
    timeReceived: new Date(Date.now() - 7200000),
    elapsedSeconds: 1920,
    targetSeconds: 1200,
    orderNotes: 'No contact delivery, leave at door',
    itemCount: 5,
    courses: [
      {
        course: 'APPETIZER',
        isFired: true,
        items: [
          { id: 'h-i-005', name: 'Edamame', quantity: 2, modifiers: [], allergens: [{ type: 'soy', label: 'SOY', icon: '\u{1FAD8}' }], isCompleted: true },
        ],
      },
      {
        course: 'ENTREE',
        isFired: true,
        items: [
          { id: 'h-i-006', name: 'Teriyaki Chicken', quantity: 2, modifiers: [{ text: '+ Extra Rice', type: 'extra' }], allergens: [{ type: 'soy', label: 'SOY', icon: '\u{1FAD8}' }, { type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }], isCompleted: true },
          { id: 'h-i-007', name: 'Veggie Roll', quantity: 1, modifiers: [], allergens: [{ type: 'soy', label: 'SOY', icon: '\u{1FAD8}' }], isCompleted: true },
        ],
      },
    ],
  },
  {
    id: 'hist-004',
    orderNumber: 17,
    orderType: 'dine-in',
    status: 'served',
    tableName: 'TABLE 8',
    serverName: 'Alex K.',
    guestName: 'Emma Williams',
    timeReceived: new Date(Date.now() - 10800000),
    elapsedSeconds: 840,
    targetSeconds: 900,
    itemCount: 3,
    courses: [
      {
        course: 'ENTREE',
        isFired: true,
        items: [
          { id: 'h-i-008', name: 'Lamb Chops', quantity: 1, modifiers: [{ text: 'Medium', type: 'neutral' }], allergens: [], isCompleted: true },
          { id: 'h-i-009', name: 'Garden Salad', quantity: 1, modifiers: [{ text: 'No Onion', type: 'remove' }], allergens: [], isCompleted: true },
        ],
      },
      {
        course: 'DESSERT',
        isFired: true,
        items: [
          { id: 'h-i-010', name: 'Creme Brulee', quantity: 1, modifiers: [], allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }, { type: 'egg', label: 'EGG', icon: '\u{1F95A}' }], isCompleted: true },
        ],
      },
    ],
  },
  {
    id: 'hist-005',
    orderNumber: 16,
    orderType: 'banquet',
    status: 'served',
    tableName: 'BANQUET B',
    serverName: 'Sophie L.',
    guestName: 'Corporate Event',
    timeReceived: new Date(Date.now() - 14400000),
    elapsedSeconds: 1980,
    targetSeconds: 1800,
    itemCount: 12,
    courses: [
      {
        course: 'APPETIZER',
        isFired: true,
        items: [
          { id: 'h-i-011', name: 'Mezze Platter', quantity: 3, modifiers: [], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }, { type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }], isCompleted: true },
        ],
      },
      {
        course: 'ENTREE',
        isFired: true,
        items: [
          { id: 'h-i-012', name: 'Beef Wellington', quantity: 4, modifiers: [{ text: '+ Extra Gravy', type: 'extra' }], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }], isCompleted: true },
          { id: 'h-i-013', name: 'Mushroom Risotto', quantity: 4, modifiers: [], allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }], isCompleted: true },
        ],
      },
      {
        course: 'DESSERT',
        isFired: true,
        items: [
          { id: 'h-i-014', name: 'Chocolate Fondant', quantity: 5, modifiers: [], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }, { type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }, { type: 'egg', label: 'EGG', icon: '\u{1F95A}' }], isCompleted: true },
        ],
      },
    ],
  },
];

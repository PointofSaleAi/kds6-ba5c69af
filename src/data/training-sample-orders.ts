import type { Order } from '@/types/kds';

export const TRAINING_SAMPLE_ID_PREFIX = 'training-sample-';

export function isTrainingSampleOrder(order: Pick<Order, 'id'>): boolean {
  return order.id.startsWith(TRAINING_SAMPLE_ID_PREFIX);
}

let batch = 0;

/** Fresh set of 3-4 varied sample tickets. Each call returns a new batch. */
export function makeTrainingSampleOrders(): Order[] {
  batch += 1;
  const now = Date.now();
  const b = batch;

  const mk = (id: string): string => `${TRAINING_SAMPLE_ID_PREFIX}${b}-${id}`;

  const dineIn: Order = {
    id: mk('dinein'),
    orderNumber: 201,
    orderType: 'dine-in',
    status: 'new',
    tableName: 'TABLE 7',
    serverName: 'Trainer',
    guestName: 'Practice Guest',
    timeReceived: new Date(now - 45_000),
    elapsedSeconds: 45,
    targetSeconds: 900,
    itemCount: 3,
    courses: [
      {
        course: 'APPETIZER',
        isFired: true,
        firedAt: new Date(now - 45_000),
        _startedAt: new Date(now - 45_000),
        items: [
          {
            id: mk('dinein-i1'),
            name: 'Bruschetta',
            category: 'Appetizers',
            quantity: 1,
            modifiers: [{ text: 'Extra basil', type: 'extra' }],
            allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '🌾' }],
            station: 'Salad',
          },
        ],
      },
      {
        course: 'ENTREE',
        _startedAt: new Date(now - 45_000),
        items: [
          {
            id: mk('dinein-i2'),
            name: 'Ribeye Steak',
            category: 'Meat',
            quantity: 1,
            modifiers: [{ text: 'Medium rare', type: 'neutral' }],
            allergens: [],
            station: 'Grill',
          },
          {
            id: mk('dinein-i3'),
            name: 'Truffle Fries',
            category: 'Sides',
            quantity: 1,
            modifiers: [{ text: 'No salt', type: 'remove' }],
            allergens: [],
            station: 'Fry',
          },
        ],
      },
    ],
  };

  // Take-out: SEEN state
  const takeOut: Order = {
    id: mk('takeout'),
    orderNumber: 202,
    orderType: 'take-out',
    status: 'seen',
    tableName: 'PICKUP',
    serverName: 'Trainer',
    guestName: 'Alex T.',
    timeReceived: new Date(now - 4 * 60_000),
    elapsedSeconds: 240,
    targetSeconds: 900,
    itemCount: 2,
    courses: [
      {
        course: 'ENTREE',
        isFired: true,
        firedAt: new Date(now - 4 * 60_000),
        _startedAt: new Date(now - 4 * 60_000),
        items: [
          {
            id: mk('takeout-i1'),
            name: 'Margherita Pizza',
            category: 'Pizza',
            quantity: 1,
            modifiers: [{ text: 'Extra cheese', type: 'extra' }],
            allergens: [
              { type: 'dairy', label: 'DAIRY', icon: '🥛' },
              { type: 'gluten', label: 'GLUTEN', icon: '🌾' },
            ],
            station: 'Grill',
          },
          {
            id: mk('takeout-i2'),
            name: 'Garden Salad',
            category: 'Salads',
            quantity: 1,
            modifiers: [{ text: 'Dressing on the side', type: 'neutral' }],
            allergens: [],
            station: 'Salad',
          },
        ],
      },
    ],
  };

  // Banquet: IN-PROGRESS state
  const banquet: Order = {
    id: mk('banquet'),
    orderNumber: 203,
    orderType: 'banquet',
    status: 'preparing',
    tableName: 'HALL A',
    serverName: 'Trainer',
    timeReceived: new Date(now - 8 * 60_000),
    elapsedSeconds: 480,
    targetSeconds: 900,
    itemCount: 3,
    courses: [
      {
        course: 'ENTREE',
        isFired: true,
        firedAt: new Date(now - 8 * 60_000),
        _startedAt: new Date(now - 8 * 60_000),
        items: [
          {
            id: mk('banquet-i1'),
            name: 'Roast Chicken',
            category: 'Poultry',
            quantity: 12,
            modifiers: [],
            allergens: [],
            station: 'Grill',
          },
          {
            id: mk('banquet-i2'),
            name: 'Vegetable Medley',
            category: 'Vegetarian',
            quantity: 12,
            modifiers: [],
            allergens: [],
            station: 'Salad',
          },
          {
            id: mk('banquet-i3'),
            name: 'Dinner Rolls',
            category: 'Sides',
            quantity: 24,
            modifiers: [],
            allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '🌾' }],
            station: 'Fry',
          },
        ],
      },
    ],
  };

  // Delivery: DONE state (all items completed)
  const delivery: Order = {
    id: mk('delivery'),
    orderNumber: 204,
    orderType: 'delivery',
    status: 'preparing',
    tableName: 'DELIVERY',
    serverName: 'Trainer',
    customerName: 'Jamie L.',
    customerPhone: '555-0134',
    timeReceived: new Date(now - 12 * 60_000),
    elapsedSeconds: 720,
    targetSeconds: 900,
    itemCount: 2,
    courses: [
      {
        course: 'ENTREE',
        isFired: true,
        firedAt: new Date(now - 12 * 60_000),
        _startedAt: new Date(now - 12 * 60_000),
        items: [
          {
            id: mk('delivery-i1'),
            name: 'Chicken Wings',
            category: 'Appetizers',
            quantity: 1,
            modifiers: [{ text: 'Buffalo sauce', type: 'extra' }],
            allergens: [],
            station: 'Fry',
            isCompleted: true,
          },
          {
            id: mk('delivery-i2'),
            name: 'Caesar Wrap',
            category: 'Sandwiches',
            quantity: 1,
            modifiers: [{ text: 'No anchovies', type: 'remove' }],
            allergens: [{ type: 'dairy', label: 'DAIRY', icon: '🥛' }],
            station: 'Salad',
            isCompleted: true,
          },
        ],
      },
    ],
  };

  return [dineIn, takeOut, banquet, delivery];
}

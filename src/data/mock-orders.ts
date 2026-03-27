// TODO: Replace with API endpoint - all data should come from backend
import type { Order } from '@/types/kds';

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 23,
    orderType: 'dine-in',
    status: 'new',
    tableName: 'TABLE 4',
    serverName: 'Maria S.',
    timeReceived: new Date(Date.now() - 225000),
    elapsedSeconds: 225,
    targetSeconds: 900,
    itemCount: 5,
    courses: [
      {
        course: 'APPETIZER',
        items: [
          {
            id: 'i-001',
            name: 'Cheese Selection',
            quantity: 1,
            modifiers: [],
            allergens: [{ type: 'peanut', label: 'PEANUT', icon: '\u{1F95C}' }],
          },
        ],
      },
      {
        course: 'ENTREE',
        items: [
          {
            id: 'i-002',
            name: 'Meatballs',
            quantity: 2,
            modifiers: [
              { text: 'Medium Rare', type: 'neutral' },
              { text: 'Potato Wedge', type: 'neutral' },
              { text: '+ Extra Cheese', type: 'extra' },
            ],
            allergens: [],
          },
          {
            id: 'i-003',
            name: 'Filet Mignon',
            quantity: 1,
            modifiers: [
              { text: 'Medium Rare', type: 'neutral' },
              { text: '+ Extra Olive Oil', type: 'extra' },
            ],
            allergens: [],
          },
        ],
      },
      {
        course: 'DESSERT',
        items: [
          {
            id: 'i-004',
            name: 'Tres Leches',
            quantity: 1,
            modifiers: [],
            allergens: [
              { type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' },
              { type: 'tree-nut', label: 'NUT', icon: '\u{1F95C}' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ord-002',
    orderNumber: 24,
    orderType: 'take-out',
    status: 'in-progress',
    tableName: 'PICKUP',
    serverName: 'James R.',
    timeReceived: new Date(Date.now() - 680000),
    elapsedSeconds: 680,
    targetSeconds: 900,
    itemCount: 3,
    courses: [
      {
        course: 'ENTREE',
        items: [
          {
            id: 'i-005',
            name: 'Grilled Salmon',
            quantity: 1,
            modifiers: [
              { text: 'No Butter', type: 'remove' },
              { text: '+ Lemon Sauce', type: 'extra' },
            ],
            allergens: [{ type: 'shellfish', label: 'FISH', icon: '\u{1F990}' }],
          },
          {
            id: 'i-006',
            name: 'Caesar Salad',
            quantity: 2,
            modifiers: [{ text: '+ Extra Croutons', type: 'extra' }],
            allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }],
          },
        ],
      },
    ],
  },
  {
    id: 'ord-003',
    orderNumber: 25,
    orderType: 'delivery',
    status: 'new',
    tableName: 'DELIVERY',
    serverName: 'DoorDash',
    timeReceived: new Date(Date.now() - 120000),
    elapsedSeconds: 120,
    targetSeconds: 1200,
    itemCount: 4,
    courses: [
      {
        course: 'APPETIZER',
        items: [
          {
            id: 'i-007',
            name: 'Spring Rolls',
            quantity: 2,
            modifiers: [{ text: 'Extra Dipping Sauce', type: 'extra' }],
            allergens: [{ type: 'soy', label: 'SOY', icon: '\u{1FAD8}' }],
          },
        ],
      },
      {
        course: 'ENTREE',
        items: [
          {
            id: 'i-008',
            name: 'Pad Thai',
            quantity: 1,
            modifiers: [
              { text: 'Spicy', type: 'neutral' },
              { text: '+ Extra Shrimp', type: 'extra' },
            ],
            allergens: [
              { type: 'peanut', label: 'PEANUT', icon: '\u{1F95C}' },
              { type: 'shellfish', label: 'SHELLFISH', icon: '\u{1F990}' },
            ],
          },
          {
            id: 'i-009',
            name: 'Green Curry',
            quantity: 1,
            modifiers: [{ text: 'Mild', type: 'neutral' }],
            allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }],
          },
        ],
      },
    ],
  },
  {
    id: 'ord-004',
    orderNumber: 22,
    orderType: 'dine-in',
    status: 'overtime',
    tableName: 'TABLE 12',
    serverName: 'Alex K.',
    timeReceived: new Date(Date.now() - 1500000),
    elapsedSeconds: 1500,
    targetSeconds: 900,
    itemCount: 2,
    courses: [
      {
        course: 'ENTREE',
        items: [
          {
            id: 'i-010',
            name: 'Wagyu Steak',
            quantity: 1,
            modifiers: [
              { text: 'Medium Well', type: 'neutral' },
              { text: '+ Truffle Butter', type: 'extra' },
            ],
            allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }],
          },
          {
            id: 'i-011',
            name: 'Lobster Tail',
            quantity: 1,
            modifiers: [{ text: '+ Garlic Butter', type: 'extra' }],
            allergens: [{ type: 'shellfish', label: 'SHELLFISH', icon: '\u{1F990}' }],
          },
        ],
      },
    ],
  },
  {
    id: 'ord-005',
    orderNumber: 26,
    orderType: 'banquet',
    status: 'seen',
    tableName: 'BANQUET A',
    serverName: 'Sophie L.',
    timeReceived: new Date(Date.now() - 420000),
    elapsedSeconds: 420,
    targetSeconds: 1800,
    itemCount: 8,
    courses: [
      {
        course: 'APPETIZER',
        isFired: true,
        items: [
          {
            id: 'i-012',
            name: 'Bruschetta Platter',
            quantity: 3,
            modifiers: [],
            allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }],
            isCompleted: true,
          },
        ],
      },
      {
        course: 'ENTREE',
        items: [
          {
            id: 'i-013',
            name: 'Chicken Parmigiana',
            quantity: 4,
            modifiers: [{ text: '+ Extra Sauce', type: 'extra' }],
            allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }, { type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }],
          },
          {
            id: 'i-014',
            name: 'Vegetable Risotto',
            quantity: 4,
            modifiers: [{ text: 'No Parmesan', type: 'remove' }],
            allergens: [],
          },
        ],
      },
      {
        course: 'DESSERT',
        items: [
          {
            id: 'i-015',
            name: 'Tiramisu',
            quantity: 8,
            modifiers: [],
            allergens: [
              { type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' },
              { type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' },
              { type: 'egg', label: 'EGG', icon: '\u{1F95A}' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ord-006',
    orderNumber: 21,
    orderType: 'dine-in',
    status: 'served',
    tableName: 'TABLE 7',
    serverName: 'Tom B.',
    timeReceived: new Date(Date.now() - 2100000),
    elapsedSeconds: 2100,
    targetSeconds: 900,
    itemCount: 3,
    courses: [
      {
        course: 'ENTREE',
        isFired: true,
        items: [
          {
            id: 'i-016',
            name: 'Fish and Chips',
            quantity: 2,
            modifiers: [{ text: 'Mushy Peas', type: 'neutral' }],
            allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }],
            isCompleted: true,
          },
          {
            id: 'i-017',
            name: 'Onion Rings',
            quantity: 1,
            modifiers: [],
            allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }],
            isCompleted: true,
            isCancelled: true,
          },
        ],
      },
    ],
  },
];

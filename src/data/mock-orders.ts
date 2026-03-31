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
          { id: 'i-016', name: 'Fish and Chips', quantity: 2, modifiers: [{ text: 'Mushy Peas', type: 'neutral' }], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }], isCompleted: true },
          { id: 'i-017', name: 'Onion Rings', quantity: 1, modifiers: [], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }], isCompleted: true, isCancelled: true },
        ],
      },
    ],
  },
  {
    id: 'ord-007',
    orderNumber: 27,
    orderType: 'take-out',
    status: 'new',
    tableName: 'PICKUP',
    serverName: 'Nina P.',
    timeReceived: new Date(Date.now() - 90000),
    elapsedSeconds: 90,
    targetSeconds: 600,
    itemCount: 1,
    courses: [
      {
        course: 'ENTREE',
        items: [
          { id: 'i-018', name: 'Club Sandwich', quantity: 1, modifiers: [{ text: 'No Mayo', type: 'remove' }], allergens: [] },
        ],
      },
    ],
  },
  {
    id: 'ord-008',
    orderNumber: 28,
    orderType: 'dine-in',
    status: 'in-progress',
    tableName: 'TABLE 9',
    serverName: 'Carlos M.',
    timeReceived: new Date(Date.now() - 540000),
    elapsedSeconds: 540,
    targetSeconds: 900,
    itemCount: 6,
    courses: [
      {
        course: 'APPETIZER',
        isFired: true,
        items: [
          { id: 'i-019', name: 'Soup of the Day', quantity: 2, modifiers: [], allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }] },
          { id: 'i-020', name: 'Garlic Bread', quantity: 1, modifiers: [{ text: '+ Extra Garlic Butter', type: 'extra' }], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }] },
        ],
      },
      {
        course: 'ENTREE',
        items: [
          { id: 'i-021', name: 'Lamb Chops', quantity: 2, modifiers: [{ text: 'Medium', type: 'neutral' }, { text: '+ Mint Sauce', type: 'extra' }], allergens: [] },
          { id: 'i-022', name: 'Mushroom Pasta', quantity: 1, modifiers: [{ text: 'Gluten Free Pasta', type: 'neutral' }], allergens: [{ type: 'egg', label: 'EGG', icon: '\u{1F95A}' }] },
        ],
      },
      {
        course: 'DESSERT',
        items: [
          { id: 'i-023', name: 'Creme Brulee', quantity: 2, modifiers: [], allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }, { type: 'egg', label: 'EGG', icon: '\u{1F95A}' }] },
        ],
      },
    ],
  },
  {
    id: 'ord-009',
    orderNumber: 29,
    orderType: 'delivery',
    status: 'new',
    tableName: 'DELIVERY',
    serverName: 'UberEats',
    timeReceived: new Date(Date.now() - 60000),
    elapsedSeconds: 60,
    targetSeconds: 1200,
    itemCount: 2,
    courses: [
      {
        course: 'ENTREE',
        items: [
          { id: 'i-024', name: 'Margherita Pizza', quantity: 1, modifiers: [{ text: '+ Extra Mozzarella', type: 'extra' }], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }, { type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }] },
          { id: 'i-025', name: 'Garlic Knots', quantity: 1, modifiers: [], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }] },
        ],
      },
    ],
  },
  {
    id: 'ord-010',
    orderNumber: 30,
    orderType: 'dine-in',
    status: 'seen',
    tableName: 'TABLE 2',
    serverName: 'Lisa W.',
    timeReceived: new Date(Date.now() - 360000),
    elapsedSeconds: 360,
    targetSeconds: 900,
    itemCount: 7,
    courses: [
      {
        course: 'APPETIZER',
        items: [
          { id: 'i-026', name: 'Calamari', quantity: 1, modifiers: [{ text: '+ Marinara', type: 'extra' }], allergens: [{ type: 'shellfish', label: 'SHELLFISH', icon: '\u{1F990}' }, { type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }] },
          { id: 'i-027', name: 'Caprese Salad', quantity: 1, modifiers: [], allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }] },
        ],
      },
      {
        course: 'ENTREE',
        items: [
          { id: 'i-028', name: 'Ribeye Steak', quantity: 1, modifiers: [{ text: 'Rare', type: 'neutral' }, { text: '+ Peppercorn Sauce', type: 'extra' }, { text: 'No Asparagus', type: 'remove' }], allergens: [] },
          { id: 'i-029', name: 'Sea Bass', quantity: 1, modifiers: [{ text: 'Pan Seared', type: 'neutral' }], allergens: [{ type: 'shellfish', label: 'FISH', icon: '\u{1F990}' }] },
          { id: 'i-030', name: 'Chicken Caesar Wrap', quantity: 1, modifiers: [{ text: '+ Avocado', type: 'extra' }], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }] },
        ],
      },
      {
        course: 'DESSERT',
        items: [
          { id: 'i-031', name: 'Chocolate Lava Cake', quantity: 1, modifiers: [{ text: '+ Vanilla Ice Cream', type: 'extra' }], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }, { type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }, { type: 'egg', label: 'EGG', icon: '\u{1F95A}' }] },
        ],
      },
    ],
  },
  {
    id: 'ord-011',
    orderNumber: 31,
    orderType: 'take-out',
    status: 'new',
    tableName: 'PICKUP',
    serverName: 'David H.',
    timeReceived: new Date(Date.now() - 45000),
    elapsedSeconds: 45,
    targetSeconds: 600,
    itemCount: 3,
    courses: [
      {
        course: 'ENTREE',
        items: [
          { id: 'i-032', name: 'Beef Burger', quantity: 2, modifiers: [{ text: 'Well Done', type: 'neutral' }, { text: '+ Bacon', type: 'extra' }, { text: 'No Pickles', type: 'remove' }], allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }, { type: 'sesame', label: 'SESAME', icon: '\u{1FAD8}' }] },
          { id: 'i-033', name: 'Fries', quantity: 1, modifiers: [{ text: 'Seasoned', type: 'neutral' }], allergens: [] },
        ],
      },
    ],
  },
  {
    id: 'ord-012',
    orderNumber: 32,
    orderType: 'banquet',
    status: 'in-progress',
    tableName: 'BANQUET B',
    serverName: 'Rachel G.',
    timeReceived: new Date(Date.now() - 780000),
    elapsedSeconds: 780,
    targetSeconds: 1800,
    itemCount: 10,
    courses: [
      {
        course: 'SALAD',
        isFired: true,
        items: [
          { id: 'i-034', name: 'Garden Salad', quantity: 5, modifiers: [{ text: 'Dressing on Side', type: 'neutral' }], allergens: [] },
        ],
      },
      {
        course: 'ENTREE',
        items: [
          { id: 'i-035', name: 'Roasted Chicken', quantity: 3, modifiers: [{ text: '+ Rosemary Jus', type: 'extra' }], allergens: [] },
          { id: 'i-036', name: 'Grilled Swordfish', quantity: 2, modifiers: [{ text: 'No Capers', type: 'remove' }], allergens: [{ type: 'shellfish', label: 'FISH', icon: '\u{1F990}' }] },
          { id: 'i-037', name: 'Eggplant Parmesan', quantity: 2, modifiers: [], allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }, { type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }] },
        ],
      },
      {
        course: 'DESSERT',
        items: [
          { id: 'i-038', name: 'Panna Cotta', quantity: 5, modifiers: [{ text: '+ Berry Coulis', type: 'extra' }], allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }] },
        ],
      },
    ],
  },
];

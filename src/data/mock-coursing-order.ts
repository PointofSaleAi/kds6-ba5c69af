import type { KDSOrder } from '@/types/kds';

export const mockCoursingOrder: KDSOrder = {
  id: 'coursing-order-32',
  orderNumber: 32,
  orderType: 'Banquet',
  tableOrLocation: 'Banquet B \u00B7 Table 6',
  elapsedTimer: '13:08',
  waiterName: 'Rachel G.',
  statusBadge: 'Preparing',
  courses: [
    {
      id: 'course-salad-32',
      name: 'Salad',
      status: 'fired',
      firedAgoLabel: '4:20 ago',
      items: [
        {
          id: 'item-garden-salad',
          name: 'Garden Salad',
          category: 'Salads',
          quantity: 5,
          modifiers: [{ text: 'Dressing on side', type: 'extra' }],
          allergens: [],
        },
      ],
    },
    {
      id: 'course-entree-32',
      name: 'Entree',
      status: 'active',
      prepTimerLabel: '6:42',
      items: [
        {
          id: 'item-roasted-chicken',
          name: 'Roasted Chicken',
          category: 'Poultry',
          quantity: 3,
          modifiers: [{ text: 'Rosemary Jus', type: 'extra' }],
          allergens: [],
        },
        {
          id: 'item-grilled-swordfish',
          name: 'Grilled Swordfish',
          category: 'Seafood',
          quantity: 2,
          modifiers: [{ text: 'No capers', type: 'remove' }],
          allergens: [{ type: 'shellfish', label: 'FISH', icon: '\u{1F41F}' }],
        },
        {
          id: 'item-eggplant-parmesan',
          name: 'Eggplant Parmesan',
          category: 'Vegetarian',
          quantity: 2,
          modifiers: [],
          allergens: [
            { type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' },
            { type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' },
          ],
        },
      ],
    },
    {
      id: 'course-dessert-32',
      name: 'Dessert',
      status: 'pending',
      autoFireLabel: 'Auto-fires in ~8 min',
      items: [
        {
          id: 'item-panna-cotta',
          name: 'Panna Cotta',
          category: 'Desserts',
          quantity: 5,
          modifiers: [{ text: 'Berry Coulis', type: 'extra' }],
          allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }],
        },
      ],
    },
  ],
};

export const mockCoursingOrder22: KDSOrder = {
  id: 'coursing-order-22',
  orderNumber: 22,
  orderType: 'Dine In',
  tableOrLocation: 'Table 12',
  elapsedTimer: '09:34',
  waiterName: 'Marcus T.',
  statusBadge: 'Preparing',
  courses: [
    {
      id: 'course-salad-22',
      name: 'Salad',
      status: 'fired',
      firedAgoLabel: '3:15 ago',
      items: [
        {
          id: 'item-caesar-salad-22',
          name: 'Caesar Salad',
          category: 'Salads',
          quantity: 2,
          modifiers: [{ text: 'Extra Croutons', type: 'extra' }],
          allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }],
        },
      ],
    },
    {
      id: 'course-entree-22',
      name: 'Entree',
      status: 'active',
      prepTimerLabel: '5:18',
      items: [
        {
          id: 'item-ribeye-22',
          name: 'Ribeye Steak',
          category: 'Meat',
          quantity: 1,
          modifiers: [
            { text: 'Medium rare', type: 'neutral' },
            { text: 'Truffle Butter', type: 'extra' },
          ],
          allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }],
        },
        {
          id: 'item-salmon-22',
          name: 'Pan-Seared Salmon',
          category: 'Seafood',
          quantity: 1,
          modifiers: [{ text: 'No dill', type: 'remove' }],
          allergens: [{ type: 'shellfish', label: 'FISH', icon: '\u{1F41F}' }],
        },
      ],
    },
    {
      id: 'course-dessert-22',
      name: 'Dessert',
      status: 'pending',
      autoFireLabel: 'Auto-fires in ~10 min',
      items: [
        {
          id: 'item-tiramisu-22',
          name: 'Tiramisu',
          category: 'Desserts',
          quantity: 2,
          modifiers: [],
          allergens: [
            { type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' },
            { type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' },
          ],
        },
      ],
    },
  ],
};

export const mockCoursingOrder24: KDSOrder = {
  id: 'coursing-order-24',
  orderNumber: 24,
  orderType: 'Take Out',
  tableOrLocation: 'Pickup',
  elapsedTimer: '07:12',
  waiterName: 'Sarah L.',
  statusBadge: 'Preparing',
  courses: [
    {
      id: 'course-salad-24',
      name: 'Salad',
      status: 'fired',
      firedAgoLabel: '5:00 ago',
      items: [
        {
          id: 'item-greek-salad-24',
          name: 'Greek Salad',
          category: 'Salads',
          quantity: 1,
          modifiers: [{ text: 'Extra Feta', type: 'extra' }],
          allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }],
        },
      ],
    },
    {
      id: 'course-entree-24',
      name: 'Entree',
      status: 'active',
      prepTimerLabel: '4:30',
      items: [
        {
          id: 'item-chicken-wrap-24',
          name: 'Chicken Wrap',
          category: 'Sandwiches',
          quantity: 2,
          modifiers: [
            { text: 'Extra Cheese', type: 'extra' },
            { text: 'No onions', type: 'remove' },
          ],
          allergens: [{ type: 'gluten', label: 'GLUTEN', icon: '\u{1F33E}' }],
        },
      ],
    },
    {
      id: 'course-dessert-24',
      name: 'Dessert',
      status: 'pending',
      autoFireLabel: 'Auto-fires in ~12 min',
      items: [
        {
          id: 'item-brownie-24',
          name: 'Chocolate Brownie',
          category: 'Desserts',
          quantity: 2,
          modifiers: [{ text: 'Vanilla Ice Cream', type: 'extra' }],
          allergens: [
            { type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' },
            { type: 'peanut', label: 'PEANUT', icon: '\u{1F95C}' },
          ],
        },
      ],
    },
  ],
};

export const allCoursingOrders: KDSOrder[] = [
  mockCoursingOrder22,
  mockCoursingOrder,
  mockCoursingOrder24,
];

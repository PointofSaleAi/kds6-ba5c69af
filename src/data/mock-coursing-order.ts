import type { KDSOrder } from '@/types/kds';

export const mockCoursingOrder: KDSOrder = {
  id: 'coursing-order-32',
  orderNumber: 32,
  orderType: 'Banquet',
  tableOrLocation: 'Banquet B \u00B7 Table 6',
  elapsedTimer: '13:08',
  waiterName: 'Rachel G.',
  statusBadge: 'In Progress',
  courses: [
    {
      id: 'course-salad',
      name: 'Salad',
      status: 'fired',
      firedAgoLabel: '4:20 ago',
      items: [
        {
          id: 'item-garden-salad',
          name: 'Garden Salad',
          quantity: 5,
          modifiers: [{ text: 'Dressing on side', type: 'extra' }],
          allergens: [],
        },
      ],
    },
    {
      id: 'course-entree',
      name: 'Entree',
      status: 'active',
      prepTimerLabel: '6:42',
      items: [
        {
          id: 'item-roasted-chicken',
          name: 'Roasted Chicken',
          quantity: 3,
          modifiers: [{ text: 'Rosemary Jus', type: 'extra' }],
          allergens: [],
        },
        {
          id: 'item-grilled-swordfish',
          name: 'Grilled Swordfish',
          quantity: 2,
          modifiers: [{ text: 'No Capers', type: 'remove' }],
          allergens: [{ type: 'shellfish', label: 'FISH', icon: '\u{1F41F}' }],
        },
        {
          id: 'item-eggplant-parmesan',
          name: 'Eggplant Parmesan',
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
      id: 'course-dessert',
      name: 'Dessert',
      status: 'pending',
      autoFireLabel: 'Auto-fires in ~8 min',
      items: [
        {
          id: 'item-panna-cotta',
          name: 'Panna Cotta',
          quantity: 5,
          modifiers: [{ text: 'Berry Coulis', type: 'extra' }],
          allergens: [{ type: 'dairy', label: 'DAIRY', icon: '\u{1F95B}' }],
        },
      ],
    },
  ],
};

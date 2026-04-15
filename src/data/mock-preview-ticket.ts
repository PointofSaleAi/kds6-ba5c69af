// TODO: Replace with API endpoint - all data should come from backend
// Static preview ticket for Settings > Language preview. Non-interactive, showcases all features.
import type { Order } from '@/types/kds';

export const previewTicket: Order = {
  id: 'preview-001',
  orderNumber: 42,
  orderType: 'dine-in',
  status: 'in-progress',
  tableName: 'TABLE 7',
  serverName: 'Alex M.',
  guestName: 'Sarah Chen',
  timeReceived: new Date(Date.now() - 480000),
  elapsedSeconds: 480,
  targetSeconds: 900,
  itemCount: 6,
  orderNotes: 'Birthday dinner, please bring candle with dessert',
  courses: [
    {
      course: 'APPETIZER',
      isFired: true,
      firedAt: new Date(Date.now() - 480000),
      firedAgoLabel: '8:00 ago',
      items: [
        {
          id: 'prev-i-001',
          name: 'Bruschetta',
          category: 'Appetizers',
          quantity: 2,
          modifiers: [
            { id: 'prev-m-001', text: 'Extra basil', type: 'extra' },
            { id: 'prev-m-002', text: 'No onion', type: 'remove' },
          ],
          allergens: [
            { type: 'gluten', label: 'Gluten', icon: '🌾' },
          ],
        },
        {
          id: 'prev-i-002',
          name: 'Soup of the Day',
          category: 'Soups',
          quantity: 1,
          modifiers: [
            { id: 'prev-m-003', text: 'Side bread', type: 'extra', isServable: true },
          ],
          allergens: [
            { type: 'dairy', label: 'Dairy', icon: '🥛' },
          ],
        },
      ],
    },
    {
      course: 'ENTREE',
      isFired: true,
      firedAt: new Date(Date.now() - 180000),
      firedAgoLabel: '3:00 ago',
      items: [
        {
          id: 'prev-i-003',
          name: 'Grilled Salmon',
          category: 'Seafood',
          quantity: 1,
          modifiers: [
            { id: 'prev-m-004', text: 'Medium rare', type: 'neutral' },
            { id: 'prev-m-005', text: 'Extra lemon', type: 'extra' },
          ],
          allergens: [
            { type: 'shellfish', label: 'Shellfish', icon: '🦐' },
          ],
        },
        {
          id: 'prev-i-004',
          name: 'Ribeye Steak',
          category: 'Meat',
          quantity: 1,
          modifiers: [
            { id: 'prev-m-006', text: 'Well done', type: 'neutral' },
            { id: 'prev-m-007', text: 'No mushroom sauce', type: 'remove' },
          ],
          allergens: [],
        },
      ],
    },
    {
      course: 'DESSERT',
      items: [
        {
          id: 'prev-i-005',
          name: 'Tiramisu',
          category: 'Desserts',
          quantity: 1,
          modifiers: [],
          allergens: [
            { type: 'gluten', label: 'Gluten', icon: '🌾' },
            { type: 'dairy', label: 'Dairy', icon: '🥛' },
            { type: 'egg', label: 'Egg', icon: '🥚' },
          ],
        },
        {
          id: 'prev-i-006',
          name: 'Fresh Fruit Platter',
          category: 'Desserts',
          quantity: 1,
          modifiers: [
            { id: 'prev-m-008', text: 'No pineapple', type: 'remove' },
          ],
          allergens: [
            { type: 'tree-nut', label: 'Tree Nut', icon: '🥜' },
          ],
        },
      ],
      autoFireLabel: 'Queued',
    },
  ],
};

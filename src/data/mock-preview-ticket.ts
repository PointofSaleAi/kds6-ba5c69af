// TODO: Replace with API endpoint - all data should come from backend
// Static preview ticket for Settings > Language preview. Non-interactive, showcases all features.
// All strings here MUST exist in translation dictionaries (productNames, modifierTexts, allergenLabels)
// in src/hooks/use-language.tsx so the preview reliably reflects the active language.
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
  itemCount: 5,
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
          name: 'Caesar Salad',
          category: 'Salads',
          quantity: 2,
          modifiers: [
            { id: 'prev-m-001', text: '+ Extra Croutons', type: 'extra' },
            { id: 'prev-m-002', text: 'Dressing on Side', type: 'neutral' },
          ],
          allergens: [
            { type: 'gluten', label: 'GLUTEN', icon: '🌾' },
            { type: 'dairy', label: 'DAIRY', icon: '🥛' },
          ],
        },
        {
          id: 'prev-i-002',
          name: 'Soup of the Day',
          category: 'Soups',
          quantity: 1,
          modifiers: [
            { id: 'prev-m-003', text: '+ Garlic Butter', type: 'extra', isServable: true },
          ],
          allergens: [
            { type: 'dairy', label: 'DAIRY', icon: '🥛' },
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
            { id: 'prev-m-004', text: 'Medium Rare', type: 'neutral' },
            { id: 'prev-m-005', text: '+ Lemon Sauce', type: 'extra' },
          ],
          allergens: [
            { type: 'fish', label: 'FISH', icon: '🐟' },
          ],
        },
        {
          id: 'prev-i-004',
          name: 'Ribeye Steak',
          category: 'Meat',
          quantity: 1,
          modifiers: [
            { id: 'prev-m-006', text: 'Well Done', type: 'neutral' },
            { id: 'prev-m-007', text: 'No Butter', type: 'remove' },
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
            { type: 'gluten', label: 'GLUTEN', icon: '🌾' },
            { type: 'dairy', label: 'DAIRY', icon: '🥛' },
            { type: 'egg', label: 'EGG', icon: '🥚' },
          ],
        },
      ],
      autoFireLabel: 'Queued',
    },
  ],
};

import type { Order } from '@/types/kds';

export const ONBOARDING_SAMPLE_ORDER_ID = 'onboarding-sample';

export function makeOnboardingSampleOrder(): Order {
  const now = Date.now();
  return {
    id: ONBOARDING_SAMPLE_ORDER_ID,
    orderNumber: 101,
    orderType: 'dine-in',
    status: 'new',
    tableName: 'TABLE 1',
    serverName: 'Trainer',
    guestName: 'Sample Guest',
    timeReceived: new Date(now - 60_000),
    elapsedSeconds: 60,
    targetSeconds: 900,
    itemCount: 3,
    courses: [
      {
        course: 'ENTREE',
        isFired: true,
        firedAt: new Date(now - 60_000),
        items: [
          {
            id: 'onb-i-1',
            name: 'Grilled Salmon',
            category: 'Seafood',
            quantity: 1,
            modifiers: [],
            allergens: [],
            station: 'Grill',
          },
          {
            id: 'onb-i-2',
            name: 'Caesar Salad',
            category: 'Salads',
            quantity: 1,
            modifiers: [],
            allergens: [],
            station: 'Salad',
          },
          {
            id: 'onb-i-3',
            name: 'Truffle Fries',
            category: 'Sides',
            quantity: 1,
            modifiers: [],
            allergens: [],
            station: 'Fry',
          },
        ],
      },
    ],
  };
}

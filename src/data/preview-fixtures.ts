import type { Order } from '@/types/kds';
import { previewTicket } from './mock-preview-ticket';

export type PreviewState = 'normal' | 'rush' | 'allergy';

/** Rush fixture: overdue timer, denser secondary detail. */
const rushTicket: Order = {
  ...previewTicket,
  id: 'preview-rush',
  orderNumber: 108,
  timeReceived: new Date(Date.now() - 1_500_000),
  elapsedSeconds: 1500,
  targetSeconds: 900,
  status: 'preparing',
  orderNotes: 'Rush: table waiting, expedite mains',
};

/** Allergy fixture: highlights critical allergens on the primary course. */
const allergyTicket: Order = {
  ...previewTicket,
  id: 'preview-allergy',
  orderNumber: 77,
  orderNotes: 'CRITICAL: shellfish allergy on table',
  courses: previewTicket.courses.map((c, idx) =>
    idx === 1
      ? {
          ...c,
          items: c.items.map((it, i) =>
            i === 0
              ? {
                  ...it,
                  allergens: [
                    { type: 'shellfish', label: 'SHELLFISH', icon: '🦐' },
                    { type: 'peanut', label: 'PEANUT', icon: '🥜' },
                  ],
                }
              : it,
          ),
        }
      : c,
  ),
};

export function getFixtureForState(state: PreviewState): Order {
  if (state === 'rush') return rushTicket;
  if (state === 'allergy') return allergyTicket;
  return previewTicket;
}

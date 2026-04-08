import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderAllergenStrip } from '../OrderAllergenStrip';
import type { Order } from '@/types/kds';

const makeOrder = (allergens: { type: string; label: string; icon: string }[]): Order => ({
  id: 'o1',
  orderNumber: 100,
  orderType: 'dine-in',
  status: 'new',
  tableName: 'T1',
  serverName: 'John',
  timeReceived: new Date(),
  elapsedSeconds: 0,
  targetSeconds: 600,
  itemCount: 1,
  courses: [{
    course: 'ENTREE',
    items: [{
      id: 'i1',
      name: 'Burger',
      quantity: 1,
      modifiers: [],
      allergens: allergens as any,
    }],
  }],
});

describe('OrderAllergenStrip', () => {
  it('renders nothing when no allergens', () => {
    const { container } = render(<OrderAllergenStrip order={makeOrder([])} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders allergen badges when present', () => {
    const order = makeOrder([{ type: 'peanut', label: 'Peanut', icon: '🥜' }]);
    render(<OrderAllergenStrip order={order} />);
    expect(screen.getByText('Peanut')).toBeInTheDocument();
  });

  it('deduplicates allergens across items', () => {
    const order: Order = {
      ...makeOrder([]),
      courses: [{
        course: 'ENTREE',
        items: [
          { id: 'i1', name: 'A', quantity: 1, modifiers: [], allergens: [{ type: 'gluten', label: 'Gluten', icon: '🌾' }] as any },
          { id: 'i2', name: 'B', quantity: 1, modifiers: [], allergens: [{ type: 'gluten', label: 'Gluten', icon: '🌾' }] as any },
        ],
      }],
    };
    render(<OrderAllergenStrip order={order} />);
    expect(screen.getAllByText('Gluten')).toHaveLength(1);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderNotesSection } from '../OrderNotesSection';

describe('OrderNotesSection', () => {
  it('renders order notes text', () => {
    render(<OrderNotesSection notes="No onions please" orderId="o1" />);
    expect(screen.getByText('No onions please')).toBeInTheDocument();
    expect(screen.getByText('Order Notes')).toBeInTheDocument();
  });

  it('toggles between unseen and acknowledged on tap', () => {
    const onAck = vi.fn();
    render(<OrderNotesSection notes="Extra sauce" orderId="o1" onAcknowledgeNotes={onAck} />);
    // Initial: unseen (eye icon)
    expect(screen.getByTitle('Acknowledge notes')).toBeInTheDocument();
    // Tap: unseen -> acknowledged (tick)
    fireEvent.click(screen.getByTitle('Acknowledge notes'));
    expect(onAck).toHaveBeenCalledWith('o1');
    expect(screen.getByTitle('Mark as unseen')).toBeInTheDocument();
    // Tap again: acknowledged -> unseen (eye)
    fireEvent.click(screen.getByTitle('Mark as unseen'));
    expect(screen.getByTitle('Acknowledge notes')).toBeInTheDocument();
  });
});

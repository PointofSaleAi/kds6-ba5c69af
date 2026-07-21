import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderNotesSection } from '../OrderNotesSection';

describe('OrderNotesSection', () => {
  it('renders order notes text', () => {
    render(<OrderNotesSection notes="No onions please" orderId="o1" />);
    expect(screen.getByText('No onions please')).toBeInTheDocument();
    expect(screen.getByText('Order Notes')).toBeInTheDocument();
  });

  it('toggles acknowledgement on tapping the notes row', () => {
    const onAck = vi.fn();
    render(<OrderNotesSection notes="Extra sauce" orderId="o1" onAcknowledgeNotes={onAck} />);
    const row = screen.getByRole('button', { name: 'Acknowledge Notes' });
    fireEvent.click(row);
    expect(onAck).toHaveBeenCalledWith('o1');
    expect(screen.getByRole('button', { name: 'Mark Notes as Unseen' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mark Notes as Unseen' }));
    expect(screen.getByRole('button', { name: 'Acknowledge Notes' })).toBeInTheDocument();
  });
});

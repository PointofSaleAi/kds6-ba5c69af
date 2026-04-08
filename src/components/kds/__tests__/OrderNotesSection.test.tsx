import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderNotesSection } from '../OrderNotesSection';

describe('OrderNotesSection', () => {
  it('renders order notes text', () => {
    render(<OrderNotesSection notes="No onions please" orderId="o1" />);
    expect(screen.getByText('No onions please')).toBeInTheDocument();
    expect(screen.getByText('Order Notes')).toBeInTheDocument();
  });

  it('calls onAcknowledgeNotes when eye icon is clicked', () => {
    const onAck = vi.fn();
    render(<OrderNotesSection notes="Extra sauce" orderId="o1" onAcknowledgeNotes={onAck} />);
    fireEvent.click(screen.getByTitle('Acknowledge notes'));
    expect(onAck).toHaveBeenCalledWith('o1');
  });

  it('toggles acknowledged state on click', () => {
    render(<OrderNotesSection notes="Test" orderId="o1" />);
    const btn = screen.getByTitle('Acknowledge notes');
    fireEvent.click(btn);
    expect(screen.getByTitle('Acknowledged')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Acknowledged'));
    expect(screen.getByTitle('Acknowledge notes')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderNotesSection } from '../OrderNotesSection';

describe('OrderNotesSection', () => {
  it('renders order notes text', () => {
    render(<OrderNotesSection notes="No onions please" orderId="o1" />);
    expect(screen.getByText('No onions please')).toBeInTheDocument();
    expect(screen.getByText('Order Notes')).toBeInTheDocument();
  });

  it('calls onAcknowledgeNotes when reaching acknowledged state', () => {
    const onAck = vi.fn();
    render(<OrderNotesSection notes="Extra sauce" orderId="o1" onAcknowledgeNotes={onAck} />);
    // First tap: unseen -> seen
    fireEvent.click(screen.getByTitle('Acknowledge notes'));
    expect(onAck).not.toHaveBeenCalled();
    // Second tap: seen -> acknowledged
    fireEvent.click(screen.getByTitle('Confirm acknowledged'));
    expect(onAck).toHaveBeenCalledWith('o1');
  });

  it('progresses through three states: unseen -> seen -> acknowledged', () => {
    render(<OrderNotesSection notes="Test" orderId="o1" />);
    // Initial: unseen
    expect(screen.getByTitle('Acknowledge notes')).toBeInTheDocument();
    // Tap 1: seen
    fireEvent.click(screen.getByTitle('Acknowledge notes'));
    expect(screen.getByTitle('Confirm acknowledged')).toBeInTheDocument();
    // Tap 2: acknowledged (final)
    fireEvent.click(screen.getByTitle('Confirm acknowledged'));
    expect(screen.getByTitle('Acknowledged')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCardActions } from '../OrderCardActions';

// Mock the language hook
vi.mock('@/hooks/use-language', () => ({
  useLanguage: () => ({
    t: { seen: 'SEEN', inProgress: 'IN PROGRESS', done: 'DONE' },
  }),
}));

describe('OrderCardActions', () => {
  it('shows SEEN button for seen ticket state', () => {
    render(<OrderCardActions orderId="o1" ticketState="seen" />);
    expect(screen.getByText('SEEN')).toBeInTheDocument();
  });

  it('shows IN PROGRESS button for in-progress ticket state', () => {
    render(<OrderCardActions orderId="o1" ticketState="in-progress" />);
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('shows DONE button for done ticket state', () => {
    render(<OrderCardActions orderId="o1" ticketState="done" />);
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });

  it('hides undo button for seen state', () => {
    render(<OrderCardActions orderId="o1" ticketState="seen" />);
    expect(screen.queryByTitle('Go back')).not.toBeInTheDocument();
  });

  it('shows undo button for in-progress state', () => {
    render(<OrderCardActions orderId="o1" ticketState="in-progress" onTicketRecall={vi.fn()} />);
    expect(screen.getByTitle('Go back')).toBeInTheDocument();
  });

  it('calls onTicketAdvance when main button clicked', () => {
    const onAdvance = vi.fn();
    render(<OrderCardActions orderId="o1" ticketState="seen" onTicketAdvance={onAdvance} />);
    fireEvent.click(screen.getByText('SEEN'));
    expect(onAdvance).toHaveBeenCalledWith('o1');
  });

  it('calls onTicketRecall when undo button clicked', () => {
    const onRecall = vi.fn();
    render(<OrderCardActions orderId="o1" ticketState="in-progress" onTicketRecall={onRecall} />);
    fireEvent.click(screen.getByTitle('Go back'));
    expect(onRecall).toHaveBeenCalledWith('o1');
  });
});

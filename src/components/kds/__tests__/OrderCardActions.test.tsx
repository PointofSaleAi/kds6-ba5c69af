import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCardActions } from '../OrderCardActions';

// Mock the language hook
vi.mock('@/hooks/use-language', () => ({
  useLanguage: () => ({
    t: { seen: 'SEEN', preparing: 'PREPARING', done: 'DONE' },
  }),
}));

describe('OrderCardActions', () => {
  it('labels the next action (PREPARING) for a seen ticket', () => {
    render(<OrderCardActions orderId="o1" ticketState="seen" />);
    expect(screen.getByText('PREPARING')).toBeInTheDocument();
  });

  it('labels the next action (READY) for a preparing ticket', () => {
    render(<OrderCardActions orderId="o1" ticketState="preparing" />);
    expect(screen.getByText('READY')).toBeInTheDocument();
  });

  it('labels the next action (DONE) for a ready ticket', () => {
    render(<OrderCardActions orderId="o1" ticketState="ready" />);
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });

  it('hides undo button for seen state', () => {
    render(<OrderCardActions orderId="o1" ticketState="seen" />);
    expect(screen.queryByTitle('Go Back')).not.toBeInTheDocument();
  });

  it('shows undo button for preparing state', () => {
    render(<OrderCardActions orderId="o1" ticketState="preparing" onTicketRecall={vi.fn()} />);
    expect(screen.getByTitle('Go Back')).toBeInTheDocument();
  });

  it('calls onTicketAdvance when main button clicked', () => {
    const onAdvance = vi.fn();
    render(<OrderCardActions orderId="o1" ticketState="seen" onTicketAdvance={onAdvance} />);
    fireEvent.click(screen.getByText('PREPARING'));
    expect(onAdvance).toHaveBeenCalledWith('o1');
  });

  it('calls onTicketRecall when undo button clicked', () => {
    const onRecall = vi.fn();
    render(<OrderCardActions orderId="o1" ticketState="preparing" onTicketRecall={onRecall} />);
    fireEvent.click(screen.getByTitle('Go Back'));
    expect(onRecall).toHaveBeenCalledWith('o1');
  });
});

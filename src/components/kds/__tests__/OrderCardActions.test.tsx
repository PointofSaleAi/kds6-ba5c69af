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
  describe('non-dine-in orders', () => {
    it('shows SEEN button for new orders', () => {
      render(<OrderCardActions orderId="o1" status="new" />);
      expect(screen.getByText('SEEN')).toBeInTheDocument();
    });

    it('shows IN PROGRESS button for seen orders', () => {
      render(<OrderCardActions orderId="o1" status="seen" />);
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    });

    it('shows DONE button for in-progress orders', () => {
      render(<OrderCardActions orderId="o1" status="in-progress" />);
      expect(screen.getByText('DONE')).toBeInTheDocument();
    });
  });

  describe('dine-in orders', () => {
    it('shows IN PROGRESS button for new orders (skips SEEN)', () => {
      render(<OrderCardActions orderId="o1" status="new" isDineIn />);
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
      expect(screen.queryByText('SEEN')).not.toBeInTheDocument();
    });

    it('shows IN PROGRESS button for seen orders', () => {
      render(<OrderCardActions orderId="o1" status="seen" isDineIn />);
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    });

    it('shows DONE button for in-progress orders', () => {
      render(<OrderCardActions orderId="o1" status="in-progress" isDineIn />);
      expect(screen.getByText('DONE')).toBeInTheDocument();
    });
  });

  it('hides buttons for served orders', () => {
    const { container } = render(<OrderCardActions orderId="o1" status="served" />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('shows undo button for non-new statuses', () => {
    render(<OrderCardActions orderId="o1" status="seen" onRecall={vi.fn()} />);
    expect(screen.getByTitle('Go back')).toBeInTheDocument();
  });

  it('hides undo button for new orders', () => {
    render(<OrderCardActions orderId="o1" status="new" />);
    expect(screen.queryByTitle('Go back')).not.toBeInTheDocument();
  });

  it('calls onBump when main button clicked', () => {
    const onBump = vi.fn();
    render(<OrderCardActions orderId="o1" status="new" onBump={onBump} />);
    fireEvent.click(screen.getByText('SEEN'));
    expect(onBump).toHaveBeenCalledWith('o1');
  });

  it('calls onRecall when undo button clicked', () => {
    const onRecall = vi.fn();
    render(<OrderCardActions orderId="o1" status="seen" onRecall={onRecall} />);
    fireEvent.click(screen.getByTitle('Go back'));
    expect(onRecall).toHaveBeenCalledWith('o1');
  });
});

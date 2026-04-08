import { ArrowRight } from 'lucide-react';

interface ReRouteButtonProps {
  onClick: () => void;
  size?: 'item' | 'ticket';
}

export function ReRouteButton({ onClick, size = 'item' }: ReRouteButtonProps) {
  const isTicket = size === 'ticket';

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center justify-center shrink-0 transition-colors rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px] bg-muted hover:bg-muted/80"
      title={isTicket ? 'Re-route ticket' : 'Re-route item'}
    >
      {isTicket ? (
        <svg width={16} height={16} viewBox="0 0 14 14" fill="none" className="text-text-secondary" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="1" width="4" height="4" rx="0.5" />
          <rect x="9" y="1" width="4" height="4" rx="0.5" />
          <rect x="5" y="9" width="4" height="4" rx="0.5" />
          <line x1="3" y1="5" x2="3" y2="7" />
          <line x1="11" y1="5" x2="11" y2="7" />
          <line x1="3" y1="7" x2="11" y2="7" />
          <line x1="7" y1="7" x2="7" y2="9" />
        </svg>
      ) : (
        <ArrowRight size={16} className="text-text-secondary" strokeWidth={2} />
      )}
    </button>
  );
}

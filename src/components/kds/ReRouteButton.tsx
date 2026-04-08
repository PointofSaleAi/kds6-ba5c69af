import { ArrowRight } from 'lucide-react';

interface ReRouteButtonProps {
  onClick: () => void;
  size?: 'item' | 'ticket';
}

export function ReRouteButton({ onClick, size = 'item' }: ReRouteButtonProps) {
  const isTicket = size === 'ticket';
  const dim = isTicket ? 30 : 26;
  const iconSize = isTicket ? 14 : 12;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center justify-center shrink-0 transition-colors"
      style={{
        width: dim,
        height: dim,
        borderRadius: 6,
        backgroundColor: '#2d1f3d',
        border: '1px solid #4c3566',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#3d2a52'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#2d1f3d'; }}
      title={isTicket ? 'Re-route ticket' : 'Re-route item'}
    >
      {isTicket ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 14 14" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="1" width="4" height="4" rx="0.5" />
          <rect x="9" y="1" width="4" height="4" rx="0.5" />
          <rect x="5" y="9" width="4" height="4" rx="0.5" />
          <line x1="3" y1="5" x2="3" y2="7" />
          <line x1="11" y1="5" x2="11" y2="7" />
          <line x1="3" y1="7" x2="11" y2="7" />
          <line x1="7" y1="7" x2="7" y2="9" />
        </svg>
      ) : (
        <ArrowRight size={iconSize} color="#a78bfa" strokeWidth={2} />
      )}
    </button>
  );
}

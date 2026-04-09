import { useState } from 'react';
import { Eye, Check, Undo2, BellRing } from 'lucide-react';

export type KdsIconType = 'seen' | 'preparing' | 'ready' | 'undo' | 'acknowledged';

interface KdsActionIconProps {
  icon: KdsIconType;
  onClick?: () => void;
  label?: string;
  title?: string;
  disabled?: boolean;
}

const stateStyles: Record<KdsIconType, { bg: string; border: string; iconColor: string; IconComponent: typeof Eye }> = {
  seen: {
    bg: '#FFFFFF',
    border: '2px solid #3B82F6',
    iconColor: '#3B82F6',
    IconComponent: Eye,
  },
  preparing: {
    bg: '#D1D5DB',
    border: 'none',
    iconColor: '#EF4444',
    IconComponent: BellRing,
  },
  ready: {
    bg: '#EDE9FE',
    border: 'none',
    iconColor: '#7C3AED',
    IconComponent: Check,
  },
  acknowledged: {
    bg: '#EDE9FE',
    border: 'none',
    iconColor: '#7C3AED',
    IconComponent: Check,
  },
  undo: {
    bg: '#FFFFFF',
    border: '2px solid #94A3B8',
    iconColor: '#64748B',
    IconComponent: Undo2,
  },
};

export function KdsActionIcon({ icon, onClick, label, title, disabled }: KdsActionIconProps) {
  const [animating, setAnimating] = useState(false);
  const style = stateStyles[icon];
  const { IconComponent } = style;

  const handleClick = () => {
    if (disabled) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 150);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center justify-center min-w-[44px] min-h-[33px] ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      aria-label={label ?? icon}
      title={title}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 30,
          height: 30,
          backgroundColor: style.bg,
          border: style.border,
          transition: 'all 150ms ease',
          transform: animating ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        <IconComponent size={16} color={style.iconColor} strokeWidth={2.5} />
      </div>
    </button>
  );
}

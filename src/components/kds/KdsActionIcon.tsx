import { useState } from 'react';
import { Eye, EyeOff, Check, Undo2, ConciergeBell, CheckCircle } from 'lucide-react';

export type KdsIconType = 'seen' | 'preparing' | 'ready' | 'undo' | 'acknowledged' | 'done' | 'seen-filled';

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
  'seen-filled': {
    bg: '#DBEAFE',
    border: 'none',
    iconColor: '#2563EB',
    IconComponent: Eye,
  },
  preparing: {
    bg: '#FFC5C5',
    border: 'none',
    iconColor: '#D32F2F',
    IconComponent: ConciergeBell,
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
  done: {
    bg: '#DCFCE7',
    border: 'none',
    iconColor: '#16A34A',
    IconComponent: CheckCircle,
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
      className={`flex items-center justify-center min-w-[34px] min-h-[33px] ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      aria-label={label ?? icon}
      title={title}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 'var(--kds-eye-icon)',
          height: 'var(--kds-eye-icon)',
          backgroundColor: style.bg,
          border: style.border,
          transition: 'all 150ms ease',
          transform: animating ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        {style.IconComponent && <style.IconComponent style={{ width: 'var(--kds-eye-inner)', height: 'var(--kds-eye-inner)' }} color={style.iconColor} strokeWidth={2.5} />}
      </div>
    </button>
  );
}

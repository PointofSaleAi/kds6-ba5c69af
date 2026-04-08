import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import readyIcon from '@/assets/item-ready-icon.svg';
import undoIcon from '@/assets/undo-icon.svg';
import acknowledgedIcon from '@/assets/acknowledged-icon.svg';

const iconMap = {
  seen: { src: seenIcon, alt: 'Seen' },
  preparing: { src: preparingIcon, alt: 'Preparing' },
  ready: { src: readyIcon, alt: 'Ready' },
  undo: { src: undoIcon, alt: 'Undo' },
  acknowledged: { src: acknowledgedIcon, alt: 'Acknowledged' },
} as const;

export type KdsIconType = keyof typeof iconMap;

interface KdsActionIconProps {
  icon: KdsIconType;
  onClick?: () => void;
  label?: string;
  title?: string;
  disabled?: boolean;
}

export function KdsActionIcon({ icon, onClick, label, title, disabled }: KdsActionIconProps) {
  const { src, alt } = iconMap[icon];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px] ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      aria-label={label ?? alt}
      title={title}
    >
      <img src={src} alt={alt} style={{ width: 40, height: 30 }} />
    </button>
  );
}

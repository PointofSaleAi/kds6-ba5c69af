import type { LucideIcon } from 'lucide-react';

interface SettingsIconTileProps {
  icon: LucideIcon;
  bgColor: string;
  size?: 'xs' | 'sm' | 'lg';
  iconColor?: string;
}

/**
 * Colored rounded square icon tile used across the settings UI.
 * `xs` (29px) for compact nav rows, `sm` (36px) for pill rows, `lg` (64px) for section header cards.
 */
export function SettingsIconTile({
  icon: Icon,
  bgColor,
  size = 'sm',
  iconColor = '#FFFFFF',
}: SettingsIconTileProps) {
  const dim = size === 'lg' ? 64 : size === 'xs' ? 29 : 36;
  const radius = size === 'lg' ? 16 : size === 'xs' ? 8 : 10;
  const iconSize = size === 'lg' ? 28 : size === 'xs' ? 16 : 18;
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: dim,
        height: dim,
        borderRadius: radius,
        backgroundColor: bgColor,
      }}
    >
      <Icon size={iconSize} color={iconColor} strokeWidth={2.2} />
    </div>
  );
}

export default SettingsIconTile;

import type { LucideIcon } from 'lucide-react';

interface SettingsIconTileProps {
  icon: LucideIcon;
  bgColor: string;
  size?: 'sm' | 'lg';
  iconColor?: string;
}

/**
 * Colored rounded square icon tile used across the settings UI.
 * `sm` (36px) for pill rows, `lg` (64px) for section header cards.
 */
export function SettingsIconTile({
  icon: Icon,
  bgColor,
  size = 'sm',
  iconColor = '#FFFFFF',
}: SettingsIconTileProps) {
  const dim = size === 'lg' ? 64 : 36;
  const radius = size === 'lg' ? 16 : 10;
  const iconSize = size === 'lg' ? 28 : 18;
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

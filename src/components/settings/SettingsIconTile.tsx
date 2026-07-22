import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SettingsIconTileProps {
  icon: LucideIcon;
  bgColor: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  iconColor?: string;
  iconSrc?: string;
  iconNode?: ReactNode;
}

/**
 * Colored rounded square icon tile used across the settings UI.
 * `xs` (29px) for compact nav rows, `sm` (28px) for pill rows,
 * `md` (36px) for hero header inline, `lg` (64px) for legacy section headers.
 */
export function SettingsIconTile({
  icon: Icon,
  bgColor,
  size = 'sm',
  iconColor = '#FFFFFF',
  iconSrc,
  iconNode,
}: SettingsIconTileProps) {
  const dim = size === 'lg' ? 64 : size === 'md' ? 36 : size === 'xs' ? 28 : 28;
  const radius = size === 'lg' ? 16 : size === 'md' ? 10 : size === 'xs' ? 7 : 8;
  const iconSize = size === 'lg' ? 28 : size === 'md' ? 18 : size === 'xs' ? 16 : 16;
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: dim,
        height: dim,
        borderRadius: radius,
        backgroundColor: bgColor,
        color: iconColor,
      }}
    >
      {iconNode ? (
        iconNode
      ) : iconSrc ? (
        <img src={iconSrc} alt="" style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} />
      ) : (
        <Icon size={iconSize} color={iconColor} strokeWidth={2.2} />
      )}
    </div>
  );
}

export default SettingsIconTile;

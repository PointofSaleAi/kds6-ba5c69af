interface ClocheIconProps {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

// Cloche (food dome cover) icon
export const ClocheIcon = ({ size = 18, className, color = 'currentColor', strokeWidth = 2 }: ClocheIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Top knob */}
    <line x1="12" y1="3" x2="12" y2="5" />
    {/* Dome */}
    <path d="M3.5 18a8.5 8.5 0 0 1 17 0" />
    {/* Base tray */}
    <line x1="2" y1="18" x2="22" y2="18" />
  </svg>
);

export default ClocheIcon;

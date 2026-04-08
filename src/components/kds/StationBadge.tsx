import type { StationName } from '@/types/kds';

const stationColors: Record<StationName, { bg: string; text: string }> = {
  Grill:   { bg: '#14532d', text: '#4ade80' },
  Fry:     { bg: '#1e3a5f', text: '#93c5fd' },
  Salad:   { bg: '#14451a', text: '#86efac' },
  Dessert: { bg: '#3b0764', text: '#d8b4fe' },
  Bar:     { bg: '#374151', text: '#9ca3af' },
};

interface StationBadgeProps {
  station: StationName;
}

export function StationBadge({ station }: StationBadgeProps) {
  const colors = stationColors[station];
  return (
    <span
      className="inline-flex items-center rounded shrink-0"
      style={{
        fontSize: '9px',
        fontWeight: 600,
        padding: '1px 5px',
        borderRadius: '4px',
        backgroundColor: colors.bg,
        color: colors.text,
        lineHeight: '1.4',
      }}
    >
      {station}
    </span>
  );
}

export { stationColors };

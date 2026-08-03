/** Inline SVG icon set ported verbatim from the kds-tickets.html reference. */

export const GLASS_ICON_PATHS = {
  table: <><path d="M3 10h18" /><path d="M5 10V7h14v3" /><path d="M7 10v4" /><path d="M17 10v4" /><path d="M3 18h18" /></>,
  pickup: <><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  delivery: <><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /><path d="M9 18h6l-3-9H8" /><path d="M13 9h4l1 6" /></>,
  drive: <><path d="M4 15h16" /><path d="M5 15V11l2-4h10l2 4v4" /><circle cx="7.5" cy="17.5" r="1.6" /><circle cx="16.5" cy="17.5" r="1.6" /></>,
  curb: <><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
  banquet: <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="3.4" /><path d="M22 20v-2a4 4 0 0 0-3-3.9" /><path d="M16 4.2a3.4 3.4 0 0 1 0 5.6" /></>,
  runner: <><circle cx="13" cy="4" r="2" /><path d="m6 21 3-6 3 2 1 4" /><path d="M9 15 8 9l4-2 3 4 3 1" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  dome: <><path d="M3 18h18" /><path d="M4 15a8 8 0 0 1 16 0" /><path d="M12 7V5" /></>,
  tick: <><path d="M20 6 9 17l-5-5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  chevD: <><path d="m6 9 6 6 6-6" /></>,
  chevR: <><path d="m9 18 6-6-6-6" /></>,
  back: <><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10H9" /></>,
  chat: <><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></>,
  note: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 8h7" /><path d="M7 12h10" /><path d="M7 16h6" /></>,
  warn: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5" /><path d="M12 17.4v.2" /></>,
};

export type GlassIconName = keyof typeof GLASS_ICON_PATHS;

export function GlassIcon({
  name,
  size,
  sw = 1.9,
  stroke = 'currentColor',
}: {
  name: GlassIconName;
  size: number;
  sw?: number;
  stroke?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLASS_ICON_PATHS[name]}
    </svg>
  );
}

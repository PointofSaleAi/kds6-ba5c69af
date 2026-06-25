/**
 * App-wide date/time formatting helpers.
 *
 * Standards:
 * - Time: 12-hour with AM/PM, no seconds (e.g. "1:15 PM")
 * - Date: Day-first long form (e.g. "25 June 2026")
 * - Date + time: "25 June 2026, 1:15 PM"
 *
 * Always use these helpers instead of `toLocaleTimeString` / `toLocaleDateString`
 * to keep formatting consistent across the entire KDS frontend.
 */

type DateInput = Date | string | number | null | undefined;

function toDate(input: DateInput): Date | null {
  if (input == null) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/** "1:15 PM" — 12h, no leading zero on hour, no seconds. */
export function formatTime(input: DateInput): string {
  const d = toDate(input);
  if (!d) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** "25 June 2026" — day-first long form. */
export function formatDate(input: DateInput): string {
  const d = toDate(input);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "25 June 2026, 1:15 PM". */
export function formatDateTime(input: DateInput): string {
  const d = toDate(input);
  if (!d) return '';
  return `${formatDate(d)}, ${formatTime(d)}`;
}

/** Relative time: "Just now", "5m ago", "2h ago", or absolute date if older than 24h. */
export function formatTimeAgo(input: DateInput): string {
  const d = toDate(input);
  if (!d) return '';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDate(d);
}

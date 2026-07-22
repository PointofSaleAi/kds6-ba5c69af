import { useMemo, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useActiveIdentity, initialsFromName, colorFromString } from '@/hooks/use-active-identity';

interface ShiftProfilePopupProps {
  open: boolean;
  onClose: () => void;
}

type TabKey = 'today' | 'total';

function formatMinutes(sec: number | null): string {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
function formatHours(hours: number | null): string {
  if (hours == null) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}
function formatPct(v: number | null): string {
  if (v == null) return '—';
  return `${Math.round(v * 100)}%`;
}
function formatCount(v: number | null): string {
  if (v == null) return '—';
  return v.toLocaleString('en-US');
}
function queueDotColor(n: number): string {
  if (n <= 5) return '#16A085';
  if (n <= 10) return '#F39C12';
  return '#E84C3D';
}

/**
 * Employee profile / performance summary popup shown when tapping the
 * identity chip in the KDS header. Uses the same data source as
 * Settings → Account → Performance Summary, with a Today/Total toggle.
 * Adapts to light and dark themes via semantic tokens.
 */
export function ShiftProfilePopup({ open, onClose }: ShiftProfilePopupProps) {
  const {
    identity,
    ticketsToday, ticketsTotal,
    avgTicketTimeSec, avgTicketTimeAllTimeSec,
    hoursWorked, hoursWorkedTotal,
    ticketsInQueue, overtimeToday, overtimeTotal,
    onTimeRateToday, onTimeRateAllTime,
    itemsPreparedToday, itemsPreparedTotal,
    busiestHourLabel,
  } = useActiveIdentity();
  const [tab, setTab] = useState<TabKey>('today');

  const isStaff = identity.kind === 'staff';
  const displayName = identity.name;
  const roleLabel = isStaff ? identity.role : 'Device';
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const avatarBg = useMemo(() => colorFromString(displayName + roleLabel), [displayName, roleLabel]);

  type Card = { label: string; value: ReactNode };

  const restaurantCards: Card[] = tab === 'today'
    ? [
        { label: 'Tickets Today', value: formatCount(ticketsToday) },
        { label: 'Avg Ticket Time', value: formatMinutes(avgTicketTimeSec) },
        {
          label: 'Tickets in Queue',
          value: (
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: queueDotColor(ticketsInQueue) }} />
              {formatCount(ticketsInQueue)}
            </span>
          ),
        },
        { label: 'Overtime Tickets', value: formatCount(overtimeToday) },
        { label: 'On-time Rate', value: formatPct(onTimeRateToday) },
        { label: 'Items Prepared', value: formatCount(itemsPreparedToday) },
      ]
    : [
        { label: 'Total Tickets', value: formatCount(ticketsTotal) },
        { label: 'Avg Ticket Time', value: formatMinutes(avgTicketTimeAllTimeSec) },
        { label: 'Busiest Hour', value: busiestHourLabel ?? '—' },
        { label: 'Total Overtime Tickets', value: formatCount(overtimeTotal) },
        { label: 'On-time Rate', value: formatPct(onTimeRateAllTime) },
        { label: 'Total Items Prepared', value: formatCount(itemsPreparedTotal) },
      ];

  const staffCards: Card[] = tab === 'today'
    ? [
        { label: 'Tickets Completed', value: formatCount(ticketsToday) },
        { label: 'Hours Worked', value: formatHours(hoursWorked) },
        { label: 'Avg Ticket Time', value: formatMinutes(avgTicketTimeSec) },
        { label: 'Items Prepared', value: formatCount(itemsPreparedToday) },
        { label: 'On-time Rate', value: formatPct(onTimeRateToday) },
        { label: 'Overtime Tickets', value: formatCount(overtimeToday) },
      ]
    : [
        { label: 'Total Tickets Completed', value: formatCount(ticketsTotal) },
        { label: 'Total Hours Worked', value: formatHours(hoursWorkedTotal) },
        { label: 'Avg Ticket Time', value: formatMinutes(avgTicketTimeAllTimeSec) },
        { label: 'Total Items Prepared', value: formatCount(itemsPreparedTotal) },
        { label: 'On-time Rate', value: formatPct(onTimeRateAllTime) },
        { label: 'Total Overtime Tickets', value: formatCount(overtimeTotal) },
      ];

  const cards = isStaff ? staffCards : restaurantCards;

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        className="relative z-10 w-[560px] max-w-[92vw] max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl p-6"
        style={{
          background: 'hsl(var(--surface-card))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--text-primary))',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'hsl(var(--muted))' }}
        >
          <X className="w-4 h-4" style={{ color: 'hsl(var(--text-secondary))' }} />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ background: avatarBg }}
          >
            {initials}
          </div>
          <h3 className="mt-3 text-lg font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
            {displayName}
          </h3>
          <span
            className="mt-1 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide"
            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--text-secondary))' }}
          >
            {roleLabel}
          </span>
        </div>

        <div className="flex items-center justify-between mt-5 mb-3">
          <span className="text-sm font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
            Performance Summary
          </span>
          <div className="flex rounded-full p-0.5" style={{ background: 'hsl(var(--muted))' }}>
            {(['today', 'total'] as TabKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className="px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors"
                style={{
                  background: tab === k ? 'hsl(var(--brand-primary))' : 'transparent',
                  color: tab === k ? 'hsl(var(--primary-foreground))' : 'hsl(var(--text-secondary))',
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl p-4 text-center"
              style={{ background: 'hsl(var(--muted))' }}
            >
              <div className="text-xl font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
                {c.value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'hsl(var(--text-muted))' }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ShiftProfilePopup;

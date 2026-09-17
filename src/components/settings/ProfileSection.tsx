import { useState, useMemo, type ReactNode } from 'react';
import { KeyRound } from 'lucide-react';
import { useActiveIdentity, initialsFromName, colorFromString } from '@/hooks/use-active-identity';
import { useLanguage } from '@/hooks/use-language';

interface ProfileSectionProps {
  onSwitchStaff: () => void;
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

export function ProfileSection({ onSwitchStaff }: ProfileSectionProps) {
  const {
    identity, restaurant,
    ticketsToday, ticketsTotal,
    avgTicketTimeSec, avgTicketTimeAllTimeSec,
    hoursWorked, hoursWorkedTotal,
    ticketsInQueue, overtimeToday, overtimeTotal,
    onTimeRateToday, onTimeRateAllTime,
    itemsPreparedToday, itemsPreparedTotal,
    busiestHourLabel,
  } = useActiveIdentity();
  const { tui } = useLanguage();
  const [tab, setTab] = useState<TabKey>('today');

  const isStaff = identity.kind === 'staff';
  const displayName = identity.name;
  const subtitle = isStaff
    ? identity.role
    : `${(identity as any).email}`;
  const deviceLine = !isStaff
    ? `${(identity as any).deviceName} · ${(identity as any).stationId}`
    : null;

  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const avatarBg = useMemo(() => colorFromString(displayName + (isStaff ? identity.role : '')), [displayName, identity, isStaff]);

  type Card = { label: string; value: ReactNode };

  const restaurantCards: Card[] = tab === 'today'
    ? [
        { label: tui('Tickets Today'), value: formatCount(ticketsToday) },
        { label: tui('Avg Ticket Time'), value: formatMinutes(avgTicketTimeSec) },
        {
          label: tui('Tickets in Queue'),
          value: (
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: queueDotColor(ticketsInQueue) }} />
              {formatCount(ticketsInQueue)}
            </span>
          ),
        },
        { label: tui('Overtime Tickets'), value: formatCount(overtimeToday) },
        { label: tui('On-time Rate'), value: formatPct(onTimeRateToday) },
        { label: tui('Items Prepared'), value: formatCount(itemsPreparedToday) },
      ]
    : [
        { label: tui('Total Tickets'), value: formatCount(ticketsTotal) },
        { label: tui('Avg Ticket Time'), value: formatMinutes(avgTicketTimeAllTimeSec) },
        { label: tui('Busiest Hour'), value: busiestHourLabel ?? '—' },
        { label: tui('Total Overtime Tickets'), value: formatCount(overtimeTotal) },
        { label: tui('On-time Rate'), value: formatPct(onTimeRateAllTime) },
        { label: tui('Total Items Prepared'), value: formatCount(itemsPreparedTotal) },
      ];

  const staffCards: Card[] = tab === 'today'
    ? [
        { label: tui('Tickets Completed'), value: formatCount(ticketsToday) },
        { label: tui('Hours Worked'), value: formatHours(hoursWorked) },
        { label: tui('Avg Ticket Time'), value: formatMinutes(avgTicketTimeSec) },
        { label: tui('Items Prepared'), value: formatCount(itemsPreparedToday) },
        { label: tui('On-time Rate'), value: formatPct(onTimeRateToday) },
        { label: tui('Overtime Tickets'), value: formatCount(overtimeToday) },
      ]
    : [
        { label: tui('Total Tickets Completed'), value: formatCount(ticketsTotal) },
        { label: tui('Total Hours Worked'), value: formatHours(hoursWorkedTotal) },
        { label: tui('Avg Ticket Time'), value: formatMinutes(avgTicketTimeAllTimeSec) },
        { label: tui('Total Items Prepared'), value: formatCount(itemsPreparedTotal) },
        { label: tui('On-time Rate'), value: formatPct(onTimeRateAllTime) },
        { label: tui('Total Overtime Tickets'), value: formatCount(overtimeTotal) },
      ];

  const cards = isStaff ? staffCards : restaurantCards;

  return (
    <div className="relative rounded-2xl p-5 mb-4" style={{ background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border))' }}>

      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl font-montserrat"
               style={{ background: avatarBg }}>
            {initials}
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 font-montserrat font-bold text-[9px] leading-tight text-center"
            style={{ background: '#1A1A2E', borderColor: 'hsl(var(--surface-card))', color: '#FFFFFF' }}
            title={restaurant.name}
          >
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              initialsFromName(restaurant.name)
            )}
          </div>
        </div>
        <h3 className="text-lg font-bold font-montserrat" style={{ color: 'hsl(var(--text-primary))' }}>{displayName}</h3>
        <p className="text-sm font-montserrat mt-0.5" style={{ color: 'hsl(var(--text-secondary))' }}>{subtitle}</p>
        {deviceLine && (
          <p className="text-xs font-montserrat mt-1" style={{ color: 'hsl(var(--text-muted))' }}>{deviceLine}</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-5 mb-3">
        <span className="text-sm font-semibold font-montserrat" style={{ color: 'hsl(var(--text-primary))' }}>{tui('Performance Summary')}</span>
        <div className="flex rounded-full p-0.5" style={{ background: 'hsl(var(--muted))' }}>
          {(['today', 'total'] as TabKey[]).map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="px-3 py-1 text-xs font-semibold rounded-full font-montserrat capitalize transition-colors"
              style={{
                background: tab === k ? 'hsl(var(--brand-primary))' : 'transparent',
                color: tab === k ? 'hsl(var(--brand-primary-foreground))' : 'hsl(var(--text-secondary))',
              }}
            >
              {tui(k)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl p-4 text-center" style={{ background: 'hsl(var(--muted))' }}>
            <div className="text-xl font-semibold font-montserrat" style={{ color: 'hsl(var(--text-primary))' }}>{c.value}</div>
            <div className="text-xs font-montserrat mt-1" style={{ color: 'hsl(var(--text-muted))' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onSwitchStaff}
        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold font-montserrat text-sm transition-colors"
        style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--text-primary))' }}
      >
        <KeyRound size={16} />
        {tui('Switch staff — enter PIN')}
      </button>

    </div>
  );
}

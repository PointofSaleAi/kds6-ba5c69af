import { useState, useMemo } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import { useActiveIdentity, initialsFromName, colorFromString } from '@/hooks/use-active-identity';

interface ProfileSectionProps {
  onSwitchStaff: () => void;
}

type TabKey = 'today' | 'total';

function formatMinutes(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function ProfileSection({ onSwitchStaff }: ProfileSectionProps) {
  const { identity, ticketsToday, ticketsTotal, avgTicketTimeSec, hoursWorked } = useActiveIdentity();
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

  const cards = isStaff
    ? [
        { label: 'Tickets completed', value: tab === 'today' ? ticketsToday : ticketsTotal },
        { label: 'Hours worked', value: formatHours(hoursWorked) },
      ]
    : [
        { label: tab === 'today' ? 'Tickets today' : 'Total tickets', value: tab === 'today' ? ticketsToday : ticketsTotal },
        { label: 'Avg ticket time', value: formatMinutes(avgTicketTimeSec) },
      ];

  return (
    <div className="relative rounded-2xl p-5 mb-4" style={{ background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border))' }}>
      {isStaff && (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
             style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB' }}>
          PIN active
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 font-montserrat"
             style={{ background: avatarBg }}>
          {initials}
        </div>
        <h3 className="text-lg font-bold font-montserrat" style={{ color: 'hsl(var(--text-primary))' }}>{displayName}</h3>
        <p className="text-sm font-montserrat mt-0.5" style={{ color: 'hsl(var(--text-secondary))' }}>{subtitle}</p>
        {deviceLine && (
          <p className="text-xs font-montserrat mt-1" style={{ color: 'hsl(var(--text-muted))' }}>{deviceLine}</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-5 mb-3">
        <span className="text-sm font-semibold font-montserrat" style={{ color: 'hsl(var(--text-primary))' }}>Performance summary</span>
        <div className="flex rounded-full p-0.5" style={{ background: 'hsl(var(--muted))' }}>
          {(['today', 'total'] as TabKey[]).map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="px-3 py-1 text-xs font-semibold rounded-full font-montserrat capitalize transition-colors"
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

      <div className="grid grid-cols-2 gap-3">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl p-4 text-center" style={{ background: 'hsl(var(--muted))' }}>
            <div className="text-xl font-bold font-montserrat" style={{ color: 'hsl(var(--text-primary))' }}>{c.value}</div>
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
        Switch staff — enter PIN
      </button>

    </div>
  );
}

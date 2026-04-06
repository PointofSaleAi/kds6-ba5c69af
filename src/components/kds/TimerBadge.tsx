import { useStatusRules } from '@/hooks/use-status-rules';

interface TimerBadgeProps {
  seconds: number;
  urgency?: string; // kept for backward compat but ignored when rules available
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getTimerUrgency(elapsed: number, target: number): 'ok' | 'warning' | 'critical' | 'overtime' {
  const ratio = elapsed / target;
  if (ratio >= 1) return 'overtime';
  if (ratio >= 0.66) return 'critical';
  if (ratio >= 0.33) return 'warning';
  return 'ok';
}

export function TimerBadge({ seconds }: TimerBadgeProps) {
  const { getStatusForElapsed } = useStatusRules();
  const status = getStatusForElapsed(seconds);

  return (
    <span
      className="font-mono-timer text-timer font-bold"
      style={{ color: status.color }}
    >
      {formatTime(seconds)}
    </span>
  );
}

import type { TimerUrgency } from '@/types/kds';

interface TimerBadgeProps {
  seconds: number;
  urgency: TimerUrgency;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const urgencyStyles: Record<TimerUrgency, string> = {
  ok: 'text-success',
  warning: 'text-warning',
  critical: 'text-destructive animate-timer-pulse',
  overtime: 'text-status-overtime animate-timer-pulse-fast',
};

export function getTimerUrgency(elapsed: number, target: number): TimerUrgency {
  const ratio = elapsed / target;
  if (ratio >= 1) return 'overtime';
  if (ratio >= 0.66) return 'critical';
  if (ratio >= 0.33) return 'warning';
  return 'ok';
}

export function TimerBadge({ seconds, urgency }: TimerBadgeProps) {
  return (
    <span className={`font-mono-timer text-timer ${urgencyStyles[urgency]}`}>
      {formatTime(seconds)}
    </span>
  );
}

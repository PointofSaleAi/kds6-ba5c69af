import { useStatusRules } from '@/hooks/use-status-rules';
import { useElapsedSeconds } from '@/hooks/use-elapsed';

interface StatusChipProps {
  elapsedSeconds: number;
}

export function StatusChip({ elapsedSeconds }: StatusChipProps) {
  const { getStatusForElapsed } = useStatusRules();
  const status = getStatusForElapsed(elapsedSeconds);

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
      style={{
        backgroundColor: `${status.color}26`,
        color: status.color,
      }}
    >
      {status.label}
    </span>
  );
}

interface BottomStatusBarProps {
  orderCount: number;
}

export function BottomStatusBar({ orderCount }: BottomStatusBarProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="h-11 bg-brand-dark flex items-center justify-between px-4 shrink-0 z-10">
      <span className="text-primary-foreground text-sm font-bold">
        {orderCount} Orders in Queue
      </span>
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary-foreground' : 'bg-primary-foreground/30'}`} />
        ))}
      </div>
      <span className="text-primary-foreground/80 text-sm">
        {timeStr} &middot; {dateStr}
      </span>
    </div>
  );
}

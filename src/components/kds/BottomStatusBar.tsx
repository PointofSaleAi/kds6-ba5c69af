import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BottomStatusBarProps {
  orderCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BottomStatusBar({ orderCount, currentPage, totalPages, onPageChange }: BottomStatusBarProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const maxDots = 7;
  const dotsToShow = Math.min(totalPages, maxDots);
  let dotStart = 0;
  if (totalPages > maxDots) {
    dotStart = Math.min(
      Math.max(currentPage - Math.floor(maxDots / 2), 0),
      totalPages - maxDots
    );
  }

  return (
    <div className="h-11 bg-brand-dark flex items-center justify-between px-4 shrink-0 z-10">
      <span className="text-primary-foreground text-sm font-bold">
        {orderCount} Orders in Queue
      </span>

      {totalPages > 1 ? (
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] text-primary-foreground disabled:opacity-30 transition-opacity"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {dotStart > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/30 mx-0.5" />
          )}

          {Array.from({ length: dotsToShow }, (_, i) => {
            const pageIndex = dotStart + i;
            return (
              <button
                key={pageIndex}
                onClick={() => onPageChange(pageIndex)}
                className="flex items-center justify-center w-7 h-11 min-h-[44px]"
                aria-label={`Go to page ${pageIndex + 1}`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    pageIndex === currentPage
                      ? 'bg-primary-foreground scale-125'
                      : 'bg-primary-foreground/30 hover:bg-primary-foreground/50'
                  }`}
                />
              </button>
            );
          })}

          {dotStart + dotsToShow < totalPages && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/30 mx-0.5" />
          )}

          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] text-primary-foreground disabled:opacity-30 transition-opacity"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary-foreground" />
        </div>
      )}

      <span className="text-primary-foreground/80 text-sm">
        {timeStr} &middot; {dateStr}
      </span>
    </div>
  );
}

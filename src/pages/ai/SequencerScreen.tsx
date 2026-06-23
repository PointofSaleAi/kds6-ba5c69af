import { useAiSequencer } from '@/hooks/use-ai-sequencer';
import { AiSectionHeader } from '@/components/ai/AiSectionHeader';
import { Flame, Bell, ChevronRight } from 'lucide-react';

function fmt(s: number) {
  if (s <= 0) return 'NOW';
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

export default function SequencerScreen() {
  const { recommendations, nudges } = useAiSequencer();
  const topRecs = recommendations.slice(0, 6);
  const grouped = new Map<string, typeof recommendations>();
  for (const r of recommendations) {
    const arr = grouped.get(r.tableName) ?? [];
    arr.push(r);
    grouped.set(r.tableName, arr);
  }

  return (
    <div>
      <AiSectionHeader
        title="Smart Ticket Sequencer"
        subtitle="AI computes a per-table fire schedule so every item for a table lands at the pass together, and nudges tickets amber 3–4 min before red."
        pain="10 tickets arrive at once — cook must decide what to fire first while already cooking; 12-min steak and 3-min salad for the same table fire in arrival order, not cook order."
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-orange-500" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))]">Fire Next</h2>
          </div>
          {topRecs.length === 0 ? (
            <p className="text-[12px] text-[hsl(var(--text-muted))]">No active items.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {topRecs.map((r, idx) => (
                <li key={r.itemId} className="flex items-center gap-3 p-2.5 rounded-lg border border-[hsl(var(--border))] bg-white">
                  <span className="w-7 h-7 rounded-md bg-[hsl(var(--brand-dark))] text-white text-[12px] font-extrabold grid place-items-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-[hsl(var(--text-primary))] truncate">{r.itemName}</div>
                    <div className="text-[11px] text-[hsl(var(--text-secondary))]">{r.tableName} · {r.station}</div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${r.fireInSeconds === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.fireInSeconds === 0 ? 'FIRE' : `+${fmt(r.fireInSeconds)}`}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="lg:col-span-2 bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-2 mb-3">
            <ChevronRight size={16} className="text-[hsl(var(--text-secondary))]" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))]">Cook-Back Timeline (per table)</h2>
          </div>
          {grouped.size === 0 ? (
            <p className="text-[12px] text-[hsl(var(--text-muted))]">No active tables.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {Array.from(grouped.entries()).map(([table, items]) => {
                const maxSec = Math.max(...items.map((i) => i.fireInSeconds + 600));
                return (
                  <div key={table}>
                    <div className="text-[12px] font-bold text-[hsl(var(--text-primary))] mb-1.5">{table}</div>
                    <div className="flex flex-col gap-1">
                      {items.map((i) => {
                        const startPct = (i.fireInSeconds / maxSec) * 100;
                        const widthPct = (600 / maxSec) * 100;
                        return (
                          <div key={i.itemId} className="relative h-6 bg-[hsl(var(--surface-bg))] rounded">
                            <div
                              className="absolute top-0 h-full rounded bg-[hsl(var(--brand-dark))] text-white text-[10px] font-bold flex items-center px-2 truncate"
                              style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                              title={i.reason}
                            >
                              {i.itemName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="lg:col-span-3 bg-white rounded-2xl border border-amber-300 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-amber-600" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-amber-700">Amber Nudge Feed</h2>
          </div>
          {nudges.length === 0 ? (
            <p className="text-[12px] text-[hsl(var(--text-muted))]">No tickets in the pre-red window. The kitchen is on pace.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {nudges.map((n) => (
                <li key={n.orderId} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-[18px] font-extrabold text-amber-700">#{n.orderNumber}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-[hsl(var(--text-primary))]">{n.tableName}</div>
                    <div className="text-[11px] text-[hsl(var(--text-secondary))]">{n.reason}</div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700">{fmt(n.secondsToRed)} to red</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

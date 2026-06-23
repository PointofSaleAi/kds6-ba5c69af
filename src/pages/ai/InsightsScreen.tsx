import { useMemo, useState } from 'react';
import { AiSectionHeader } from '@/components/ai/AiSectionHeader';
import { useOrderStore } from '@/hooks/use-order-store';
import { useAiServiceLog } from '@/hooks/use-ai-service-log';
import { buildDigest, computeServiceMetrics } from '@/lib/ai/service-analytics';
import { BarChart3, Sparkles, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';

export default function InsightsScreen() {
  const { orders } = useOrderStore();
  const { remakes, reset } = useAiServiceLog();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const metrics = useMemo(() => computeServiceMetrics(orders, remakes), [orders, remakes, refreshTick]);
  const digest = useMemo(() => buildDigest(metrics, remakes), [metrics, remakes]);

  // Remake heatmap data
  const heatmap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const r of remakes) {
      if (!map.has(r.itemName)) map.set(r.itemName, new Map());
      const inner = map.get(r.itemName)!;
      inner.set(r.reason, (inner.get(r.reason) ?? 0) + 1);
    }
    const reasons = Array.from(new Set(remakes.map((r) => r.reason)));
    const items = Array.from(map.keys());
    return { items, reasons, map };
  }, [remakes]);

  const maxCell = Math.max(1, ...Array.from(heatmap.map.values()).flatMap((m) => Array.from(m.values())));

  return (
    <div>
      <AiSectionHeader
        title="End-of-Service AI Digest"
        subtitle="Plain-language summary of tonight's service and a remake-pattern heatmap so managers see what to fix before the next shift."
        pain="Same remake errors every service — nobody tracks it; after every service the data is there, nobody reads it."
        right={
          <button
            onClick={() => { reset(); setRefreshTick((n) => n + 1); }}
            className="text-[11px] font-bold uppercase px-3 py-2 rounded border border-[hsl(var(--border))] flex items-center gap-1.5"
          >
            <RefreshCw size={12} /> Regenerate
          </button>
        }
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digest card */}
        <section className="lg:col-span-2 bg-gradient-to-br from-[hsl(var(--brand-dark))] to-slate-900 text-white rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-amber-300" />
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-white/70">Tonight's Digest</h2>
          </div>
          <p className="text-[18px] font-bold leading-snug">{digest.headline}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {digest.bullets.map((b, i) => (
              <li key={i} className="text-[13px] text-white/85 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-300 mt-2 shrink-0" /> {b}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/10">
            <span className="text-[11px] text-white/60">Was this useful?</span>
            <button
              onClick={() => setFeedback('up')}
              className={`px-2 py-1 rounded ${feedback === 'up' ? 'bg-emerald-500/30 text-emerald-100' : 'text-white/70 hover:text-white'}`}
            >
              <ThumbsUp size={14} />
            </button>
            <button
              onClick={() => setFeedback('down')}
              className={`px-2 py-1 rounded ${feedback === 'down' ? 'bg-red-500/30 text-red-100' : 'text-white/70 hover:text-white'}`}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
          <p className="mt-4 text-[10px] text-white/40">
            Wire summarizeService() to Lovable AI Gateway (Gemini 3 Flash) for natural-language digests over live metrics.
          </p>
        </section>

        {/* Station deltas */}
        <section className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-[hsl(var(--text-secondary))]" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))]">Station vs baseline</h2>
          </div>
          <ul className="flex flex-col gap-2">
            {metrics.stationDeltas.map((d) => {
              const slow = d.deltaSeconds > 60;
              return (
                <li key={d.station} className="flex items-center justify-between p-2 rounded border border-[hsl(var(--border))]">
                  <span className="text-[12px] font-bold">{d.station}</span>
                  <span className={`text-[11px] font-bold ${slow ? 'text-red-600' : 'text-emerald-600'}`}>
                    {d.deltaSeconds >= 0 ? '+' : ''}{Math.round(d.deltaSeconds / 60)}m
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Remake heatmap */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))] mb-3">Remake heatmap (item × reason)</h2>
          {heatmap.items.length === 0 ? (
            <p className="text-[12px] text-[hsl(var(--text-muted))]">No remakes logged tonight.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-[11px]">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-[hsl(var(--text-muted))] uppercase tracking-wider">Item</th>
                    {heatmap.reasons.map((r) => (
                      <th key={r} className="p-2 text-[hsl(var(--text-muted))] uppercase tracking-wider">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.items.map((item) => (
                    <tr key={item}>
                      <td className="p-2 font-bold">{item}</td>
                      {heatmap.reasons.map((r) => {
                        const count = heatmap.map.get(item)?.get(r) ?? 0;
                        const intensity = count / maxCell;
                        return (
                          <td key={r} className="p-1">
                            <div
                              className="w-12 h-9 rounded grid place-items-center font-bold"
                              style={{
                                background: count > 0 ? `rgba(220,38,38,${0.15 + intensity * 0.6})` : 'hsl(var(--surface-bg))',
                                color: count > 0 ? 'white' : 'hsl(var(--text-muted))',
                              }}
                            >
                              {count}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

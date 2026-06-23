import { useState } from 'react';
import { AiSectionHeader } from '@/components/ai/AiSectionHeader';
import { useStationLoad } from '@/hooks/use-station-load';
import { mockInventory } from '@/data/mock-inventory';
import { useToast } from '@/hooks/use-toast';
import { Timer, AlertOctagon } from 'lucide-react';

function fmtMin(s: number) {
  return `${Math.round(s / 60)}m`;
}

export default function EtaScreen() {
  const { loads, quotes } = useStationLoad();
  const { toast } = useToast();
  const [eighty6ed, setEighty6ed] = useState<Set<string>>(new Set());

  const lowStock = mockInventory.filter((i) => i.portionsRemaining <= 3 && !eighty6ed.has(i.itemName));

  const handle86 = (name: string) => {
    setEighty6ed((prev) => new Set(prev).add(name));
    toast({ title: '86 sent to POS', description: `${name} marked unavailable. Servers notified.` });
  };

  return (
    <div>
      <AiSectionHeader
        title="Live ETA & 86 Auto-Detection"
        subtitle="AI inflates prep times by real station load and publishes ETAs to POS. When the last portion of an item is bumped, it suggests 86 with one tap."
        pain="Server tells guest 15 mins but the grill is backed up — it's actually 25. Item runs out — only one server told. Kitchen keeps getting orders for it."
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-3 bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))] mb-3">Station Load Meter</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {loads.map((l) => {
              const pct = Math.min(100, Math.round(l.loadRatio * 100));
              const color = pct > 90 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <div key={l.station} className="p-3 rounded-lg border border-[hsl(var(--border))]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase text-[hsl(var(--text-primary))]">{l.station}</span>
                    <span className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">{pct}%</span>
                  </div>
                  <div className="h-2 bg-[hsl(var(--surface-bg))] rounded overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-[hsl(var(--text-muted))] mt-1.5">{fmtMin(l.queuedSeconds)} queued</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-2 bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Timer size={16} className="text-blue-500" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))]">Live ETAs to POS</h2>
          </div>
          {quotes.length === 0 ? (
            <p className="text-[12px] text-[hsl(var(--text-muted))]">No active orders.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))] border-b border-[hsl(var(--border))]">
                  <th className="py-2">Ticket</th>
                  <th>Quoted</th>
                  <th>AI ETA</th>
                  <th>Δ</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const overrun = q.deltaSeconds > 300;
                  return (
                    <tr key={q.orderId} className={`border-b border-[hsl(var(--border))] ${overrun ? 'bg-amber-50' : ''}`}>
                      <td className="py-2 font-bold">#{q.orderNumber} · {q.tableName}</td>
                      <td>{fmtMin(q.quotedSeconds)}</td>
                      <td className="font-bold">{fmtMin(q.aiEtaSeconds)}</td>
                      <td className={overrun ? 'text-amber-700 font-bold' : 'text-[hsl(var(--text-secondary))]'}>
                        {q.deltaSeconds >= 0 ? '+' : ''}{fmtMin(q.deltaSeconds)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className="lg:col-span-1 bg-white rounded-2xl border border-red-300 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon size={16} className="text-red-600" />
            <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-red-700">86 Inbox</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-[12px] text-[hsl(var(--text-muted))]">Nothing flagged for 86 right now.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lowStock.map((i) => (
                <li key={i.itemName} className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-[13px] font-bold text-[hsl(var(--text-primary))]">{i.itemName}</div>
                  <div className="text-[11px] text-[hsl(var(--text-secondary))] mb-2">{i.portionsRemaining} of {i.startingPortions} left · {i.station}</div>
                  <button
                    onClick={() => handle86(i.itemName)}
                    className="w-full text-[11px] font-extrabold uppercase px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Confirm 86 → notify POS
                  </button>
                </li>
              ))}
            </ul>
          )}
          {eighty6ed.size > 0 && (
            <div className="mt-3 text-[10px] text-[hsl(var(--text-muted))]">
              86'd this session: {Array.from(eighty6ed).join(', ')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

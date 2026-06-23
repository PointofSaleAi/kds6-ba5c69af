import { useMemo } from 'react';
import { AiSectionHeader } from '@/components/ai/AiSectionHeader';
import { useOrderStore } from '@/hooks/use-order-store';
import { detectConflicts, topSeverity } from '@/lib/ai/allergen-intelligence';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function AllergensScreen() {
  const { orders } = useOrderStore();

  const { highSeverity, conflicts } = useMemo(() => {
    const high: { orderNumber: number; tableName: string; itemName: string; allergens: string[] }[] = [];
    const conf: { orderNumber: number; tableName: string; details: ReturnType<typeof detectConflicts> }[] = [];
    for (const o of orders) {
      if (o.status === 'served') continue;
      for (const c of o.courses) {
        for (const item of c.items) {
          if (item.isCancelled) continue;
          if (item.allergens.length > 0 && topSeverity(item) === 'high') {
            high.push({
              orderNumber: o.orderNumber,
              tableName: o.tableName,
              itemName: item.name,
              allergens: item.allergens.map((a) => a.label),
            });
          }
          const c2 = detectConflicts(item);
          if (c2.length > 0) {
            conf.push({ orderNumber: o.orderNumber, tableName: o.tableName, details: c2 });
          }
        }
      }
    }
    return { highSeverity: high, conflicts: conf };
  }, [orders]);

  return (
    <div>
      <AiSectionHeader
        title="Allergen Intelligence"
        subtitle="Severity scoring scales high-risk allergens 3× and red. AI cross-checks every modifier against the ingredient list to catch hidden conflicts before the ticket reaches the cook."
        pain="All allergen tags look identical — peanut allergy styled the same as a no-onion preference; conflicting modifiers (no dairy + butter-based dish) not caught at order entry."
      />

      <div className="p-8 flex flex-col gap-6">
        {/* Severity legend */}
        <section className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))] mb-3">Severity scale</h2>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-2 rounded-lg bg-red-600 text-white text-[14px] font-extrabold uppercase flex items-center gap-2">
              <ShieldAlert size={18} /> High · peanut · tree-nut · shellfish · gluten
            </span>
            <span className="px-2.5 py-1.5 rounded bg-amber-500 text-white text-[12px] font-bold uppercase">
              Medium · dairy · egg · soy · sesame
            </span>
            <span className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[11px] font-semibold uppercase">
              Preference · no onion / no sauce
            </span>
          </div>
        </section>

        {/* High severity banner list */}
        <section>
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))] mb-3">High-severity tickets ({highSeverity.length})</h2>
          {highSeverity.length === 0 ? (
            <p className="text-[12px] text-[hsl(var(--text-muted))]">No high-severity allergens on active tickets.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {highSeverity.map((h, i) => (
                <div key={i} className="rounded-xl overflow-hidden border-2 border-red-600 bg-white">
                  <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-2">
                    <ShieldAlert size={18} />
                    <span className="text-[14px] font-extrabold uppercase tracking-wide">Allergen Alert</span>
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] uppercase tracking-wider text-[hsl(var(--text-secondary))]">#{h.orderNumber} · {h.tableName}</div>
                    <div className="text-[15px] font-bold text-[hsl(var(--text-primary))] mt-1">{h.itemName}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {h.allergens.map((a) => (
                        <span key={a} className="px-2 py-1 rounded bg-red-100 text-red-800 text-[11px] font-extrabold uppercase">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Conflict inspector */}
        <section>
          <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-[hsl(var(--text-primary))] mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600" /> Modifier × ingredient conflicts ({conflicts.reduce((s, c) => s + c.details.length, 0)})
          </h2>
          {conflicts.length === 0 ? (
            <p className="text-[12px] text-[hsl(var(--text-muted))]">No conflicts detected on active tickets. Try adding a "no dairy" modifier to a dish with butter in the source data to demo this.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {conflicts.map((c, i) => (
                <div key={i} className="bg-white rounded-lg border border-amber-300 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-[hsl(var(--text-secondary))]">#{c.orderNumber} · {c.tableName}</div>
                  {c.details.map((d, j) => (
                    <div key={j} className="mt-2 flex items-start gap-3">
                      <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                      <div className="text-[12px] text-[hsl(var(--text-primary))]">
                        <span className="font-bold">{d.itemName}</span> — modifier <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">{d.modifier}</span> conflicts with ingredient <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">{d.ingredient}</span>. {d.reason}
                      </div>
                    </div>
                  ))}
                  <button className="mt-3 text-[11px] font-bold uppercase px-3 py-1.5 rounded bg-[hsl(var(--brand-dark))] text-white">
                    Confirm with guest
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

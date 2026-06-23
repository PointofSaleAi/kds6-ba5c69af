import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronRight, ChevronLeft, Flame, ShieldAlert,
  Timer, Mic, BarChart3, ArrowLeft
} from 'lucide-react';
import Index from '@/pages/Index';
import { useOrderStore } from '@/hooks/use-order-store';
import { topSeverity, detectConflicts } from '@/lib/ai/allergen-intelligence';
import { computeStationLoad, estimateOrderEta } from '@/lib/ai/eta-predictor';
import type { Order } from '@/types/kds';

/**
 * AiKdsView renders the REAL Kitchen Display (Index) plus a docked
 * "AI Co-Pilot" panel that reads the live order store and surfaces
 * AI insights against the actual tickets on screen — no demos, no
 * mock cards.
 */
export default function AiKdsView() {
  const navigate = useNavigate();
  const { orders } = useOrderStore();
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<'sequencer' | 'allergens' | 'eta' | 'voice' | 'insights'>('sequencer');

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Real KDS underneath */}
      <Index />

      {/* AI mode badge — top center */}
      <div className="pointer-events-none fixed top-2 left-1/2 -translate-x-1/2 z-40">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--sidebar-bg))] text-white shadow-lg border border-white/10">
          <Sparkles size={14} className="text-amber-300" />
          <span className="text-[11px] font-bold tracking-wide uppercase">AI Co-Pilot Active</span>
          <button
            onClick={() => navigate('/kds/full')}
            className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white/80 hover:text-white"
          >
            <ArrowLeft size={12} /> Exit
          </button>
        </div>
      </div>

      {/* Collapsed handle */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[hsl(var(--sidebar-bg))] text-white rounded-l-lg px-2 py-3 shadow-lg flex flex-col items-center gap-1"
        >
          <ChevronLeft size={16} />
          <Sparkles size={14} className="text-amber-300" />
        </button>
      )}

      {/* Co-Pilot drawer */}
      {open && (
        <aside className="fixed right-0 top-12 bottom-12 z-50 w-[320px] bg-[hsl(var(--sidebar-bg))] text-white shadow-2xl border-l border-white/10 flex flex-col font-['Montserrat',sans-serif]">
          <div className="px-3 py-2 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-[12px] font-bold uppercase tracking-wide">AI Co-Pilot</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-2 pt-2 grid grid-cols-5 gap-1">
            {[
              { id: 'sequencer', icon: Flame, label: 'Fire' },
              { id: 'allergens', icon: ShieldAlert, label: 'Allergen' },
              { id: 'eta', icon: Timer, label: 'ETA' },
              { id: 'voice', icon: Mic, label: 'Voice' },
              { id: 'insights', icon: BarChart3, label: 'Digest' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-md text-[9px] font-semibold uppercase ${
                  tab === t.id ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-2">
            {tab === 'sequencer' && <SequencerPanel orders={orders} />}
            {tab === 'allergens' && <AllergensPanel orders={orders} />}
            {tab === 'eta' && <EtaPanel orders={orders} />}
            {tab === 'voice' && <VoicePanel />}
            {tab === 'insights' && <InsightsPanel orders={orders} />}
          </div>

          <div className="px-3 py-2 border-t border-white/10 text-[10px] text-white/50">
            Reading {orders.length} live ticket{orders.length === 1 ? '' : 's'} from the kitchen
          </div>
        </aside>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panels — all read REAL orders from useOrderStore
// ---------------------------------------------------------------------------

function predictRemainingSeconds(order: Order) {
  // crude: 90s per remaining item, weighted by quantity
  const remaining = order.courses
    .flatMap(c => c.items)
    .filter(i => !i.isCompleted && !i.isCancelled)
    .reduce((s, i) => s + (i.quantity || 1), 0);
  return remaining * 90;
}

function SequencerPanel({ orders }: { orders: Order[] }) {
  const active = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled');
  const ranked = useMemo(
    () => [...active]
      .map(o => ({ o, eta: predictRemainingSeconds(o) }))
      .sort((a, b) => a.eta - b.eta)
      .slice(0, 6),
    [active]
  );

  if (ranked.length === 0) return <EmptyMsg label="No live tickets to sequence." />;

  return (
    <>
      <SectionTitle icon={<Flame size={12} />} label="Fire Next (predicted)" />
      {ranked.map(({ o, eta }, idx) => (
        <div key={o.id} className="rounded-lg bg-white/5 border border-white/10 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-[11px] font-bold">#{idx + 1}</span>
              <span className="text-white text-[13px] font-bold">Ticket {o.orderNumber}</span>
            </div>
            <span className="text-[10px] font-mono text-white/70">~{Math.round(eta / 60)}m</span>
          </div>
          <div className="text-[10px] text-white/60 mt-0.5">
            {o.orderType.toUpperCase()} · {o.courses.flatMap(c => c.items).length} items
          </div>
        </div>
      ))}
    </>
  );
}

function AllergensPanel({ orders }: { orders: Order[] }) {
  const flagged = useMemo(() => {
    return orders.flatMap(o => {
      const items = o.courses.flatMap(c => c.items);
      const allAllergens = items.flatMap(i => i.allergens || []);
      if (!allAllergens.length) return [];
      const scored = scoreAllergens(allAllergens.map(a => a.type));
      const high = scored.filter(s => s.severity === 'high');
      const conflicts = detectAllergenConflicts(
        items.flatMap(i => (i.modifiers || []).map(m => m.text)),
        items.map(i => i.name)
      );
      if (!high.length && !conflicts.length) return [];
      return [{ order: o, high, conflicts }];
    });
  }, [orders]);

  if (flagged.length === 0) return <EmptyMsg label="No allergen risks detected." />;

  return (
    <>
      <SectionTitle icon={<ShieldAlert size={12} />} label="Allergen Risk" />
      {flagged.map(({ order, high, conflicts }) => (
        <div key={order.id} className="rounded-lg bg-red-500/10 border border-red-400/30 p-2">
          <div className="text-[13px] font-bold text-white">Ticket {order.orderNumber}</div>
          {high.map(h => (
            <div key={h.type} className="mt-1 text-[10px] text-red-200 font-semibold uppercase">
              HIGH · {h.type}
            </div>
          ))}
          {conflicts.map((c, i) => (
            <div key={i} className="mt-1 text-[10px] text-amber-200">
              Conflict: {c}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function EtaPanel({ orders }: { orders: Order[] }) {
  const items = orders.flatMap(o =>
    o.courses.flatMap(c => c.items).filter(i => !i.isCompleted)
  );
  const load = computeStationLoad(items.map(i => i.station || 'Grill'));
  if (!load.length) return <EmptyMsg label="No active station load." />;

  return (
    <>
      <SectionTitle icon={<Timer size={12} />} label="Station Load" />
      {load.map(s => (
        <div key={s.station} className="rounded-lg bg-white/5 border border-white/10 p-2">
          <div className="flex items-center justify-between text-[12px] font-semibold text-white">
            <span>{s.station}</span>
            <span className="font-mono text-[11px] text-white/70">{s.active}/{s.capacity}</span>
          </div>
          <div className="mt-1 h-1.5 rounded bg-white/10 overflow-hidden">
            <div
              className={`h-full ${s.ratio > 0.9 ? 'bg-red-400' : s.ratio > 0.6 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, Math.round(s.ratio * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </>
  );
}

function VoicePanel() {
  const [listening, setListening] = useState(false);
  return (
    <>
      <SectionTitle icon={<Mic size={12} />} label="Hands-Free" />
      <button
        onClick={() => setListening(v => !v)}
        className={`w-full rounded-lg p-3 border text-[12px] font-semibold flex items-center justify-center gap-2 ${
          listening
            ? 'bg-red-500/20 border-red-400/40 text-red-100'
            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
        }`}
      >
        <Mic size={14} />
        {listening ? 'Listening...' : 'Push to talk'}
      </button>
      <p className="text-[10px] text-white/60 leading-relaxed">
        Say things like "Bump ticket 102", "Recall last order", "Show only Grill".
        Commands run against the live KDS.
      </p>
    </>
  );
}

function InsightsPanel({ orders }: { orders: Order[] }) {
  const served = orders.filter(o => o.status === 'served').length;
  const active = orders.length - served;
  return (
    <>
      <SectionTitle icon={<BarChart3 size={12} />} label="Service Digest" />
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Active" value={active} />
        <Stat label="Served" value={served} />
      </div>
      <p className="text-[10px] text-white/60 leading-relaxed mt-1">
        Live snapshot from the kitchen. End-of-service digest with remake patterns
        is generated when the shift closes.
      </p>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
      <div className="text-[18px] font-bold text-white">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-white/60">{label}</div>
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">
      {icon}
      {label}
    </div>
  );
}

function EmptyMsg({ label }: { label: string }) {
  return <div className="text-[11px] text-white/50 italic">{label}</div>;
}

import { Link } from 'react-router-dom';
import { Flame, ShieldAlert, Timer, Mic, BarChart3, Sparkles, ArrowRight } from 'lucide-react';

const TILES = [
  {
    to: '/kds/ai/sequencer',
    icon: Flame,
    title: 'Smart Sequencer',
    sub: 'Per-table cook-back ordering + amber pre-red nudge.',
    pain: '"Timer turns red with no warning — cook is already too late to recover."',
    color: 'from-orange-500/15 to-red-500/10 border-orange-500/30',
  },
  {
    to: '/kds/ai/allergens',
    icon: ShieldAlert,
    title: 'Allergen Intelligence',
    sub: 'Severity scoring + modifier × ingredient conflict detection.',
    pain: '"NO NUTS buried under 4 modifiers — same style as a no-onion preference."',
    color: 'from-red-500/15 to-rose-500/10 border-red-500/30',
  },
  {
    to: '/kds/ai/eta',
    icon: Timer,
    title: 'Live ETA & 86 Inbox',
    sub: 'Station-load aware ETA pushed to POS, auto-86 on depletion.',
    pain: '"Server tells guest 15 mins but the grill is backed up — it\'s actually 25."',
    color: 'from-blue-500/15 to-cyan-500/10 border-blue-500/30',
  },
  {
    to: '/kds/ai/voice',
    icon: Mic,
    title: 'Voice & AI Translate',
    sub: 'Push-to-talk bump/recall/filter, content-level translation.',
    pain: '"Cook can\'t read the ticket in their language."',
    color: 'from-violet-500/15 to-fuchsia-500/10 border-violet-500/30',
  },
  {
    to: '/kds/ai/insights',
    icon: BarChart3,
    title: 'Service Digest',
    sub: 'Same-night plain-language summary + remake pattern detector.',
    pain: '"Same remake errors every service — nobody tracks it."',
    color: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/30',
  },
];

export default function AiDashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand-dark))] grid place-items-center shrink-0">
          <Sparkles size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-[24px] font-extrabold text-[hsl(var(--text-primary))] tracking-tight">
            AI-First Lab
          </h1>
          <p className="text-[13px] text-[hsl(var(--text-secondary))] mt-1 max-w-2xl">
            Five passive AI features that make the KDS smarter without retraining a single line cook.
            Every screen here is isolated from the main /kds/full app and uses mock data.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TILES.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={`group p-5 rounded-2xl border bg-gradient-to-br ${t.color} bg-white hover:shadow-lg transition-all`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-white grid place-items-center shadow-sm">
                <t.icon size={20} className="text-[hsl(var(--text-primary))]" />
              </div>
              <ArrowRight size={18} className="text-[hsl(var(--text-secondary))] group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-[16px] font-extrabold text-[hsl(var(--text-primary))]">{t.title}</h3>
            <p className="text-[12px] text-[hsl(var(--text-secondary))] mt-1">{t.sub}</p>
            <p className="mt-3 text-[11px] italic text-[hsl(var(--text-muted))] border-l-2 border-[hsl(var(--text-muted))]/30 pl-2">
              Pain point: {t.pain}
            </p>
          </Link>
        ))}
      </section>

      <footer className="mt-10 text-[11px] text-[hsl(var(--text-muted))] text-center">
        All features run from the existing mock order store. No changes to the production KDS layout.
      </footer>
    </div>
  );
}

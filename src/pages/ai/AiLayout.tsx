import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Sparkles, ShieldAlert, Flame, Timer, Mic, BarChart3, ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const NAV = [
  { to: '/kds/ai/dashboard', icon: Sparkles, label: 'Overview' },
  { to: '/kds/ai/sequencer', icon: Flame, label: 'Smart Sequencer' },
  { to: '/kds/ai/allergens', icon: ShieldAlert, label: 'Allergen Intelligence' },
  { to: '/kds/ai/eta', icon: Timer, label: 'Live ETA & 86' },
  { to: '/kds/ai/voice', icon: Mic, label: 'Voice & Translate' },
  { to: '/kds/ai/insights', icon: BarChart3, label: 'Service Digest' },
];

export default function AiLayout() {
  const navigate = useNavigate();
  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-screen w-screen bg-[hsl(var(--surface-bg))] font-['Montserrat',sans-serif]">
        <aside className="w-56 shrink-0 bg-[hsl(var(--sidebar-bg))] flex flex-col">
          <div className="px-4 pt-4 pb-3 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/10 grid place-items-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-white text-[13px] font-bold tracking-wide">POINT OF SALE AI</div>
              <div className="text-white/60 text-[10px] uppercase tracking-widest">AI Lab</div>
            </div>
          </div>
          <div className="px-3 my-2 border-t border-white/10" />
          <nav className="flex-1 px-2 flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold min-h-[44px] transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => navigate('/kds/full')}
            className="m-3 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/20 text-white/80 text-[12px] font-semibold hover:bg-white/10"
          >
            <ArrowLeft size={14} /> Back to KDS
          </button>
        </aside>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}

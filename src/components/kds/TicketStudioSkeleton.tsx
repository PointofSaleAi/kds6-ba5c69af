import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  ArrowUpDown,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Languages,
  LayoutGrid,
  Moon,
  Package,
  RotateCcw,
  Settings as SettingsIcon,
  Undo2,
  Utensils,
  Volume2,
  X,
} from 'lucide-react';
import { TicketsIcon } from './icons/TicketsIcon';
import restaurantLogo from '@/assets/icons/restaurant-logo.png';
import versionIcon from '@/assets/version-icon.svg';
import { BoardTicketPreview } from './BoardTicketPreview';
import { useStatusRules, type StatusRule } from '@/hooks/use-status-rules';
import {
  useKDSSettings,
  DEFAULT_ORDER_TYPE_COLORS,
  DEFAULT_ORDER_TYPE_DETAILED_COLORS,
} from '@/hooks/use-kds-settings';

const SCREEN_ORDER_TYPES = [
  { key: 'dine-in', label: 'DINE IN' },
  { key: 'take-out', label: 'TAKE OUT' },
  { key: 'delivery', label: 'DELIVERY' },
  { key: 'banquet', label: 'BANQUET' },
  { key: 'drive-thru', label: 'DRIVE THRU' },
  { key: 'curb-side', label: 'CURB SIDE' },
] as const;

type KdsScreenMockProps = {
  boardId: string;
  identifier: 'order' | 'guest';
  textSize: string;
  agingOverrideSeconds?: number;
  onHeaderClick?: (key: string) => void;
  onTimerClick?: () => void;
};

function KdsScreenMock({
  boardId,
  identifier,
  textSize,
  agingOverrideSeconds,
  onHeaderClick,
  onTimerClick,
}: KdsScreenMockProps) {
  const isDark = boardId === 'dark-command-center' || boardId === 'safety-first';
  const surface = isDark ? '#0D0D1A' : '#F0F2F5';
  const chrome = isDark ? '#1A1A2E' : '#FFFFFF';
  const border = isDark ? '#2A2A44' : '#E1E5EA';
  const textPrimary = isDark ? '#FFFFFF' : '#2C3E50';
  const textMuted = isDark ? '#95A5A6' : '#6C7A89';

  const ticketScale = textSize === 'small' ? 0.9 : textSize === 'large' ? 1.05 : 1;

  const navItems = [
    { icon: TicketsIcon, label: 'Tickets', active: true, size: 22 },
    { icon: Clock, label: 'History', badge: 6, badgeColor: '#E84C3D', size: 20 },
    { icon: Eye, label: 'New', badge: 3, badgeColor: '#2980B9', size: 20 },
    { icon: EyeOff, label: 'Hide', badge: 2, badgeColor: '#E84C3D', size: 20 },
    { icon: Bell, label: 'Alerts', badge: 4, badgeColor: '#E84C3D', size: 20 },
    { icon: SettingsIcon, label: 'Settings', size: 20 },
  ];

  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-xl flex"
      style={{ background: surface }}
    >
      {/* Left rail — mirrors real KDSSidebar */}
      <div className="shrink-0 h-full py-1.5 px-1.5 w-[68px]" style={{ background: '#0D0D1A' }}>
        <div
          className="h-full rounded-2xl flex flex-col gap-1 py-1.5 px-1"
          style={{
            background: '#7575754D',
            boxShadow: 'inset 4px 4px 24px rgba(255,255,255,0.15)',
          }}
        >
          {/* Restaurant logo */}
          <button className="flex items-center justify-center w-full h-11 shrink-0 rounded-xl">
            <img src={restaurantLogo} alt="" className="w-9 h-9 object-contain" />
          </button>
          <div className="mx-1.5 border-t border-white/10" />

          {/* Nav items */}
          {navItems.map((it, i) => (
            <button
              key={i}
              className={`flex-1 flex items-center justify-center rounded-xl min-h-[36px] relative border-2 ${
                it.active ? 'bg-white/10 border-white/80' : 'border-transparent'
              }`}
            >
              <span className="relative shrink-0">
                <it.icon size={it.size} className="text-white/90" />
                {it.badge ? (
                  <span
                    className="absolute -top-1.5 -right-2 text-white text-[8px] font-bold rounded-full min-w-[14px] h-3.5 px-0.5 flex items-center justify-center"
                    style={{ background: it.badgeColor }}
                  >
                    {it.badge}
                  </span>
                ) : null}
              </span>
            </button>
          ))}

          {/* Switch to POS */}
          <div className="flex-1 flex items-center justify-center rounded-xl min-h-[36px] border-2 border-transparent">
            <ArrowLeftRight size={18} className="text-white/90" />
          </div>

          {/* Version */}
          <div className="flex flex-col items-center justify-center gap-0 shrink-0 pt-0.5">
            <img src={versionIcon} alt="" className="w-7 h-7 object-contain" />
            <span className="text-white/70 text-[8px] font-semibold tracking-wide">v4.10.2</span>
          </div>
        </div>
      </div>


      {/* Main column — real KDS has no top bar; tickets go edge-to-edge */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Body: tickets grid + summary panel */}
        <div className="flex-1 min-h-0 flex">
          <div className="flex-1 min-w-0 overflow-hidden p-1.5">
            <div className="grid grid-cols-3 grid-rows-2 gap-1.5 h-full">
              {SCREEN_ORDER_TYPES.map((ot, i) => (
                <div key={ot.key} className="min-w-0 min-h-0 overflow-hidden">
                  <div
                    className="origin-top-left"
                    style={{
                      transform: `scale(${ticketScale})`,
                      width: `${100 / ticketScale}%`,
                      height: `${100 / ticketScale}%`,
                    }}
                  >
                    <BoardTicketPreview
                      boardId={boardId}
                      identifier={identifier}
                      orderType={ot.label}
                      orderTypeKey={ot.key}
                      agingOverrideSeconds={
                        agingOverrideSeconds !== undefined
                          ? agingOverrideSeconds + i * 15
                          : undefined
                      }
                      onHeaderClick={() => onHeaderClick?.(ot.key)}
                      onTimerClick={onTimerClick}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary panel — mirrors real ItemSummaryPanel */}
          <aside
            className="w-[180px] shrink-0 border-l flex flex-col"
            style={{ borderColor: border, background: chrome }}
          >
            {/* Header */}
            <div
              className="px-2 h-9 border-b flex items-center justify-between"
              style={{ borderColor: border }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-4 h-4 rounded-full bg-[#16A085]/15 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16A085]" />
                </div>
                <span className="text-[11px] font-bold truncate" style={{ color: textPrimary }}>
                  Cooking Summary
                </span>
              </div>
              <span
                className="text-[10px] font-bold rounded-full px-1.5 min-w-[22px] text-center"
                style={{ background: isDark ? 'rgba(255,255,255,0.12)' : '#E1E5EA', color: textPrimary }}
              >
                24
              </span>
            </div>
            {/* Expand-all toggle row */}
            <div
              className="flex items-center justify-between px-2 h-7 border-b text-[10px]"
              style={{ borderColor: border, color: textMuted }}
            >
              <span className="font-semibold">Expand all</span>
              <span
                className="relative inline-flex h-3.5 w-6 rounded-full"
                style={{ background: '#16A085' }}
              >
                <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-white" />
              </span>
            </div>
            {/* Categories */}
            <div className="flex-1 overflow-hidden p-2 space-y-2">
              {[
                { course: 'APPETIZERS', items: [['Bruschetta', '3'], ['Calamari', '2']] },
                { course: 'ENTREES', items: [['Ribeye', '4'], ['Salmon', '3'], ['Risotto', '2']] },
                { course: 'DESSERTS', items: [['Tiramisu', '2'], ['Sorbet', '1']] },
              ].map((section) => (
                <div key={section.course}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[9px] font-bold tracking-wider"
                      style={{ color: '#16A085' }}
                    >
                      {section.course}
                    </span>
                    <ChevronDown className="w-3 h-3" style={{ color: textMuted }} />
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map(([name, count]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between text-[10px] px-1 py-0.5 rounded"
                      >
                        <span className="truncate" style={{ color: textPrimary }}>{name}</span>
                        <span
                          className="font-bold ml-2 rounded-full px-1.5 text-[9px]"
                          style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#F0F2F5', color: textPrimary }}
                        >
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* Footer — mirrors real BottomStatusBar (h-52 brand-dark, no rounding) */}
        <div
          className="h-[44px] shrink-0 flex items-center justify-between px-3 gap-2"
          style={{ background: '#212121' }}
        >
          {/* Left: order count */}
          <div className="flex items-center gap-1.5 shrink-0 text-white">
            <span className="text-[13px] font-bold leading-none">12</span>
            <span className="text-[10px] font-semibold text-white/80">Orders in queue</span>
          </div>

          {/* Center: filters + sort + view mode pill */}
          <div className="flex items-center gap-1.5">
            {[Filter, Building2, Utensils, ArrowUpDown].map((Ic, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <Ic className="w-3 h-3 text-white/70" />
              </div>
            ))}
            <div className="flex items-center bg-white/10 rounded-full p-0.5 gap-0.5 ml-1">
              {[LayoutGrid, Filter, Package].map((Ic, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    i === 0 ? 'bg-white' : ''
                  }`}
                >
                  <Ic className={`w-3 h-3 ${i === 0 ? 'text-[#0D0D1A]' : 'text-white/60'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: language/sound/theme + 86 Products + AI */}
          <div className="flex items-center gap-1.5 shrink-0">
            {[Languages, Volume2, Moon].map((Ic, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <Ic className="w-3 h-3 text-white/70" />
              </div>
            ))}
            <div
              className="flex items-center gap-1.5 px-2 h-7 rounded-xl"
              style={{ background: 'rgba(100,100,100,0.4)' }}
            >
              <div className="flex flex-col items-center leading-none">
                <span className="text-[8px] text-white font-semibold">86</span>
                <span className="text-[8px] text-white font-semibold">Products</span>
              </div>
              <Package className="w-3 h-3 text-white/60" />
            </div>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
            >
              <span className="text-[8px] font-bold text-white">AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Board = { id: string; name: string; subtitle: string; featured?: boolean };

const BOARDS: Board[] = [


  { id: 'calm-board', name: 'Calm Board', subtitle: 'Balanced operations, low visual noise', featured: true },
  { id: 'focus-lane', name: 'Focus Lane', subtitle: 'Priority ticket centered, context at edges' },
  { id: 'distance-view', name: 'Distance View', subtitle: 'Maximum readability from several feet' },
  { id: 'progressive-ticket', name: 'Progressive Ticket', subtitle: 'Reveals detail for the active course' },
  { id: 'safety-first', name: 'Safety First', subtitle: 'Allergen and cross-contact controls lead', featured: true },
  { id: 'timeline-flow', name: 'Timeline Flow', subtitle: 'New, Cooking, Plating, Ready lanes' },
  { id: 'adaptive-density', name: 'Adaptive Density', subtitle: 'Comfortable, Balanced, Rush modes' },
  { id: 'dark-command-center', name: 'Dark Command Center', subtitle: 'High-contrast focused operations', featured: true },
];

function BoardThumb({ id }: { id: string; active: boolean }) {
  // Rich mini renderings that mirror each PDF screen at a glance.
  // viewBox 112x56 — non-uniform scaled to fill the thumb container.
  const bg =
    id === 'dark-command-center'
      ? '#0D0D1A'
      : id === 'safety-first'
      ? '#0D0D1A'
      : '#F0F2F5';

  const content = (() => {
    switch (id) {
      case 'calm-board':
        // 3x2 grid of white cards with dark headers
        return (
          <g>
            {[0, 1, 2].map((c) =>
              [0, 1].map((r) => {
                const x = 3 + c * 36;
                const y = 3 + r * 26;
                return (
                  <g key={`${c}-${r}`}>
                    <rect x={x} y={y} width={34} height={24} rx={2} fill="#FFFFFF" stroke="#D5DBE0" strokeWidth={0.5} />
                    <rect x={x} y={y} width={34} height={5} rx={2} fill="#1A1A2E" />
                    <rect x={x + 2} y={y + 8} width={20} height={1.5} fill="#C0392B" />
                    <rect x={x + 2} y={y + 12} width={26} height={1.5} fill="#2C3E50" />
                    <rect x={x + 2} y={y + 15} width={22} height={1.5} fill="#2C3E50" opacity={0.7} />
                    <rect x={x} y={y + 20} width={34} height={4} fill="#1A1A2E" />
                  </g>
                );
              })
            )}
          </g>
        );

      case 'focus-lane':
        return (
          <g>
            {/* Left context card */}
            <rect x={3} y={8} width={24} height={40} rx={2} fill="#FFFFFF" stroke="#D5DBE0" />
            <rect x={5} y={11} width={16} height={2} fill="#2C3E50" />
            <rect x={5} y={15} width={12} height={1.5} fill="#2C3E50" opacity={0.6} />
            {/* Focused center */}
            <rect x={31} y={3} width={50} height={50} rx={2} fill="#FFFFFF" stroke="#16A085" strokeWidth={1.5} />
            <rect x={31} y={3} width={50} height={3} fill="#16A085" />
            <rect x={33} y={9} width={24} height={3} fill="#2C3E50" />
            <rect x={33} y={14} width={46} height={3} fill="#FFF3D6" />
            <text x={33} y={17} fontSize={2.5} fontWeight={700} fill="#8A5A00">ALLERGEN</text>
            <text x={34} y={26} fontSize={7} fontWeight={900} fill="#2C3E50">2</text>
            <rect x={40} y={22} width={20} height={2} fill="#2C3E50" />
            <text x={34} y={34} fontSize={7} fontWeight={900} fill="#2C3E50">1</text>
            <rect x={40} y={30} width={22} height={2} fill="#2C3E50" />
            <rect x={33} y={44} width={14} height={5} rx={1} fill="none" stroke="#16A085" />
            <rect x={49} y={44} width={14} height={5} rx={1} fill="none" stroke="#16A085" />
            <rect x={65} y={44} width={14} height={5} rx={1} fill="none" stroke="#16A085" />
            {/* Right context card */}
            <rect x={85} y={8} width={24} height={40} rx={2} fill="#FFFFFF" stroke="#D5DBE0" />
            <rect x={87} y={11} width={16} height={2} fill="#2C3E50" />
            <rect x={87} y={15} width={12} height={1.5} fill="#2C3E50" opacity={0.6} />
          </g>
        );

      case 'distance-view':
        return (
          <g>
            <rect x={3} y={3} width={106} height={50} rx={2} fill="#FFFFFF" stroke="#D5DBE0" />
            <rect x={3} y={3} width={106} height={5} fill="#1A1A2E" />
            <rect x={3} y={10} width={106} height={4} fill="#FDECEA" />
            <text x={8} y={30} fontSize={16} fontWeight={900} fill="#2C3E50">23</text>
            <circle cx={90} cy={26} r={9} fill="none" stroke="#E67E22" strokeWidth={2} />
            <text x={90} y={29} textAnchor="middle" fontSize={5} fontWeight={800} fill="#2C3E50">32:24</text>
            <rect x={30} y={38} width={45} height={3} fill="#2C3E50" />
            <rect x={30} y={43} width={35} height={2} fill="#2471A3" />
            <rect x={30} y={47} width={30} height={2} fill="#C0392B" />
          </g>
        );

      case 'progressive-ticket':
        return (
          <g>
            <rect x={3} y={3} width={106} height={50} rx={2} fill="#FFFFFF" stroke="#D5DBE0" />
            <rect x={5} y={6} width={40} height={3} fill="#2C3E50" />
            <rect x={90} y={6} width={16} height={3} fill="#2C3E50" opacity={0.6} />
            <rect x={5} y={11} width={102} height={3} fill="#FDECEA" />
            {/* Active course expanded */}
            <rect x={5} y={16} width={102} height={18} rx={1} fill="#F6FAF9" stroke="#16A085" strokeWidth={0.5} />
            <rect x={7} y={18} width={30} height={2} fill="#16A085" />
            <rect x={7} y={22} width={70} height={2} fill="#2C3E50" />
            <rect x={7} y={26} width={80} height={2} fill="#2C3E50" opacity={0.7} />
            <rect x={7} y={30} width={65} height={2} fill="#2C3E50" opacity={0.7} />
            {/* Collapsed */}
            <rect x={5} y={36} width={102} height={3} fill="#2C3E50" opacity={0.3} />
            <rect x={5} y={40} width={102} height={3} fill="#2C3E50" opacity={0.2} />
            <rect x={3} y={48} width={106} height={5} fill="#16A085" />
          </g>
        );

      case 'safety-first':
        return (
          <g>
            <rect x={3} y={3} width={106} height={50} rx={2} fill="#0D0D1A" />
            <rect x={3} y={3} width={106} height={4} fill="#1A1A2E" />
            <rect x={3} y={9} width={106} height={9} fill="#E84C3D" />
            <text x={56} y={15} textAnchor="middle" fontSize={4} fontWeight={800} fill="#FFFFFF">
              ALLERGEN: PEANUT · CLEAN BOARD
            </text>
            <rect x={5} y={22} width={40} height={2} fill="#FFFFFF" />
            <rect x={5} y={26} width={30} height={2.5} fill="#3B1F1F" />
            <rect x={5} y={32} width={44} height={2} fill="#FFFFFF" />
            <rect x={5} y={36} width={28} height={2.5} fill="#3B1F1F" />
            <rect x={5} y={42} width={38} height={2} fill="#FFFFFF" />
            <rect x={3} y={48} width={106} height={5} fill="#1A1A2E" />
          </g>
        );

      case 'timeline-flow':
        return (
          <g>
            <rect x={0} y={0} width={112} height={56} fill="#F0F2F5" />
            {/* SLA ruler */}
            <line x1={2} y1={7} x2={110} y2={7} stroke="#95A5A6" strokeWidth={0.5} />
            {['New', 'Cook', 'Plate', 'Ready'].map((l, i) => {
              const x = 2 + i * 27.5;
              return (
                <g key={l}>
                  <text x={x + 13} y={5} textAnchor="middle" fontSize={3} fontWeight={700} fill="#6C7A89">{l}</text>
                  <rect x={x} y={10} width={26} height={30} rx={1.5} fill="#FFFFFF" stroke="#D5DBE0" strokeWidth={0.5} />
                  <rect x={x + 2} y={13} width={12} height={2} fill="#2C3E50" />
                  <rect x={x + 2} y={17} width={22} height={1.5} fill="#E84C3D" />
                  <rect x={x + 2} y={21} width={20} height={1.5} fill="#16A085" />
                  <rect x={x + 2} y={26} width={16} height={1.5} fill="#95A5A6" />
                  <rect x={x + 2} y={34} width={22} height={4} rx={1} fill="none" stroke="#2C3E50" strokeWidth={0.4} />
                </g>
              );
            })}
            {/* Overdue card in Cook lane */}
            <rect x={30} y={42} width={26} height={11} rx={1} fill="#FDECEA" stroke="#E84C3D" strokeWidth={0.6} />
            <text x={32} y={47} fontSize={3} fontWeight={800} fill="#C0392B">OVERDUE</text>
          </g>
        );

      case 'adaptive-density':
        return (
          <g>
            {/* mode pills */}
            <rect x={3} y={3} width={16} height={5} rx={2.5} fill="#E5E9EF" />
            <rect x={22} y={3} width={16} height={5} rx={2.5} fill="#1A1A2E" />
            <rect x={41} y={3} width={16} height={5} rx={2.5} fill="#E5E9EF" />
            {/* dense ticket rows */}
            <rect x={3} y={11} width={106} height={42} rx={1.5} fill="#FFFFFF" stroke="#D5DBE0" strokeWidth={0.5} />
            <rect x={3} y={11} width={106} height={5} fill="#1A1A2E" />
            <rect x={5} y={13} width={12} height={2} fill="#E84C3D" />
            {[18, 22, 26, 30, 34, 38, 42, 46].map((y, i) => (
              <g key={y}>
                <rect x={5} y={y} width={2} height={2} fill="#95A5A6" />
                <rect x={9} y={y} width={40 + (i % 3) * 8} height={2} fill="#2C3E50" opacity={i % 2 ? 0.7 : 1} />
                <rect x={80} y={y} width={20} height={2} fill="#2C3E50" opacity={0.4} />
              </g>
            ))}
          </g>
        );

      case 'dark-command-center':
        return (
          <g>
            <rect x={0} y={0} width={112} height={56} fill="#0D0D1A" />
            {[0, 1].map((c) =>
              [0, 1].map((r) => {
                const x = 3 + c * 54;
                const y = 3 + r * 27;
                return (
                  <g key={`${c}-${r}`}>
                    <rect x={x} y={y} width={52} height={25} rx={2} fill="#1A1A2E" stroke="#2A2A44" strokeWidth={0.5} />
                    <rect x={x} y={y} width={52} height={4} fill="#0D0D1A" />
                    <rect x={x + 2} y={y + 1} width={12} height={2} fill="#F5B4AC" />
                    <rect x={x + 2} y={y + 7} width={30} height={1.5} fill="#E84C3D" />
                    <rect x={x + 2} y={y + 11} width={38} height={1.5} fill="#E5E7EB" />
                    <rect x={x + 2} y={y + 14} width={32} height={1.5} fill="#E5E7EB" opacity={0.7} />
                    <rect x={x + 2} y={y + 17} width={28} height={1.5} fill="#E5E7EB" opacity={0.5} />
                    <rect x={x} y={y + 21} width={52} height={4} fill="#0D0D1A" />
                    <rect x={x + 18} y={y + 22} width={16} height={2} fill="#5EE3C1" />
                  </g>
                );
              })
            )}
          </g>
        );

      default:
        return null;
    }
  })();

  return (
    <svg viewBox="0 0 112 56" className="w-full h-full" preserveAspectRatio="none" style={{ background: bg }}>
      {content}
    </svg>
  );
}

type SegOption = { value: string; label: string };

function Segmented({
  options, value, onChange,
}: { options: readonly SegOption[]; value: string; onChange: (v: string) => void }) {


  return (
    <div className="inline-flex rounded-full bg-muted p-0.5 gap-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-2.5 h-7 rounded-full text-[11px] font-semibold transition-colors ${
              active
                ? 'bg-foreground text-background shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function UnderlineTabs({
  options, value, onChange,
}: { options: readonly SegOption[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-end">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`relative shrink-0 px-2 pt-2 pb-0 text-[11px] font-semibold whitespace-nowrap transition-colors ${
              active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="block pb-2 whitespace-nowrap">{o.label}</span>
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-text-primary">{label}</div>
      {children}
    </div>
  );
}


const ORDER_TYPES_LIST = [
  { key: 'dine-in', label: 'Dine in' },
  { key: 'take-out', label: 'Take out', warm: true },
  { key: 'delivery', label: 'Delivery' },
  { key: 'banquet', label: 'Banquet' },
  { key: 'drive-thru', label: 'Drive thru', warm: true },
  { key: 'curb-side', label: 'Curb side' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'phone-in', label: 'Phone-in' },
  { key: 'custom', label: 'Custom' },
] as const;

type PanelTab = 'display' | 'aging' | 'order-type';

export function TicketStudioSkeleton() {
  const [selectedBoard, setSelectedBoard] = useState('calm-board');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [layout, setLayout] = useState<string>('standard');
  const [density, setDensity] = useState<string>('medium');
  const [textSize, setTextSize] = useState<string>('large');
  const [identifier, setIdentifier] = useState<string>('order');
  const [safety, setSafety] = useState<string>('highlighted');
  const [theme, setTheme] = useState<string>('light');
  

  // New: personalize panel tabs + preview state.
  const [tab, setTab] = useState<PanelTab>('display');
  const [orderTypeKey, setOrderTypeKey] = useState<string>('dine-in');
  const [agingStageIndex, setAgingStageIndex] = useState<number | null>(null);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [expandedOrderType, setExpandedOrderType] = useState<string | null>(null);

  // Live data from global stores (shared with dedicated settings screens).
  const { rules, setRules, resetToDefaults: resetAgingRules } = useStatusRules();
  const {
    orderTypeColors,
    orderTypeDetailedColors,
    setOrderTypeColors,
    setOrderTypeDetailedColors,
  } = useKDSSettings();


  const board = BOARDS.find((b) => b.id === selectedBoard) ?? BOARDS[0];

  // Preview-only aging override. Uses each rule's minMinutes + 30s so the
  // preview lands squarely in that band. Never persists to real orders.
  const agingOverrideSeconds = useMemo(() => {
    if (agingStageIndex === null) return undefined;
    const rule = rules[Math.min(agingStageIndex, rules.length - 1)];
    return rule ? rule.minMinutes * 60 + 30 : undefined;
  }, [agingStageIndex, rules]);

  const cycleAgingStage = () => {
    setAgingStageIndex((i) => {
      const next = i === null ? 0 : (i + 1) % rules.length;
      return next;
    });
    const nextIndex = agingStageIndex === null ? 0 : (agingStageIndex + 1) % rules.length;
    const nextRule = rules[nextIndex];
    if (nextRule) {
      setTab('aging');
      setExpandedRule(nextRule.id);
    }
  };

  const openOrderTypeInPanel = (key: string) => {
    setOrderTypeKey(key);
    setTab('order-type');
    setExpandedOrderType(key);
  };

  const updateRule = (id: string, patch: Partial<StatusRule>) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const updateOrderTypeColor = (key: string, field: 'headerBg' | 'headerText', value: string) => {
    const current = orderTypeDetailedColors?.[key] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[key];
    setOrderTypeDetailedColors({
      ...orderTypeDetailedColors,
      [key]: { ...current, [field]: value },
    });
    if (field === 'headerBg') {
      setOrderTypeColors({ ...orderTypeColors, [key]: value });
    }
  };

  const handleReset = () => {
    setLayout('compact');
    setDensity('high');
    setTextSize('large');
    setIdentifier('order');
    setSafety('bright');
    setTheme('light');

    setAgingStageIndex(null);
    setOrderTypeKey('dine-in');
    setExpandedRule(null);
    setExpandedOrderType(null);
    resetAgingRules();
    setOrderTypeColors(DEFAULT_ORDER_TYPE_COLORS);
    setOrderTypeDetailedColors(DEFAULT_ORDER_TYPE_DETAILED_COLORS);
  };




  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-4 pb-2">
      <div className="flex-1 min-h-0 flex gap-4">
        {/* MIDDLE: ticket preview */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 min-h-0 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex flex-col justify-center min-w-0">
              <h2 className="text-sm font-bold text-text-primary truncate">{board.name}</h2>
              <span className="text-xs text-text-secondary truncate">
                {board.subtitle} · Board 1 of {BOARDS.length}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPreviewOpen(true)}
                className="h-8 rounded-full bg-muted text-[11px] font-semibold text-text-primary inline-flex items-center justify-center gap-1 px-3 hover:bg-muted/70 transition-colors"
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
              <button
                onClick={handleReset}
                className="h-8 rounded-full bg-muted text-[11px] font-semibold text-text-primary inline-flex items-center justify-center gap-1 px-3 hover:bg-muted/70 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </div>
          <div
            className="flex-1 min-h-0 overflow-hidden p-3"
            style={{
              background:
                theme === 'dark'
                  ? '#0D0D1A'
                  : theme === 'auto'
                  ? 'linear-gradient(90deg, #F0F2F5 0 50%, #0D0D1A 50% 100%)'
                  : '#F0F2F5',
            }}
          >
            <div
              data-ts-preview
              data-theme={theme}
              data-safety={safety}
              data-density={density}
              data-textsize={textSize}
              data-layout={layout}
              className="w-full h-full"
            >
              <KdsScreenMock
                boardId={selectedBoard}
                identifier={identifier as 'order' | 'guest'}
                textSize={textSize}
                agingOverrideSeconds={agingOverrideSeconds}
                onHeaderClick={(k) => openOrderTypeInPanel(k)}
                onTimerClick={cycleAgingStage}
              />
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
              [data-ts-preview][data-density="low"] .space-y-1 > * + *,
              [data-ts-preview][data-density="low"] .space-y-1\\.5 > * + *,
              [data-ts-preview][data-density="low"] .space-y-2 > * + * { margin-top: .55rem; }
              [data-ts-preview][data-density="high"] .space-y-1 > * + *,
              [data-ts-preview][data-density="high"] .space-y-1\\.5 > * + *,
              [data-ts-preview][data-density="high"] .space-y-2 > * + * { margin-top: .1rem; }
              [data-ts-preview][data-density="high"] .py-2 { padding-top: .3rem; padding-bottom: .3rem; }
              [data-ts-preview][data-density="high"] .py-1\\.5 { padding-top: .2rem; padding-bottom: .2rem; }
              [data-ts-preview][data-density="low"]  .py-1\\.5 { padding-top: .55rem; padding-bottom: .55rem; }
              [data-ts-preview][data-safety="muted"] { filter: saturate(.35); }
              [data-ts-preview][data-safety="bright"] { filter: saturate(1.35); }
              [data-ts-preview][data-safety="highlighted"] .text-\\[\\#C0392B\\],
              [data-ts-preview][data-safety="highlighted"] .bg-\\[\\#E84C3D\\],
              [data-ts-preview][data-safety="highlighted"] .bg-\\[\\#C0392B\\] { animation: ts-pulse 1.4s ease-in-out infinite; }
              @keyframes ts-pulse { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
              [data-ts-preview][data-theme="dark"] { filter: invert(1) hue-rotate(180deg); }
              [data-ts-preview][data-theme="dark"] img,
              [data-ts-preview][data-theme="dark"] svg { filter: invert(1) hue-rotate(180deg); }
            `}} />
          </div>
        </div>

        {/* BOTTOM: horizontal board list */}
        <aside className="h-[110px] shrink-0 rounded-2xl border border-border bg-card flex flex-col mt-4">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
            <h2 className="text-sm font-bold text-text-primary">Boards</h2>
            <span className="text-[10px] text-text-secondary">{BOARDS.length} total</span>
          </div>
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden p-2">
            <div className="flex items-stretch gap-2 h-full">
              {BOARDS.map((b) => {
                const active = b.id === selectedBoard;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBoard(b.id)}
                    className={`shrink-0 text-left rounded-xl border-2 transition-all p-2 flex items-center gap-2.5 h-full w-[190px] ${
                      active
                        ? 'border-foreground bg-muted/40 shadow-sm'
                        : 'border-border hover:border-text-secondary hover:bg-muted/20'
                    }`}
                  >
                    <div className="relative w-[80px] h-full rounded-md bg-muted overflow-hidden shrink-0">
                      <BoardThumb id={b.id} active={active} />
                      {b.featured && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-foreground text-background text-[8px] flex items-center justify-center font-bold">
                          ★
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-center h-full">
                      <div className="text-[11px] font-bold text-text-primary truncate leading-tight">{b.name}</div>
                      <div className="text-[10px] text-text-secondary leading-tight line-clamp-2">{b.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* RIGHT: personalize — adaptive width */}
      <aside className="w-[210px] md:w-[230px] lg:w-[260px] xl:w-[300px] 2xl:w-[340px] shrink-0 rounded-2xl border border-border bg-card flex flex-col">
        <div className="px-4 pt-3 pb-0 border-b border-border space-y-2.5">
          <h2 className="text-sm font-bold text-text-primary">Personalize</h2>
          <UnderlineTabs
            value={tab}
            onChange={(v) => setTab(v as PanelTab)}
            options={[
              { value: 'display', label: 'Display' },
              { value: 'aging', label: 'Ticket aging' },
              { value: 'order-type', label: 'Order type' },
            ]}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-4 space-y-4">
          {tab === 'display' && (
            <>
              <Field label="Layout">
                <Segmented
                  value={layout}
                  onChange={setLayout}
                  options={[
                    { value: 'compact', label: 'Compact' },
                    { value: 'standard', label: 'Standard' },
                    { value: 'spacious', label: 'Spacious' },
                  ]}
                />
              </Field>
              <Field label="Density">
                <Segmented
                  value={density}
                  onChange={setDensity}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                />
              </Field>
              <Field label="Text size">
                <Segmented
                  value={textSize}
                  onChange={setTextSize}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                  ]}
                />
              </Field>
              <Field label="Ticket identifier">
                <Segmented
                  value={identifier}
                  onChange={setIdentifier}
                  options={[
                    { value: 'order', label: 'Order number' },
                    { value: 'guest', label: 'Guest name' },
                  ]}
                />
              </Field>
              <Field label="Safety emphasis">
                <Segmented
                  value={safety}
                  onChange={setSafety}
                  options={[
                    { value: 'muted', label: 'Muted' },
                    { value: 'bright', label: 'Bright' },
                    { value: 'highlighted', label: 'Highlighted' },
                  ]}
                />
              </Field>
              <Field label="Theme">
                <Segmented
                  value={theme}
                  onChange={setTheme}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto' },
                  ]}
                />
              </Field>
            </>
          )}

          {tab === 'aging' && (
            <div className="space-y-2">
              <p className="text-[11px] text-text-secondary">
                Time bands drive the ticket header color as orders age. Edits sync with Settings › Ticket aging rules.
              </p>
              {rules.map((rule) => {
                const open = expandedRule === rule.id;
                const textResolved =
                  rule.textColor === 'white' ? '#FFFFFF' : rule.textColor === 'black' ? '#000000' : '#6C7A89';
                const rangeLabel =
                  rule.maxMinutes === null
                    ? `${rule.minMinutes}+ min`
                    : `${rule.minMinutes}\u2013${rule.maxMinutes} min`;
                return (
                  <div key={rule.id} className="rounded-lg border border-border bg-surface-card overflow-hidden">
                    <button
                      onClick={() => setExpandedRule(open ? null : rule.id)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-muted/30 transition-colors"
                    >
                      <span
                        className="w-7 h-7 rounded-md shrink-0 border border-border"
                        style={{ backgroundColor: rule.color, color: textResolved }}
                      />
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-[11px] font-bold text-text-primary truncate">{rule.label}</div>
                        <div className="text-[10px] text-text-secondary">{rangeLabel}</div>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {open && (
                      <div className="px-2.5 py-2.5 border-t border-border space-y-2.5">
                        <label className="block">
                          <div className="text-[10px] font-semibold text-text-secondary mb-1">Name</div>
                          <input
                            type="text"
                            value={rule.label}
                            onChange={(e) => updateRule(rule.id, { label: e.target.value })}
                            className="w-full h-8 px-2 rounded-md border border-border bg-background text-[11px]"
                          />
                        </label>
                        <div className="flex gap-2">
                          <label className="flex-1">
                            <div className="text-[10px] font-semibold text-text-secondary mb-1">From (min)</div>
                            <input
                              type="number"
                              min={0}
                              value={rule.minMinutes}
                              onChange={(e) => updateRule(rule.id, { minMinutes: Math.max(0, Number(e.target.value)) })}
                              className="w-full h-8 px-2 rounded-md border border-border bg-background text-[11px]"
                            />
                          </label>
                          <label className="flex-1">
                            <div className="text-[10px] font-semibold text-text-secondary mb-1">To (min)</div>
                            <input
                              type="number"
                              min={0}
                              value={rule.maxMinutes ?? ''}
                              placeholder={rule.maxMinutes === null ? '∞' : ''}
                              disabled={rule.maxMinutes === null}
                              onChange={(e) =>
                                updateRule(rule.id, {
                                  maxMinutes: e.target.value === '' ? null : Number(e.target.value),
                                })
                              }
                              className="w-full h-8 px-2 rounded-md border border-border bg-background text-[11px] disabled:opacity-60"
                            />
                          </label>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold text-text-secondary mb-1">Color</div>
                          <div className="flex items-center gap-2">
                            <label className="relative cursor-pointer">
                              <input
                                type="color"
                                value={rule.color}
                                onChange={(e) => updateRule(rule.id, { color: e.target.value })}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <span
                                className="block w-7 h-7 rounded-md border border-border"
                                style={{ backgroundColor: rule.color }}
                              />
                            </label>
                            <span className="text-[10px] font-mono uppercase text-text-muted">{rule.color}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold text-text-secondary mb-1">Text color</div>
                          <div className="inline-flex rounded-full bg-muted p-0.5 gap-0.5">
                            {(['white', 'grey', 'black'] as const).map((tc) => {
                              const active = rule.textColor === tc;
                              return (
                                <button
                                  key={tc}
                                  onClick={() => updateRule(rule.id, { textColor: tc })}
                                  className={`px-2.5 h-6 rounded-full text-[10px] font-semibold capitalize transition-colors ${
                                    active
                                      ? 'bg-foreground text-background'
                                      : 'text-text-secondary hover:text-text-primary'
                                  }`}
                                >
                                  {tc}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'order-type' && (
            <div className="space-y-2">
              <p className="text-[11px] text-text-secondary">
                Header colors per order type. Edits sync with Settings › Order type colors.
              </p>
              {ORDER_TYPES_LIST.map((ot) => {
                const open = expandedOrderType === ot.key;
                const colors =
                  orderTypeDetailedColors?.[ot.key] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[ot.key];
                const isActive = orderTypeKey === ot.key;
                return (
                  <div
                    key={ot.key}
                    className={`rounded-lg border overflow-hidden ${
                      isActive ? 'border-foreground' : 'border-border'
                    } bg-surface-card`}
                  >
                    <button
                      onClick={() => {
                        setOrderTypeKey(ot.key);
                        setExpandedOrderType(open ? null : ot.key);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-muted/30 transition-colors"
                    >
                      <span
                        className="w-7 h-7 rounded-md shrink-0 border border-border"
                        style={{ backgroundColor: colors.headerBg }}
                      />
                      <div className="min-w-0 flex-1 text-left flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-text-primary truncate">{ot.label}</span>
                        {'warm' in ot && ot.warm && (
                          <span className="text-[8px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded bg-[#FFF3D6] text-[#8A5A00]">
                            Warm
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {open && (
                      <div className="px-2.5 py-2.5 border-t border-border space-y-2.5">
                        {(
                          [
                            { field: 'headerBg', label: 'Background' },
                            { field: 'headerText', label: 'Text' },
                          ] as const
                        ).map(({ field, label }) => (
                          <div key={field}>
                            <div className="text-[10px] font-semibold text-text-secondary mb-1">{label}</div>
                            <div className="flex items-center gap-2">
                              <label className="relative cursor-pointer">
                                <input
                                  type="color"
                                  value={colors[field]}
                                  onChange={(e) => updateOrderTypeColor(ot.key, field, e.target.value)}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <span
                                  className="block w-7 h-7 rounded-md border border-border"
                                  style={{ backgroundColor: colors[field] }}
                                />
                              </label>
                              <input
                                type="text"
                                value={colors[field]}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateOrderTypeColor(ot.key, field, v);
                                }}
                                className="flex-1 h-7 px-2 rounded-md border border-border bg-background text-[10px] font-mono uppercase"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>

    {previewOpen && (
      <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
        <div
          className="relative w-full h-full max-w-[1600px] max-h-[95vh] rounded-2xl overflow-hidden bg-card border border-border flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
            <div className="flex items-baseline gap-2 min-w-0">
              <h2 className="text-sm font-bold text-text-primary truncate">{board.name}</h2>
              <span className="text-xs text-text-secondary truncate">Full KDS preview</span>
            </div>
            <button
              onClick={() => setPreviewOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted hover:bg-muted/70 px-2.5 py-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold text-text-primary">Close</span>
            </button>
          </div>
          <div className="flex-1 min-h-0 p-3" style={{ background: theme === 'dark' ? '#0D0D1A' : '#F0F2F5' }}>
            <div
              data-ts-preview
              data-theme={theme}
              data-safety={safety}
              data-density={density}
              data-textsize={textSize}
              data-layout={layout}
              className="w-full h-full"
            >
              <KdsScreenMock
                boardId={selectedBoard}
                identifier={identifier as 'order' | 'guest'}
                textSize={textSize}
                agingOverrideSeconds={agingOverrideSeconds}
                onHeaderClick={(k) => openOrderTypeInPanel(k)}
                onTimerClick={cycleAgingStage}
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}


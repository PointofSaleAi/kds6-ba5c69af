import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Eye, RotateCcw, X } from 'lucide-react';
import { BoardTicketPreview } from './BoardTicketPreview';
import { useStatusRules, type StatusRule } from '@/hooks/use-status-rules';
import {
  useKDSSettings,
  DEFAULT_ORDER_TYPE_COLORS,
  DEFAULT_ORDER_TYPE_DETAILED_COLORS,
} from '@/hooks/use-kds-settings';


function ScaledKdsPreview({ boardId }: { boardId: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const BASE_W = 1440;
  const BASE_H = 900;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / BASE_W, height / BASE_H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isDark = boardId === 'dark-command-center' || boardId === 'safety-first';

  return (
    <div ref={wrapRef} className="w-full h-full relative overflow-hidden" style={{ background: isDark ? '#0D0D1A' : '#F0F2F5' }}>
      <div
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="absolute top-0 left-0 flex"
      >
        {/* Sidebar */}
        <div className="w-[56px] h-full shrink-0" style={{ background: '#0D0D1A' }} />
        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-[48px] shrink-0 border-b flex items-center px-6" style={{ borderColor: isDark ? '#2A2A44' : '#D5DBE0', background: isDark ? '#1A1A2E' : '#FFFFFF' }}>
            <div className="text-sm font-bold" style={{ color: isDark ? '#FFFFFF' : '#2C3E50' }}>Kitchen Display</div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-6">
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <BoardTicketPreview boardId={boardId} />
                </div>
              ))}
            </div>
          </div>
          <div className="h-[44px] shrink-0 border-t" style={{ borderColor: isDark ? '#2A2A44' : '#D5DBE0', background: isDark ? '#1A1A2E' : '#FFFFFF' }} />
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
    setLayout('standard');
    setDensity('medium');
    setTextSize('large');
    setIdentifier('order');
    setSafety('highlighted');
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
    <div className="flex-1 min-h-0 overflow-hidden flex gap-4 pb-2">
      {/* LEFT: vertical board list */}
      <aside className="w-[220px] shrink-0 rounded-2xl border border-border bg-card flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold text-text-primary">Boards</h2>
          <span className="text-[10px] text-text-secondary">{BOARDS.length} total</span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-2 space-y-1.5">
          {BOARDS.map((b) => {
            const active = b.id === selectedBoard;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBoard(b.id)}
                className={`w-full text-left rounded-xl border-2 transition-all p-2 flex items-center gap-2.5 ${
                  active
                    ? 'border-foreground bg-muted/40 shadow-sm'
                    : 'border-border hover:border-text-secondary hover:bg-muted/20'
                }`}
              >
                <div className="relative w-[72px] h-10 rounded-md bg-muted overflow-hidden shrink-0">
                  <BoardThumb id={b.id} active={active} />
                  {b.featured && (
                    <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-foreground text-background text-[8px] flex items-center justify-center font-bold">
                      ★
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-text-primary truncate leading-tight">{b.name}</div>
                  <div className="text-[10px] text-text-secondary leading-tight line-clamp-2">{b.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

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
            className="flex-1 min-h-0 overflow-auto p-4 flex items-start justify-center"
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
              style={{
                width: layout === 'compact' ? 280 : layout === 'spacious' ? 380 : 340,
                transform: `scale(${textSize === 'small' ? 0.9 : textSize === 'large' ? 1.12 : 1})`,
                transformOrigin: 'top center',
                padding: layout === 'compact' ? 4 : layout === 'spacious' ? 24 : 12,
              }}
            >
              <BoardTicketPreview
                boardId={selectedBoard}
                identifier={identifier as 'order' | 'guest'}
                orderType={orderTypeKey === 'dine-in' ? 'DINE IN' : ORDER_TYPES_LIST.find((o) => o.key === orderTypeKey)?.label.toUpperCase()}
                orderTypeKey={orderTypeKey}
                agingOverrideSeconds={agingOverrideSeconds}
                onHeaderClick={() => openOrderTypeInPanel(orderTypeKey)}
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
            <div className="flex-1 min-h-0">
              <ScaledKdsPreview boardId={selectedBoard} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  Eye,
  RotateCcw,
  Columns2,
  X,
} from 'lucide-react';
import { BoardTicketPreview } from './BoardTicketPreview';
import { TicketBoard } from './glass/TicketBoard';
import { GlassBoardProvider } from './glass/glass-board-context';
import { KDSSidebar } from './KDSSidebar';
import { ItemSummaryPanel } from './ItemSummaryPanel';
import { BottomStatusBar } from './BottomStatusBar';
import { useStatusRules, type StatusRule } from '@/hooks/use-status-rules';
import {
  useKDSSettings,
  DEFAULT_ORDER_TYPE_COLORS,
  DEFAULT_ORDER_TYPE_DETAILED_COLORS,
} from '@/hooks/use-kds-settings';
import { mockOrders } from '@/data/mock-orders';

const SCREEN_ORDER_TYPES = [
  { key: 'dine-in', label: 'DINE IN' },
  { key: 'take-out', label: 'TAKE OUT' },
  { key: 'delivery', label: 'DELIVERY' },
  { key: 'banquet', label: 'BANQUET' },
  { key: 'drive-thru', label: 'DRIVE THRU' },
  { key: 'curb-side', label: 'CURB SIDE' },
  { key: 'phone-in', label: 'PHONE IN' },
  { key: 'scheduled', label: 'SCHEDULED' },
] as const;

type KdsScreenMockProps = {
  boardId: string;
  identifier: 'order' | 'guest';
  textSize: string;
  /** Personalize: Layout (spacing), Density, Safety Emphasis, Theme. */
  layout?: string;
  density?: string;
  safety?: string;
  theme?: string;
  agingOverrideSeconds?: number;
  onHeaderClick?: (key: string) => void;
  onTimerClick?: () => void;
};

function KdsScreenMock({
  boardId,
  identifier,
  textSize,
  layout = 'standard',
  density = 'medium',
  safety = 'bright',
  theme = 'light',
  agingOverrideSeconds,
  onHeaderClick,
  onTimerClick,
}: KdsScreenMockProps) {
  const previewOrders = useMemo(() => mockOrders.slice(0, 6), []);

  const textScale = textSize === 'small' ? 0.9 : textSize === 'large' ? 1.05 : 1;


  // Render as a fixed "virtual KDS screen" and uniformly scale it into the
  // preview container so sidebar, summary panel, footer, and tickets all
  // stay proportional to the real Tickets screen.
  const VIRTUAL_W = 1440;
  const VIRTUAL_H = 900;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const s = Math.min(el.clientWidth / VIRTUAL_W, el.clientHeight / VIRTUAL_H);
      setScale(s > 0 ? s : 1);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaledW = VIRTUAL_W * scale;
  const scaledH = VIRTUAL_H * scale;

  return (
    <div
      ref={containerRef}
      data-ts-preview
      className="w-full h-full relative overflow-hidden bg-surface-bg"
    >
      <div
        className="absolute"
        style={{
          width: scaledW,
          height: scaledH,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%)`,
        }}
      >
        <div
          style={{
            width: VIRTUAL_W,
            height: VIRTUAL_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="flex flex-col bg-surface-bg"
        >
          <div className="flex-1 min-h-0 flex">
            <KDSSidebar
              activeFilter="all"
              onFilterChange={() => undefined}
              onNavigate={() => undefined}
              activeNav="home"
              seenCount={3}
              unseenCount={2}
            />

            <div className="flex-1 min-w-0 flex">
              <div className="flex-1 min-w-0 overflow-auto p-2">
                {boardId === 'glass-view' ? (
                  <GlassBoardProvider>
                    <TicketBoard
                      identifier={identifier}
                      scaleFactor={textScale}
                      spacing={layout === 'compact' ? 'Compact' : layout === 'spacious' ? 'Spacious' : 'Standard'}
                      density={density as 'low' | 'medium' | 'high'}
                      safety={safety as 'muted' | 'bright' | 'highlighted'}
                      themeOverride={theme === 'dark' ? 'dark' : 'light'}
                    />
                  </GlassBoardProvider>
                ) : boardId === 'focus-lane' ? (
                  <FocusLaneBoard
                    identifier={identifier}
                    textScale={textScale}
                    agingOverrideSeconds={agingOverrideSeconds}
                    onHeaderClick={onHeaderClick}
                    onTimerClick={onTimerClick}
                  />
                ) : (
                  <div
                    className="grid grid-cols-4 auto-rows-min gap-2 content-start items-start"
                  >
                    {SCREEN_ORDER_TYPES.map((ot, i) => (
                      <div key={ot.key} className="min-w-0 flex items-start justify-center">
                        <div
                          data-ts-ticket
                          className="origin-top w-full"
                          style={{ transform: `scale(${textScale})` }}
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
                )}
              </div>

              <ItemSummaryPanel orders={previewOrders} />
            </div>
          </div>

          <BottomStatusBar
            orderCount={12}
            viewMode="grid"
            onViewModeChange={() => undefined}
            theme="light"
            onToggleTheme={() => undefined}
            sortMode="newest"
            onSortModeChange={() => undefined}
            onOpenLanguageSettings={() => undefined}
            onOpenCategoryFilter={() => undefined}
            onOpenRevenueFilter={() => undefined}
            aiAssistantOpen={false}
            onToggleAiAssistant={() => undefined}
            orderTypeFilter={[]}
            onOrderTypeFilterChange={() => undefined}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Focus Lane board layout: the priority (selected) ticket is rendered
 * large in the center of a 4x3 grid, and every other order type is
 * shown as a smaller context ticket around it. Tapping any surrounding
 * ticket promotes it to the centered, enlarged view.
 */
function FocusLaneBoard({
  identifier,
  textScale,
  agingOverrideSeconds,
  onHeaderClick,
  onTimerClick,
}: {
  identifier: 'order' | 'guest';
  textScale: number;
  agingOverrideSeconds?: number;
  onHeaderClick?: (key: string) => void;
  onTimerClick?: () => void;
}) {
  const [focusIndex, setFocusIndex] = useState(0);
  const focus = SCREEN_ORDER_TYPES[focusIndex];
  const others = SCREEN_ORDER_TYPES
    .map((ot, i) => ({ ot, i }))
    .filter(({ i }) => i !== focusIndex);

  // 7 ring positions around the centered 2x2 focus slot inside a 4x3 grid.
  // The bottom-middle slot spans 2 columns so no cell is left empty.
  const ringPositions: Array<{ row: number; col: number; colSpan?: number }> = [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 2, col: 1 },
    { row: 2, col: 4 },
    { row: 3, col: 1 },
    { row: 3, col: 2, colSpan: 2 },
    { row: 3, col: 4 },
  ];

  return (
    <div
      className="grid gap-2 h-full"
      style={{
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
      }}
    >
      {/* Focused ticket, centered and enlarged. */}
      <button
        type="button"
        onClick={() => onHeaderClick?.(focus.key)}
        className="min-w-0 min-h-0 flex items-start justify-center overflow-hidden text-left"
        style={{ gridColumn: '2 / span 2', gridRow: '1 / span 2' }}
        aria-label={`Focused ticket: ${focus.label}`}
      >
        <div
          data-ts-ticket
          className="origin-top w-full"
          style={{ transform: `scale(${textScale * 1.55})` }}
        >
          <BoardTicketPreview
            boardId="focus-lane"
            identifier={identifier}
            orderType={focus.label}
            orderTypeKey={focus.key}
            agingOverrideSeconds={
              agingOverrideSeconds !== undefined
                ? agingOverrideSeconds + focusIndex * 15
                : undefined
            }
            onHeaderClick={() => onHeaderClick?.(focus.key)}
            onTimerClick={onTimerClick}
          />
        </div>
      </button>

      {/* Surrounding context tickets. Tap to promote to focus. */}
      {others.slice(0, ringPositions.length).map(({ ot, i }, idx) => {
        const pos = ringPositions[idx];
        return (
          <button
            key={ot.key}
            type="button"
            onClick={() => setFocusIndex(i)}
            className="min-w-0 min-h-0 flex items-start justify-center overflow-hidden text-left transition hover:opacity-90"
            style={{
              gridColumn: pos.colSpan ? `${pos.col} / span ${pos.colSpan}` : String(pos.col),
              gridRow: pos.row,
            }}
            aria-label={`Focus ${ot.label}`}
          >
            <div
              data-ts-ticket
              className="origin-top w-full"
              style={{ transform: `scale(${textScale * (pos.colSpan ? 0.95 : 0.82)})` }}
            >
              <BoardTicketPreview
                boardId="focus-lane"
                identifier={identifier}
                orderType={ot.label}
                orderTypeKey={ot.key}
                agingOverrideSeconds={
                  agingOverrideSeconds !== undefined
                    ? agingOverrideSeconds + i * 15
                    : undefined
                }
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}



type Board = { id: string; name: string; subtitle: string; featured?: boolean };

const BOARDS: Board[] = [


  { id: 'calm-board', name: 'Calm Board', subtitle: 'Balanced Operations, Low Visual Noise', featured: true },
  { id: 'focus-lane', name: 'Focus Lane', subtitle: 'Priority Ticket Centered, Context at Edges' },
  { id: 'distance-view', name: 'Distance View', subtitle: 'Maximum Readability from Several Feet' },
  { id: 'progressive-ticket', name: 'Progressive Ticket', subtitle: 'Reveals Detail for the Active Course' },
  { id: 'safety-first', name: 'Safety First', subtitle: 'Allergen and Cross-contact Controls Lead', featured: true },
  { id: 'timeline-flow', name: 'Timeline Flow', subtitle: 'New, Cooking, Plating, Ready Lanes' },
  { id: 'adaptive-density', name: 'Adaptive Density', subtitle: 'Comfortable, Balanced, Rush Modes' },
  { id: 'dark-command-center', name: 'Dark Command Center', subtitle: 'High-contrast Focused Operations', featured: true },
  { id: 'glass-view', name: 'Glass View', subtitle: 'Translucent Cards, Large Order Numbers' },
];

function BoardThumb({ id }: { id: string; active: boolean }) {
  // Rich mini renderings that mirror each PDF screen at a glance.
  // viewBox 112x56, non-uniform scaled to fill the thumb container.
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
  { key: 'drive-thru', label: 'Drive Thru', warm: true },
  { key: 'curb-side', label: 'Curb Side' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'phone-in', label: 'Phone-in' },
  { key: 'custom', label: 'Custom' },
] as const;

type PanelTab = 'display' | 'aging' | 'order-type';

export function TicketStudioSkeleton() {
  const [selectedBoard, setSelectedBoard] = useState('calm-board');
  const [selectedBoardB, setSelectedBoardB] = useState('focus-lane');
  const [compareMode, setCompareMode] = useState(false);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
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
  const boardB = BOARDS.find((b) => b.id === selectedBoardB) ?? BOARDS[1];

  const handleBoardClick = (id: string) => {
    if (!compareMode) {
      setSelectedBoard(id);
      return;
    }
    if (activeSlot === 'A') {
      setSelectedBoard(id);
      setActiveSlot('B');
    } else {
      setSelectedBoardB(id);
      setActiveSlot('A');
    }
  };

  const toggleCompare = () => {
    setCompareMode((v) => {
      const next = !v;
      if (next) setActiveSlot('A');
      return next;
    });
  };

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
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-2 pb-0">
      <div className="flex-1 min-h-0 flex gap-2">
        {/* MIDDLE: ticket preview */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 min-h-0 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex flex-col justify-center min-w-0">
              <h2 className="text-sm font-bold text-text-primary truncate">
                {compareMode ? `${board.name}  vs  ${boardB.name}` : board.name}
              </h2>
              <span className="text-xs text-text-secondary truncate">
                {compareMode
                  ? `Comparing 2 boards · tap boards below to swap slot ${activeSlot}`
                  : `${board.subtitle} · Board 1 of ${BOARDS.length}`}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleCompare}
                className={`h-8 rounded-full text-[11px] font-semibold inline-flex items-center justify-center gap-1 px-3 transition-colors ${
                  compareMode
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'bg-muted text-text-primary hover:bg-muted/70'
                }`}
              >
                <Columns2 className="w-3 h-3" />
                Two-Up
              </button>
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
            className="flex-1 min-h-0 overflow-hidden p-0"
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
              className={`w-full h-full ${theme === 'dark' ? 'dark' : ''} ${compareMode ? 'grid grid-cols-2 gap-1' : ''}`}
            >
              {compareMode ? (
                <>
                  <div className={`relative min-w-0 min-h-0 overflow-hidden border-2 ${activeSlot === 'A' ? 'border-foreground' : 'border-transparent'}`}>
                    <div className="absolute top-1 left-1 z-10 h-5 min-w-[20px] px-1.5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">A</div>
                    <KdsScreenMock
                      boardId={selectedBoard}
                      identifier={identifier as 'order' | 'guest'}
                      textSize={textSize}
                      agingOverrideSeconds={agingOverrideSeconds}
                      onHeaderClick={(k) => openOrderTypeInPanel(k)}
                      onTimerClick={cycleAgingStage}
                    />
                  </div>
                  <div className={`relative min-w-0 min-h-0 overflow-hidden border-2 ${activeSlot === 'B' ? 'border-foreground' : 'border-transparent'}`}>
                    <div className="absolute top-1 left-1 z-10 h-5 min-w-[20px] px-1.5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">B</div>
                    <KdsScreenMock
                      boardId={selectedBoardB}
                      identifier={identifier as 'order' | 'guest'}
                      textSize={textSize}
                      agingOverrideSeconds={agingOverrideSeconds}
                      onHeaderClick={(k) => openOrderTypeInPanel(k)}
                      onTimerClick={cycleAgingStage}
                    />
                  </div>
                </>
              ) : (
                <KdsScreenMock
                  boardId={selectedBoard}
                  identifier={identifier as 'order' | 'guest'}
                  textSize={textSize}
                  agingOverrideSeconds={agingOverrideSeconds}
                  onHeaderClick={(k) => openOrderTypeInPanel(k)}
                  onTimerClick={cycleAgingStage}
                />
              )}
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
              [data-ts-preview][data-density="low"] [data-ts-ticket] .space-y-1 > * + *,
              [data-ts-preview][data-density="low"] [data-ts-ticket] .space-y-1\\.5 > * + *,
              [data-ts-preview][data-density="low"] [data-ts-ticket] .space-y-2 > * + * { margin-top: .55rem; }
              [data-ts-preview][data-density="high"] [data-ts-ticket] .space-y-1 > * + *,
              [data-ts-preview][data-density="high"] [data-ts-ticket] .space-y-1\\.5 > * + *,
              [data-ts-preview][data-density="high"] [data-ts-ticket] .space-y-2 > * + * { margin-top: .1rem; }
              [data-ts-preview][data-density="high"] [data-ts-ticket] .py-2 { padding-top: .3rem; padding-bottom: .3rem; }
              [data-ts-preview][data-density="high"] [data-ts-ticket] .py-1\\.5 { padding-top: .2rem; padding-bottom: .2rem; }
              [data-ts-preview][data-density="low"] [data-ts-ticket] .py-1\\.5 { padding-top: .55rem; padding-bottom: .55rem; }
              [data-ts-preview][data-safety="muted"] [data-ts-ticket] { filter: saturate(.35); }
              [data-ts-preview][data-safety="bright"] [data-ts-ticket] { filter: saturate(1.35); }
              [data-ts-preview][data-safety="highlighted"] [data-ts-ticket] .text-\\[\\#C0392B\\],
              [data-ts-preview][data-safety="highlighted"] [data-ts-ticket] .bg-\\[\\#E84C3D\\],
              [data-ts-preview][data-safety="highlighted"] [data-ts-ticket] .bg-\\[\\#C0392B\\] { animation: ts-pulse 1.4s ease-in-out infinite; }
              @keyframes ts-pulse { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
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
                    onClick={() => (compareMode ? handleBoardClick(b.id) : setSelectedBoard(b.id))}
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

      {/* RIGHT: personalize, adaptive width */}
      <aside className="w-[210px] md:w-[230px] lg:w-[260px] xl:w-[300px] 2xl:w-[340px] shrink-0 rounded-2xl border border-border bg-card flex flex-col">
        <div className="px-4 pt-3 pb-0 border-b border-border space-y-2.5">
          <h2 className="text-sm font-bold text-text-primary">Personalize</h2>
          <UnderlineTabs
            value={tab}
            onChange={(v) => setTab(v as PanelTab)}
            options={[
              { value: 'display', label: 'Display' },
              { value: 'aging', label: 'Ticket Aging' },
              { value: 'order-type', label: 'Order Type' },
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
              <Field label="Text Size">
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
              <Field label="Ticket Identifier">
                <Segmented
                  value={identifier}
                  onChange={setIdentifier}
                  options={[
                    { value: 'order', label: 'Order Number' },
                    { value: 'guest', label: 'Guest Name' },
                  ]}
                />
              </Field>
              <Field label="Safety Emphasis">
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
                          <div className="text-[10px] font-semibold text-text-secondary mb-1">Text Color</div>
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
              <span className="text-xs text-text-secondary truncate">Full KDS Preview</span>
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
              className={`w-full h-full ${theme === 'dark' ? 'dark' : ''}`}
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


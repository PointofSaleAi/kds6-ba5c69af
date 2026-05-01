import { useState, useMemo } from 'react';
import { useOrderStore } from '@/hooks/use-order-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Monitor, Type, Rows3, Palette, Globe,
  Paintbrush, Bell, IdCard, SlidersHorizontal, ArrowLeft,
  StretchVertical, LayoutPanelLeft,
} from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { OrderCard } from '@/components/kds/OrderCard';
import { previewTicket } from '@/data/mock-preview-ticket';
import {
  SegmentedToggle, SwitchToggle, ValueText, useHashHighlight,
} from '@/components/settings/SettingsControls';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useLanguage, languageNames } from '@/hooks/use-language';
import { useBadgeVisibility } from '@/hooks/use-badge-visibility';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { getOverlayInsets } from '@/lib/dock-insets';
import { useKDSMode } from '@/hooks/use-kds-mode';
import LanguageSettings from '@/pages/LanguageSettings';
import StatusSettings from '@/pages/StatusSettings';
import OrderTypeColorsSettings from '@/pages/OrderTypeColorsSettings';
import InlineLanguageSettings from '@/components/kds/InlineLanguageSettings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';

export default function DisplaySettings() {
  const {
    textSize, setTextSize,
    ticketLayout, setTicketLayout,
    ticketHeaderLayout, setTicketHeaderLayout,
    ticketSpacing, setTicketSpacing,
  } = useKDSSettings();
  const { languageName, displayMode, primaryLang, secondaryLang } = useLanguage();
  const languageDisplay = displayMode === 'dual'
    ? `${languageNames[primaryLang]}, ${languageNames[secondaryLang]}`
    : languageName;
  const { showBadge, setShowBadge } = useBadgeVisibility();
  const { mode, setMode, stationCourse, setStationCourse } = useKDSMode();
  const { orders } = useOrderStore();
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const order of orders) {
      if (order.status === 'served') continue;
      for (const cg of order.courses) {
        for (const item of cg.items) {
          if (item.category && !item.isCompleted && !item.isCancelled) {
            cats.add(item.category);
          }
        }
      }
    }
    return Array.from(cats).sort();
  }, [orders]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [orderTypeColorsOpen, setOrderTypeColorsOpen] = useState(false);
  const [ticketSpacingOpen, setTicketSpacingOpen] = useState(false);
  const hash = useHashHighlight();
  const { layout: dockLayout, resetLayout } = useDockLayout();
  const insets = getOverlayInsets(dockLayout);
  const overlayStyle = { top: insets.top, bottom: insets.bottom, left: insets.left, right: insets.right } as React.CSSProperties;

  const spacingClass =
    ticketSpacing === 'Standard'
      ? 'ticket-spacing-standard'
      : ticketSpacing === 'Spacious'
        ? 'ticket-spacing-spacious'
        : 'ticket-spacing-compact';

  if (statusOpen) {
    return (
      <div
        className="fixed z-40 flex flex-col px-4 pt-4 pb-4 bg-surface-bg"
        style={overlayStyle}
      >
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-surface-bg">
          <div className="relative flex items-center justify-center pt-0 pb-4 px-0 shrink-0 bg-surface-bg">
            <button
              onClick={() => setStatusOpen(false)}
              className="absolute left-0 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Ticket aging rules</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-0 bg-surface-bg">
            <StatusSettings onBack={() => setStatusOpen(false)} hideHeader />
          </div>
        </div>
      </div>
    );
  }

  if (orderTypeColorsOpen) {
    return <OrderTypeColorsSettings onBack={() => setOrderTypeColorsOpen(false)} />;
  }

  if (languageOpen) {
    return (
      <div
        className="fixed z-40 flex flex-col px-4 pt-4 pb-4 bg-surface-bg"
        style={overlayStyle}
      >
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-surface-bg">
          <div className="relative flex items-center justify-center pt-0 pb-4 px-0 shrink-0 bg-surface-bg">
            <button
              onClick={() => setLanguageOpen(false)}
              className="absolute left-0 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Language</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-0 bg-surface-bg">
            <InlineLanguageSettings activeTab="language" />
          </div>
        </div>
      </div>
    );
  }

  if (ticketSpacingOpen) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="relative flex items-center justify-center px-6 pt-2 pb-3 shrink-0">
          <button
            onClick={() => setTicketSpacingOpen(false)}
            className="absolute left-0 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Ticket spacing</h1>
        </div>
        <div className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex gap-6 min-h-0">
            {/* LEFT: options */}
            <div className="w-[320px] shrink-0 flex flex-col gap-4 overflow-y-auto">
              <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
                Controls padding and row gap inside each ticket card.
              </p>
              <div className="grid gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--text-muted))' }}>
                    Ticket spacing
                  </span>
                  <SegmentedToggle
                    options={['Compact', 'Standard', 'Spacious']}
                    value={ticketSpacing}
                    onChange={(v) => setTicketSpacing(v as 'Compact' | 'Standard' | 'Spacious')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--text-muted))' }}>
                    Text size
                  </span>
                  <SegmentedToggle
                    options={['Compact', 'Standard', 'Large']}
                    value={textSize}
                    onChange={(v) => setTextSize(v as 'Compact' | 'Standard' | 'Large')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--text-muted))' }}>
                    Ticket layout
                  </span>
                  <SegmentedToggle
                    options={['Standard', 'Compact']}
                    value={ticketLayout === 'compact' ? 'Compact' : 'Standard'}
                    onChange={(v) => setTicketLayout(v === 'Compact' ? 'compact' : 'standard')}
                  />
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="w-px bg-border shrink-0" />

            {/* RIGHT: preview */}
            <div className="flex-1 min-w-0 flex flex-col">
              <p className="text-xs px-2 mb-1.5" style={{ color: 'hsl(var(--text-muted))' }}>
                Preview
              </p>
              <div className="flex-1 min-h-0 overflow-y-auto flex justify-center">
                <div
                  className={`w-[360px] max-w-full ${textSize === 'Compact' ? 'text-scale-compact' : textSize === 'Large' ? 'text-scale-large' : ''} ${spacingClass}`}
                >
                  <OrderCard order={previewTicket} layoutOverride={ticketLayout} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SectionHeaderCard
        icon={Monitor}
        iconColor={GROUP_COLOR.display}
        title="Display"
        shortDescription="Customize ticket density, layout, and language for the kitchen display."
        longDescription="Scale typography for legibility from across the line, choose ticket layout, and tune status aging colors to match your kitchen tempo."
      />

      <SettingsPill
        icon={Type}
        iconColor="#0A84FF"
        label="Text size"
        helper="Compact fits more tickets, Large is easier from a distance."
        right={<SegmentedToggle options={['Compact', 'Standard', 'Large']} value={textSize} onChange={(v) => setTextSize(v as 'Compact' | 'Standard' | 'Large')} />}
        highlighted={hash === 'text-size'}
      />

      <SettingsPill
        icon={StretchVertical}
        iconColor="#0E7460"
        label="Ticket spacing"
        helper="Controls padding and row gap inside each ticket card."
        right={<ValueText>{ticketSpacing}</ValueText>}
        onClick={() => setTicketSpacingOpen(true)}
        highlighted={hash === 'ticket-spacing'}
      />

      <SettingsPill
        icon={Rows3}
        iconColor="#7C3AED"
        label="Ticket layout"
        helper={ticketLayout === 'compact' ? 'Compact, item names only, tap to expand details.' : 'Standard, full details and modifiers always visible.'}
        right={
          <SegmentedToggle
            options={['Standard', 'Compact']}
            value={ticketLayout === 'compact' ? 'Compact' : 'Standard'}
            onChange={(v) => setTicketLayout(v === 'Compact' ? 'compact' : 'standard')}
          />
        }
        highlighted={hash === 'ticket-layout'}
      />

      <SettingsPill
        icon={Palette}
        iconColor="#F9900E"
        label="Status colors"
        helper="Tickets change color as they age. Adjust thresholds for your kitchen speed."
        onClick={() => setStatusOpen(true)}
        highlighted={hash === 'status-colors'}
      />

      <SettingsPill
        icon={Paintbrush}
        iconColor="#16A085"
        label="Order type colors"
        helper="Customize header colors for Dine In, Take Out, Delivery, and Banquet."
        onClick={() => setOrderTypeColorsOpen(true)}
        highlighted={hash === 'order-type-colors'}
      />

      <SettingsPill
        icon={Bell}
        iconColor="#E84C3D"
        label="Enable badge"
        helper="Show unread count badge on the sidebar icon."
        right={<SwitchToggle checked={showBadge} onChange={setShowBadge} />}
        highlighted={hash === 'enable-badge'}
      />

      <SettingsPill
        icon={IdCard}
        iconColor="#2980B9"
        label="Ticket Identifier"
        helper={ticketHeaderLayout === 'guest' ? 'Show guest name as primary card label.' : 'Show order number as primary card label.'}
        right={
          <SegmentedToggle
            options={['Order number', 'Guest name']}
            value={ticketHeaderLayout === 'guest' ? 'Guest name' : 'Order number'}
            onChange={(v) => setTicketHeaderLayout(v === 'Guest name' ? 'guest' : 'kitchen')}
          />
        }
        highlighted={hash === 'ticket-identifier'}
      />

      <SettingsPill
        icon={SlidersHorizontal}
        iconColor="#5E4DD8"
        label="Mode switcher"
        helper="KDS operational mode: Standard, Expo, or Station."
        right={
          <SegmentedToggle
            options={['Standard', 'Expo', 'Station']}
            value={mode === 'Prep' ? 'Station' : mode}
            onChange={(v) => setMode(v === 'Station' ? 'Prep' : (v as 'Standard' | 'Expo'))}
          />
        }
        highlighted={hash === 'mode-switcher'}
      />

      {mode === 'Prep' && (
        <div
          className="rounded-xl mb-1 px-4 py-3"
          style={{ background: 'hsl(var(--surface-card))' }}
        >
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: 'hsl(var(--text-muted))' }}
          >
            Station
          </div>
          {availableCategories.length === 0 ? (
            <p className="text-[12px]" style={{ color: 'hsl(var(--text-secondary))' }}>
              No stations available. Categories will appear once orders are loaded.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {availableCategories.map((cat) => {
                const active = stationCourse === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setStationCourse(active ? null : cat)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors min-h-[36px]"
                    style={{
                      background: active ? 'hsl(var(--brand-dark))' : 'hsl(var(--muted))',
                      color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--text-secondary))',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
          {stationCourse && (
            <p className="text-[12px] mt-2" style={{ color: 'hsl(var(--text-secondary))' }}>
              Showing station view for {stationCourse}.
            </p>
          )}
        </div>
      )}

      <SettingsPill
        icon={Globe}
        iconColor="#16A085"
        label="Language"
        helper="Display language for menu items, buttons, and notifications."
        right={<ValueText>{languageDisplay}</ValueText>}
        onClick={() => setLanguageOpen(true)}
        highlighted={hash === 'language'}
      />

      <SettingsPill
        icon={LayoutPanelLeft}
        iconColor="#6B7280"
        label="Reset chrome layout"
        helper="Move sidebar back to left, summary panel to right, and status bar to bottom."
        right={<ValueText>{`${dockLayout.mainSidebar} / ${dockLayout.summaryPanel} / ${dockLayout.bottomBar}`}</ValueText>}
        onClick={resetLayout}
      />


    </>
  );
}

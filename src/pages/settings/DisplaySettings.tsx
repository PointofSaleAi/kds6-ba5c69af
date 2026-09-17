import { useState, useMemo, useEffect } from 'react';
import { useOrderStore } from '@/hooks/use-order-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Monitor, Type, Rows3, Palette, Languages,
  Paintbrush, Bell, IdCard, SlidersHorizontal, ArrowLeft, Zap,
  StretchVertical, LayoutPanelLeft, LayoutGrid,
} from 'lucide-react';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { OrderCard } from '@/components/kds/OrderCard';
import { OrderCardV1 } from '@/components/kds/variants/OrderCardV1';
import { OrderCardV2 } from '@/components/kds/variants/OrderCardV2';
import { OrderCardV3 } from '@/components/kds/variants/OrderCardV3';
import { OrderCardV4 } from '@/components/kds/variants/OrderCardV4';
import { OrderCardV5 } from '@/components/kds/variants/OrderCardV5';
import { previewTicket } from '@/data/mock-preview-ticket';
import {
  SegmentedToggle, SwitchToggle, ValueText, useHashHighlight,
} from '@/components/settings/SettingsControls';
import { useKDSSettings, KDSSettingsPreviewScope } from '@/hooks/use-kds-settings';
import { useLanguage, languageNames } from '@/hooks/use-language';
import { useBadgeVisibility } from '@/hooks/use-badge-visibility';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { useKDSMode } from '@/hooks/use-kds-mode';
import LanguageSettings from '@/pages/LanguageSettings';
import StatusSettings from '@/pages/StatusSettings';
import OrderTypeColorsSettings from '@/pages/OrderTypeColorsSettings';
import InlineLanguageSettings from '@/components/kds/InlineLanguageSettings';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';
import { getCardVariantForTicketsRoute, readStoredTicketsRoute, writeStoredTicketsRoute } from '@/lib/ticket-card-variant';
import { TicketStudioSkeleton } from '@/components/kds/TicketStudioSkeleton';
import { TicketBoard } from '@/components/kds/glass/TicketBoard';
import { PreviewFitBox } from '@/components/kds/PreviewFitBox';
import { GlassBoardProvider } from '@/components/kds/glass/glass-board-context';


export default function DisplaySettings() {
  const {
    ticketHeaderStyle, setTicketHeaderStyle,
    getRouteSetting, setRouteSetting,
    reducedMotion, setReducedMotion,
  } = useKDSSettings();
  const [ticketsRoute, setTicketsRoute] = useState<import('@/hooks/use-kds-settings').TicketsRouteKey>(
    () => readStoredTicketsRoute('v3'),
  );
  const selectedCardVariant = getCardVariantForTicketsRoute(ticketsRoute);
  // Read values scoped to the currently-selected preview route
  const textSize = getRouteSetting(ticketsRoute, 'textSize');
  const ticketSpacing = getRouteSetting(ticketsRoute, 'ticketSpacing');
  const ticketLayout = getRouteSetting(ticketsRoute, 'ticketLayout');
  const ticketHeaderLayout = getRouteSetting(ticketsRoute, 'ticketHeaderLayout');
  const setTextSize = (v: any) => setRouteSetting(ticketsRoute, 'textSize', v);
  const setTicketSpacing = (v: any) => setRouteSetting(ticketsRoute, 'ticketSpacing', v);
  const setTicketLayout = (v: any) => setRouteSetting(ticketsRoute, 'ticketLayout', v);
  const setTicketHeaderLayout = (v: any) => setRouteSetting(ticketsRoute, 'ticketHeaderLayout', v);
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
  const [languageFromHash, setLanguageFromHash] = useState(false);
  const [orderTypeColorsOpen, setOrderTypeColorsOpen] = useState(false);
  const [ticketSpacingOpen, setTicketSpacingOpen] = useState(false);
  const [ticketStudioOpen, setTicketStudioOpen] = useState(false);
  const [stationPickerOpen, setStationPickerOpen] = useState(false);
  const hash = useHashHighlight();
  useEffect(() => {
    if (hash === 'language') {
      setLanguageOpen(true);
      setLanguageFromHash(true);
    }
  }, [hash]);
  const handleLanguageBack = () => {
    if (languageFromHash) {
      setLanguageFromHash(false);
      setLanguageOpen(false);
      window.history.back();
    } else {
      setLanguageOpen(false);
    }
  };
  const { layout: dockLayout, resetLayout } = useDockLayout();

  const spacingClass =
    ticketSpacing === 'Standard'
      ? 'ticket-spacing-standard'
      : ticketSpacing === 'Spacious'
        ? 'ticket-spacing-spacious'
        : 'ticket-spacing-compact';

  if (statusOpen) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="relative flex items-center justify-center px-2 pt-2 pb-3 shrink-0 min-h-[52px]">
            <button
              onClick={() => setStatusOpen(false)}
              className="absolute left-2 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="w-full pl-12 sm:pl-0 text-lg sm:text-2xl font-bold text-text-primary text-center leading-tight">Ticket Aging Rules</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden px-2 pb-2">
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
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="relative flex items-center justify-center px-2 pt-2 pb-3 shrink-0">
            <button
              onClick={handleLanguageBack}
              className="absolute left-2 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="w-full pl-12 sm:pl-0 text-lg sm:text-2xl font-bold text-text-primary text-center leading-tight">Language</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden px-2 pb-2">
            <InlineLanguageSettings activeTab="language" />
          </div>
        </div>
      </div>
    );
  }

  if (ticketSpacingOpen) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="relative flex items-center justify-center px-2 pt-2 pb-3 shrink-0">
          <button
            onClick={() => setTicketSpacingOpen(false)}
            className="absolute left-2 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="w-full pl-12 sm:pl-0 text-lg sm:text-2xl font-bold text-text-primary text-center leading-tight">Ticket Layout</h1>
        </div>
        <div className="flex-1 px-2 pb-2 overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row gap-2 min-h-0 overflow-y-auto lg:overflow-hidden">
            {/* LEFT: options */}
            <div className="w-full lg:flex-1 lg:basis-0 min-w-0 flex flex-col gap-4 lg:overflow-y-auto">
              <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
                Controls padding, row gap, text size, layout density, and the primary ticket identifier.
              </p>
              <div className="grid gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wide" style={{ color: 'hsl(var(--text-muted))' }}>
                    Layout
                  </span>
                  {(() => {
                    const layoutOptions = [
                      { value: 'v2', label: 'Section list' },
                      { value: 'v3', label: 'Standard layout' },
                      { value: 'v3-lite', label: 'Priority View' },
                      { value: 'v4', label: 'Detailed grid' },
                      { value: 'v6', label: 'Itemized cards' },
                      { value: 'glass', label: 'Glass View' },
                    ] as { value: import('@/hooks/use-kds-settings').TicketsRouteKey; label: string }[];
                    return (
                      <select
                        value={ticketsRoute}
                        onChange={(e) => {
                          const nextRoute = e.target.value as import('@/hooks/use-kds-settings').TicketsRouteKey;
                          setTicketsRoute(nextRoute);
                          writeStoredTicketsRoute(nextRoute);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))]"
                        style={{
                          background: 'hsl(var(--muted))',
                          color: 'hsl(var(--text-primary))',
                          borderColor: 'hsl(var(--border))',
                          minHeight: 36,
                        }}
                      >
                        {layoutOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wide" style={{ color: 'hsl(var(--text-muted))' }}>
                    Spacing
                  </span>
                  <SegmentedToggle
                    options={['Compact', 'Standard', 'Spacious']}
                    value={ticketSpacing}
                    onChange={(v) => setTicketSpacing(v as 'Compact' | 'Standard' | 'Spacious')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wide" style={{ color: 'hsl(var(--text-muted))' }}>
                    Text size
                  </span>
                  <SegmentedToggle
                    options={['Compact', 'Standard', 'Large']}
                    value={textSize}
                    onChange={(v) => setTextSize(v as 'Compact' | 'Standard' | 'Large')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wide" style={{ color: 'hsl(var(--text-muted))' }}>
                    Appearance
                  </span>
                  <SegmentedToggle
                    options={['Compact', 'Standard', 'Header']}
                    value={ticketLayout === 'compact' ? 'Compact' : ticketLayout === 'header' ? 'Header' : 'Standard'}
                    onChange={(v) => setTicketLayout(v === 'Compact' ? 'compact' : v === 'Header' ? 'header' : 'standard')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wide" style={{ color: 'hsl(var(--text-muted))' }}>
                    Identifier
                  </span>
                  <SegmentedToggle
                    options={['Order number', 'Guest name']}
                    value={ticketHeaderLayout === 'guest' ? 'Guest name' : 'Order number'}
                    onChange={(v) => setTicketHeaderLayout(v === 'Guest name' ? 'guest' : 'kitchen')}
                  />
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="hidden lg:block w-px bg-border shrink-0" />

            {/* RIGHT: preview */}
            <div className="w-full lg:flex-1 lg:basis-0 min-w-0 min-h-[360px] flex flex-col">
              <p className="text-xs px-2 mb-1.5" style={{ color: 'hsl(var(--text-muted))' }}>
                Preview
              </p>
              <PreviewFitBox>
                {ticketsRoute === 'glass' ? (
                  <div className="w-[360px] max-w-full flex justify-center">
                    <GlassBoardProvider>
                      <TicketBoard
                        maxTickets={1}
                        pinnedTicketId="t23"
                        viewModeOverride="grid"
                        identifier={ticketHeaderLayout === 'guest' ? 'guest' : 'order'}
                        scaleFactor={textSize === 'Compact' ? 0.9 : textSize === 'Large' ? 1.1 : 1}
                        spacing={ticketSpacing as 'Compact' | 'Standard' | 'Spacious'}
                        appearance={ticketLayout === 'compact' ? 'compact' : ticketLayout === 'header' ? 'header' : 'standard'}
                      />
                    </GlassBoardProvider>
                  </div>
                ) : (
                <div
                  className={`w-[360px] max-w-full ${textSize === 'Compact' ? 'text-scale-compact' : textSize === 'Large' ? 'text-scale-large' : ''} ${spacingClass} ${selectedCardVariant === 'v5' ? 'v5-route' : ''}`}
                >
                  <KDSSettingsPreviewScope route={ticketsRoute}>
                    {selectedCardVariant === 'v1' ? (
                      <OrderCardV1 order={previewTicket} />
                    ) : selectedCardVariant === 'v2' ? (
                      <OrderCardV2 order={previewTicket} />
                    ) : selectedCardVariant === 'v3' ? (
                      <OrderCardV3 order={previewTicket} />
                    ) : selectedCardVariant === 'v4' ? (
                      <OrderCardV4 order={previewTicket} />
                    ) : selectedCardVariant === 'v5' ? (
                      <OrderCardV5 order={previewTicket} />
                    ) : (
                      <OrderCard order={previewTicket} layoutOverride={ticketLayout} legacyActions={ticketsRoute === 'Default'} />
                    )}
                  </KDSSettingsPreviewScope>
                </div>
                )}
              </PreviewFitBox>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (ticketStudioOpen) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="relative flex items-center justify-center px-2 pt-2 pb-3 shrink-0">
            <button
              onClick={() => setTicketStudioOpen(false)}
              className="absolute left-2 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="w-full pl-12 sm:pl-0 text-lg sm:text-2xl font-bold text-text-primary text-center leading-tight">Ticket Studio</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden px-2 pb-2 flex flex-col">
            <TicketStudioSkeleton />
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
        icon={StretchVertical}
        iconColor="#0E7460"
        label="Ticket Layout"
        helper="Controls spacing, text size, layout density, and ticket identifier."
        right={<ValueText>{ticketLayout === 'compact' ? 'Compact' : ticketLayout === 'header' ? 'Header' : 'Standard'}</ValueText>}
        onClick={() => setTicketSpacingOpen(true)}
        highlighted={hash === 'ticket-spacing' || hash === 'ticket-layout' || hash === 'text-size' || hash === 'ticket-identifier'}
      />

      <SettingsPill
        icon={LayoutGrid}
        iconColor="#5E4DD8"
        label="Ticket Studio"
        helper="Browse named board designs and preview before applying to a station."
        onClick={() => setTicketStudioOpen(true)}
        highlighted={hash === 'ticket-studio'}
      />

      <SettingsPill
        icon={Palette}
        iconColor="#F9900E"
        label="Status Colors"
        helper="Tickets change color as they age. Adjust thresholds for your kitchen speed."
        onClick={() => setStatusOpen(true)}
        highlighted={hash === 'status-colors'}
      />

      <SettingsPill
        icon={Paintbrush}
        iconColor="#16A085"
        label="Order Type Colors"
        helper="Customize header colors for Dine In, Take Out, Delivery, and Banquet."
        onClick={() => setOrderTypeColorsOpen(true)}
        highlighted={hash === 'order-type-colors'}
      />

      <SettingsPill
        icon={Bell}
        iconColor="#E84C3D"
        label="Enable Badge"
        helper="Show unread count badge on the sidebar icon."
        right={<SwitchToggle checked={showBadge} onChange={setShowBadge} />}
        highlighted={hash === 'enable-badge'}
      />

      <SettingsPill
        icon={Zap}
        iconColor="#7F8C8D"
        label="Reduced Motion"
        helper="Disable ticket, product row, and timer pill blinking animations."
        right={<SwitchToggle checked={reducedMotion} onChange={setReducedMotion} />}
        highlighted={hash === 'reduced-motion'}
      />



      <SettingsPill
        icon={SlidersHorizontal}
        iconColor="#5E4DD8"
        label="Mode Switcher"
        helper={
          mode === 'Prep' && stationCourse
            ? `Station mode · ${stationCourse}`
            : 'KDS operational mode: Standard, Expo, or Station.'
        }
        right={
          <SegmentedToggle
            options={['Standard', 'Expo', 'Station']}
            value={mode === 'Prep' ? 'Station' : mode}
            onChange={(v) => {
              if (v === 'Station') {
                setMode('Prep');
                setStationPickerOpen(true);
              } else {
                setMode(v as 'Standard' | 'Expo');
              }
            }}
          />
        }
        highlighted={hash === 'mode-switcher'}
      />

      <Dialog open={stationPickerOpen} onOpenChange={setStationPickerOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{ background: 'hsl(var(--surface-card))' }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: 'hsl(var(--text-primary))' }}>
              Choose station
            </DialogTitle>
            <DialogDescription style={{ color: 'hsl(var(--text-secondary))' }}>
              Filter the KDS to show only products for one station. Tap a category to apply.
            </DialogDescription>
          </DialogHeader>

          {availableCategories.length === 0 ? (
            <p className="text-[13px]" style={{ color: 'hsl(var(--text-secondary))' }}>
              No stations available. Categories will appear once orders are loaded.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {availableCategories.map((cat) => {
                const active = stationCourse === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setStationCourse(active ? null : cat);
                      if (!active) setStationPickerOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg text-[13px] font-bold transition-colors min-h-[44px]"
                    style={{
                      background: active ? 'hsl(var(--brand-dark))' : 'hsl(var(--muted))',
                      color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--text-primary))',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {stationCourse && (
            <button
              onClick={() => setStationCourse(null)}
              className="mt-2 text-[12px] font-semibold self-start hover:underline"
              style={{ color: 'hsl(var(--text-secondary))' }}
            >
              Clear station filter
            </button>
          )}
        </DialogContent>
      </Dialog>

      <SettingsPill
        icon={Languages}
        iconColor="#16A085"
        label="Language"
        helper="Display language for menu products, buttons, and notifications."
        right={<ValueText>{languageDisplay}</ValueText>}
        onClick={() => setLanguageOpen(true)}
        highlighted={hash === 'language'}
      />

      <SettingsPill
        icon={LayoutPanelLeft}
        iconColor="#6B7280"
        label="Reset Chrome Layout"
        helper="Move sidebar back to left, summary panel to right, and status bar to bottom."
        right={<ValueText>{`${dockLayout.mainSidebar} / ${dockLayout.summaryPanel} / ${dockLayout.bottomBar}`}</ValueText>}
        onClick={resetLayout}
      />


    </>
  );
}

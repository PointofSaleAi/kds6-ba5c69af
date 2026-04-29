import { useState } from 'react';
import {
  Monitor, Type, Rows3, Palette, Globe,
  Paintbrush, Bell, IdCard, SlidersHorizontal, ArrowLeft,
  StretchVertical,
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
  const { mode, setMode } = useKDSMode();
  const [statusOpen, setStatusOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [orderTypeColorsOpen, setOrderTypeColorsOpen] = useState(false);
  const [ticketSpacingOpen, setTicketSpacingOpen] = useState(false);
  const hash = useHashHighlight();

  const spacingClass =
    ticketSpacing === 'Standard'
      ? 'ticket-spacing-standard'
      : ticketSpacing === 'Spacious'
        ? 'ticket-spacing-spacious'
        : 'ticket-spacing-compact';

  if (statusOpen) {
    return (
      <div
        className="fixed top-0 right-0 bottom-0 left-20 z-40 flex flex-col py-0 px-4 bg-surface-bg"
      >
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-transparent">
          <div className="relative flex items-center justify-center pt-4 pb-4 px-0 shrink-0 bg-transparent">
            <button
              onClick={() => setStatusOpen(false)}
              className="absolute left-0 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Ticket Aging Rules</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden px-0 pb-6 bg-transparent">
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
        className="fixed top-0 right-0 left-20 z-30 flex flex-col p-4"
        style={{ background: 'hsl(var(--surface-bg))', bottom: '52px' }}
      >
        <div
          className="flex-1 min-h-0 rounded-3xl overflow-hidden flex flex-col"
          style={{
            background: 'hsl(var(--surface-card))',
            boxShadow: '0 1px 2px hsl(0 0% 0% / 0.04)',
          }}
        >
          <div className="relative flex items-center justify-center px-6 py-4 shrink-0">
            <button
              onClick={() => setLanguageOpen(false)}
              className="absolute left-6 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Language</h1>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden px-6 pb-6">
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
          <h1 className="text-2xl font-bold text-text-primary">Ticket Spacing</h1>
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
                    Ticket Spacing
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
        label="Ticket Spacing"
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
        icon={IdCard}
        iconColor="#2980B9"
        label="Ticket Identifier"
        helper={ticketHeaderLayout === 'guest' ? 'Show guest name as primary card label.' : 'Show order number as primary card label.'}
        right={
          <SegmentedToggle
            options={['Order Number', 'Guest Name']}
            value={ticketHeaderLayout === 'guest' ? 'Guest Name' : 'Order Number'}
            onChange={(v) => setTicketHeaderLayout(v === 'Guest Name' ? 'guest' : 'kitchen')}
          />
        }
        highlighted={hash === 'ticket-identifier'}
      />

      <SettingsPill
        icon={SlidersHorizontal}
        iconColor="#5E4DD8"
        label="Mode Switcher"
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

      <SettingsPill
        icon={Globe}
        iconColor="#16A085"
        label="Language"
        helper="Display language for menu items, buttons, and notifications."
        right={<ValueText>{languageDisplay}</ValueText>}
        onClick={() => setLanguageOpen(true)}
        highlighted={hash === 'language'}
      />

      
    </>
  );
}
